import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, AIMessage } from '@/lib/ai/azure-openai';
import { loadConversationHistory, needsSummarization } from '@/lib/ai/conversation-history';
import { checkResponseQuality, generateReEngagementMessage, trackLowQualityResponse } from '@/lib/ai/quality-detection';
import { checkForSpam, flagSession } from '@/lib/fraud/spam-detection';
import { autoBanIfNeeded } from '@/lib/fraud/ip-banning';
import { conversationRateLimit, getClientIp } from '@/lib/rate-limit';
import { generateDynamicPrompt, extractConversationState } from '@/lib/ai/master-prompt';
import { validateResponseQuality } from '@/lib/ai/response-quality-validator';
import { detectContradiction, shouldAskClarification } from '@/lib/ai/contradiction-detector';
import { compressConversationHistory, needsCompression } from '@/lib/ai/conversation-compression';
import { suggestFollowUp, generateFollowUpInstruction } from '@/lib/ai/follow-up-logic';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const supabase = await createClient();
    
    // Rate limiting with Vercel KV
    const ipAddress = getClientIp(request);
    const { success, limit, remaining, reset } = await conversationRateLimit.limit(ipAddress);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }
    
    const { message } = validation.data;
    
    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('ConversationSession')
      .select('*, Survey(*)')
      .eq('sessionToken', token)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check session status
    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Session is not active' },
        { status: 400 }
      );
    }
    
    // Fetch conversation history
    const { data: conversation, error: conversationError } = await supabase
      .from('Conversation')
      .select('*')
      .eq('sessionId', session.id)
      .single();
    
    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Build message history for AI
    const exchanges = conversation.exchanges as Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
    
    const masterPrompt = (session.Survey as any).masterPrompt;
    
    // Check for spam and abuse patterns
    const spamCheck = await checkForSpam(ipAddress, exchanges, message);
    
    if (spamCheck.isSpam) {
      // Flag the session
      await flagSession(session.id, spamCheck.reason || 'Spam detected');
      
      // Auto-ban if needed
      if (spamCheck.shouldBan) {
        await autoBanIfNeeded(ipAddress);
      }
      
      return NextResponse.json(
        { 
          error: 'Your session has been flagged for suspicious activity.',
          flagged: true,
        },
        { status: 403 }
      );
    }
    
    // Check response quality (user input)
    const userQualityCheck = await checkResponseQuality(message, exchanges);
    
    let shouldReEngage = false;
    let reEngagementMessage: string | undefined;
    
    if (userQualityCheck.isLowQuality && userQualityCheck.shouldReEngage) {
      const currentState = session.currentState as {
        exchangeCount: number;
        topicsCovered: string[];
        lowQualityCount?: number;
        hasReEngaged?: boolean;
      };
      
      // Track low-quality response
      const updatedQualityState = trackLowQualityResponse(currentState);
      
      // Flag session if too many low-quality responses
      if (updatedQualityState.shouldFlag) {
        await flagSession(session.id, 'Too many low-quality responses (3+)');
        
        // Check if IP should be banned
        await autoBanIfNeeded(ipAddress);
      }
      
      // Re-engage once if not already done
      if (!updatedQualityState.hasReEngaged && updatedQualityState.lowQualityCount < 3) {
        shouldReEngage = true;
        
        // Get last AI question
        const lastAIMessage = exchanges
          .filter(ex => ex.role === 'assistant')
          .pop()?.content || '';
        
        reEngagementMessage = await generateReEngagementMessage(lastAIMessage);
        
        // Update state to mark re-engagement
        await supabase
          .from('ConversationSession')
          .update({
            currentState: {
              ...currentState,
              hasReEngaged: true,
              lowQualityCount: updatedQualityState.lowQualityCount,
            },
          })
          .eq('id', session.id);
      } else {
        // Update low-quality count without re-engaging
        await supabase
          .from('ConversationSession')
          .update({
            currentState: {
              ...currentState,
              lowQualityCount: updatedQualityState.lowQualityCount,
              isFlagged: updatedQualityState.shouldFlag,
            },
          })
          .eq('id', session.id);
      }
    }
    
    // If re-engaging, return re-engagement message without calling AI
    if (shouldReEngage && reEngagementMessage) {
      // Update conversation with user message and re-engagement
      const updatedExchanges = [
        ...exchanges,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: reEngagementMessage,
          timestamp: new Date().toISOString(),
        },
      ];
      
      await supabase
        .from('Conversation')
        .update({
          exchanges: updatedExchanges,
        })
        .eq('id', conversation.id);
      
      await supabase
        .from('ConversationSession')
        .update({
          lastMessageAt: new Date().toISOString(),
        })
        .eq('id', session.id);
      
      return NextResponse.json({
        success: true,
        data: {
          aiResponse: reEngagementMessage,
          progress: 0, // Don't update progress for re-engagement
          shouldEnd: false,
          isReEngagement: true,
        },
      });
    }
    
    // Extract conversation state for dynamic prompt
    const survey = session.Survey as any;
    const surveyTopics = (survey.topics as string[]) || [];
    const surveySettings = survey.settings as {
      length: 'quick' | 'standard' | 'deep';
      tone: 'professional' | 'friendly' | 'casual';
      stopCondition: 'questions' | 'topics_covered';
      maxQuestions?: number;
    };
    
    // Build conversation state from exchanges
    const conversationState = extractConversationState(exchanges, surveyTopics);
    
    // Suggest intelligent follow-up based on user response
    const currentTopic = conversationState.coveredTopics[conversationState.coveredTopics.length - 1];
    const topicDepth = conversationState.topicDepth[currentTopic || ''] || 0;
    const followUpSuggestion = suggestFollowUp(message, {
      currentTopic,
      topicDepth,
      previousFollowUps: 0, // TODO: Track this in state
    });
    
    console.log('[Follow-Up]', followUpSuggestion.reason, '- Priority:', followUpSuggestion.priority);
    
    // Parse survey config for dynamic prompt
    const surveyConfig = {
      objective: survey.objective,
      context: survey.context || {},
      documentContext: survey.documentContext,
      topics: surveyTopics,
      settings: surveySettings,
      mode: survey.mode || 'EXPLORATORY_GENERAL',
    };
    
    // Generate dynamic system prompt with current state
    let dynamicPrompt = generateDynamicPrompt(surveyConfig, conversationState);
    
    // Add follow-up instruction if suggested
    if (followUpSuggestion.shouldFollowUp) {
      dynamicPrompt += `\n\n${generateFollowUpInstruction(followUpSuggestion, currentTopic)}`;
    }
    
    // Check if conversation needs compression (after 10+ exchanges)
    let processedExchanges = exchanges;
    let compressionSummary = null;
    
    if (needsCompression(exchanges)) {
      console.log('[Compression] Compressing conversation history...');
      const { compressedExchanges, summary } = await compressConversationHistory(
        exchanges,
        surveyTopics
      );
      processedExchanges = compressedExchanges;
      compressionSummary = summary;
      console.log('[Compression] Compressed from', exchanges.length, 'to', compressedExchanges.length, 'exchanges');
    }
    
    // Build messages with DYNAMIC system prompt (regenerated each turn)
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: dynamicPrompt, // ← Dynamic prompt with state
      },
      ...processedExchanges.map((ex) => ({
        role: ex.role as 'user' | 'assistant' | 'system',
        content: ex.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];
    
    // Check for contradictions in user responses
    const userResponses = exchanges.filter(ex => ex.role === 'user').map(ex => ex.content);
    const contradiction = detectContradiction(message, userResponses);
    
    // If contradiction detected, ask clarifying question instead of continuing
    if (shouldAskClarification(contradiction, message)) {
      // Return clarifying question immediately
      const clarifyingExchange = [
        ...exchanges,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: contradiction.clarifyingQuestion,
          timestamp: new Date().toISOString(),
        },
      ];
      
      await supabase
        .from('Conversation')
        .update({
          exchanges: clarifyingExchange,
        })
        .eq('id', conversation.id);
      
      await supabase
        .from('ConversationSession')
        .update({
          lastMessageAt: new Date().toISOString(),
        })
        .eq('id', session.id);
      
      return NextResponse.json({
        success: true,
        data: {
          aiResponse: contradiction.clarifyingQuestion,
          progress: 0, // Don't update progress for clarification
          shouldEnd: false,
          isClarification: true,
        },
      });
    }
    
    // Generate AI response with structured output
    const { generateStructuredConversationResponse } = await import('@/lib/ai/structured-response');
    
    const structuredResponse = await generateStructuredConversationResponse(messages, {
      temperature: 0.7,
      maxTokens: 300,
    });
    
    // Validate AI response quality (ListenLabs-level check)
    const previousAIQuestions = exchanges
      .filter(ex => ex.role === 'assistant')
      .map(ex => ex.content);
    
    let aiQualityCheck = validateResponseQuality(
      structuredResponse.message,
      message,
      previousAIQuestions,
      surveyConfig.mode || 'EXPLORATORY_GENERAL'
    );
    
    // Log quality score for monitoring
    console.log(`[AI Quality Check] Score: ${aiQualityCheck.score}/10`, {
      passed: aiQualityCheck.passed,
      issues: aiQualityCheck.issues,
      suggestions: aiQualityCheck.suggestions,
    });
    
    // Auto-regenerate if quality is too low (score < 7) - ONE retry only
    if (!aiQualityCheck.passed && aiQualityCheck.score < 7) {
      console.log('[AI Quality] Low score detected, regenerating response...');
      
      // Add quality feedback to the prompt
      const regenerationMessages: AIMessage[] = [
        ...messages,
        {
          role: 'assistant',
          content: structuredResponse.message,
        },
        {
          role: 'system',
          content: `QUALITY CHECK FAILED (Score: ${aiQualityCheck.score}/10)

Issues detected:
${aiQualityCheck.issues.map(i => `- ${i}`).join('\n')}

Suggestions:
${aiQualityCheck.suggestions.map(s => `- ${s}`).join('\n')}

Generate an improved response that addresses these issues. Remember:
1. Reference specific words from their last response
2. Keep it to 1-2 sentences maximum
3. Avoid banned phrases
4. Ask a clear, direct question`,
        },
      ];
      
      // Regenerate response
      const regeneratedResponse = await generateStructuredConversationResponse(regenerationMessages, {
        temperature: 0.7,
        maxTokens: 300,
      });
      
      // Validate regenerated response
      const regeneratedQualityCheck = validateResponseQuality(
        regeneratedResponse.message,
        message,
        previousAIQuestions,
        surveyConfig.mode || 'EXPLORATORY_GENERAL'
      );
      
      console.log(`[AI Quality] Regenerated score: ${regeneratedQualityCheck.score}/10`);
      
      // Use regenerated response if it's better
      if (regeneratedQualityCheck.score > aiQualityCheck.score) {
        structuredResponse.message = regeneratedResponse.message;
        structuredResponse.shouldEnd = regeneratedResponse.shouldEnd;
        structuredResponse.reason = regeneratedResponse.reason;
        structuredResponse.summary = regeneratedResponse.summary;
        structuredResponse.persona = regeneratedResponse.persona;
        aiQualityCheck = regeneratedQualityCheck;
        console.log('[AI Quality] Using regenerated response (improved)');
      } else {
        console.log('[AI Quality] Keeping original response (regeneration did not improve)');
      }
    }
    
    // For cost calculation, we need to make a regular call to get usage stats
    // This is a limitation - we'll estimate based on message length
    const estimatedInputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    const estimatedOutputTokens = Math.ceil(structuredResponse.message.length / 4);
    const cost = (estimatedInputTokens * 0.0000025) + (estimatedOutputTokens * 0.00001);
    
    // Update conversation with new exchanges
    const updatedExchanges = [
      ...exchanges,
      {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: structuredResponse.message,
        timestamp: new Date().toISOString(),
      },
    ];
    
    // Calculate updated token usage
    const currentTokenUsage = conversation.tokenUsage as {
      input: number;
      output: number;
      cost: number;
    };
    
    const updatedTokenUsage = {
      input: currentTokenUsage.input + estimatedInputTokens,
      output: currentTokenUsage.output + estimatedOutputTokens,
      cost: currentTokenUsage.cost + cost,
    };
    
    // Update conversation in database
    await supabase
      .from('Conversation')
      .update({
        exchanges: updatedExchanges,
        tokenUsage: updatedTokenUsage,
      })
      .eq('id', conversation.id);
    
    // Update session state with enhanced tracking
    const currentState = session.currentState as {
      exchangeCount: number;
      topicsCovered: string[];
      lowQualityCount?: number;
      hasReEngaged?: boolean;
      isFlagged?: boolean;
    };
    
    // Extract updated conversation state after this exchange
    const updatedConversationState = extractConversationState(updatedExchanges, surveyTopics);
    
    // Merge persona insights from AI response if provided
    if (structuredResponse.persona) {
      Object.assign(updatedConversationState.persona, structuredResponse.persona);
    }
    
    // Build enhanced state for storage
    const updatedState = {
      exchangeCount: currentState.exchangeCount + 1,
      topicsCovered: updatedConversationState.coveredTopics,
      lowQualityCount: currentState.lowQualityCount || 0,
      hasReEngaged: currentState.hasReEngaged || false,
      isFlagged: updatedConversationState.isFlagged || currentState.isFlagged || false,
      persona: updatedConversationState.persona,
      keyInsights: updatedConversationState.keyInsights,
    };
    
    await supabase
      .from('ConversationSession')
      .update({
        currentState: updatedState,
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', session.id);
    
    // Track API usage
    await supabase.from('ApiUsage').insert({
      context: `session:${session.id}`,
      provider: 'azure',
      model: 'gpt-4o',
      tokensInput: estimatedInputTokens,
      tokensOutput: estimatedOutputTokens,
      cost,
    });
    
    // Calculate progress based on state
    let progress = 0;
    if (surveySettings.stopCondition === 'questions' && surveySettings.maxQuestions) {
      progress = Math.min(
        (updatedState.exchangeCount / surveySettings.maxQuestions) * 100,
        100
      );
    } else {
      // For topics_covered, use actual covered topics from state
      progress = Math.min(
        (updatedState.topicsCovered.length / surveyTopics.length) * 100,
        100
      );
    }
    
    // Track ending phase for 3-step protocol
    const currentEndingPhase = (updatedState as any).endingPhase || 'none';
    let newEndingPhase = currentEndingPhase;
    
    // Detect if AI asked reflection question
    const askedReflection = structuredResponse.message.toLowerCase().includes('anything important i didn\'t ask') ||
                           structuredResponse.message.toLowerCase().includes('anything i missed') ||
                           structuredResponse.message.toLowerCase().includes('anything else i should');
    
    // Detect if AI showed summary
    const showedSummary = structuredResponse.message.includes('•') || 
                         structuredResponse.message.toLowerCase().includes('let me make sure') ||
                         structuredResponse.message.toLowerCase().includes('did i capture');
    
    if (askedReflection && currentEndingPhase === 'none') {
      newEndingPhase = 'reflection_asked';
      console.log('[Ending Phase] STEP 1: Reflection question asked');
    } else if (showedSummary && currentEndingPhase === 'reflection_asked') {
      newEndingPhase = 'summary_shown';
      console.log('[Ending Phase] STEP 2: Summary shown');
    } else if (structuredResponse.shouldEnd && currentEndingPhase === 'summary_shown') {
      newEndingPhase = 'confirmed';
      console.log('[Ending Phase] STEP 3: User confirmed, ending conversation');
    }
    
    // Update ending phase in state
    (updatedState as any).endingPhase = newEndingPhase;
    
    // Determine if conversation should end
    // Use the AI's explicit signal from structured response
    let shouldEnd = structuredResponse.shouldEnd;
    let summary = structuredResponse.summary || structuredResponse.message;
    
    // Only allow ending if proper protocol followed (unless disqualified/max questions)
    if (shouldEnd && structuredResponse.reason === 'completed') {
      if (newEndingPhase !== 'confirmed' && newEndingPhase !== 'summary_shown') {
        console.warn('[Ending Phase] AI tried to end without following 3-step protocol. Preventing end.');
        shouldEnd = false;
        summary = '';
      }
    }
    
    // Override: Always end if max questions reached
    if (surveySettings.stopCondition === 'questions' && surveySettings.maxQuestions) {
      if (updatedState.exchangeCount >= surveySettings.maxQuestions) {
        shouldEnd = true;
        
        // If no summary provided, generate one from key insights
        if (!summary || summary === structuredResponse.message) {
          const insights = updatedConversationState.keyInsights;
          if (insights && insights.length > 0) {
            summary = `Thank you for your time! Here's what we discussed:\n\n${insights.map((insight, i) => `• ${insight}`).join('\n')}\n\nMaximum questions reached.`;
          } else {
            summary = 'Maximum questions reached. Thank you for sharing your thoughts with us!';
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        aiResponse: structuredResponse.message,
        progress,
        shouldEnd,
        summary,
        reason: structuredResponse.reason,
        persona: structuredResponse.persona,
        topicsCovered: updatedState.topicsCovered,
      },
    });
  } catch (error: any) {
    console.error('Message handling error:', error);
    
    // Handle content filter errors
    if (error?.message === 'CONTENT_FILTERED') {
      return NextResponse.json(
        { 
          error: 'Your message contains inappropriate content. Please keep responses professional and on-topic.',
          contentFiltered: true,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
