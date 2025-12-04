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
import { logConversation } from '@/lib/logger';
import { QUALITY_THRESHOLDS } from '@/lib/constants';
import type { SessionState } from '@/types/conversation';
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
    
    // Extract survey data early for use in detectors
    const survey = session.Survey as any;
    const surveyTopics = (survey.topics as string[]) || [];
    const surveySettings = survey.settings as {
      length: 'quick' | 'standard' | 'deep';
      tone: 'professional' | 'friendly' | 'casual';
      stopCondition: 'questions' | 'topics_covered';
      maxQuestions?: number;
    };
    
    const masterPrompt = survey.masterPrompt;
    
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
    
    // Check for crisis indicators first (highest priority)
    const { detectCrisisIndicators } = await import('@/lib/ai/sensitive-content-detector');
    const crisisCheck = detectCrisisIndicators(message);
    
    if (crisisCheck.isCrisis) {
      // End conversation immediately with crisis resources
      await supabase
        .from('ConversationSession')
        .update({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        })
        .eq('id', session.id);
      
      return NextResponse.json({
        success: true,
        data: {
          aiResponse: crisisCheck.message,
          shouldEnd: true,
          reason: 'crisis_detected',
          isCrisis: true,
        },
      });
    }
    
    // Check for sensitive content
    const { detectSensitiveContent } = await import('@/lib/ai/sensitive-content-detector');
    const sensitiveCheck = detectSensitiveContent(message, survey.objective);
    
    if (sensitiveCheck.isSensitive) {
      // Acknowledge gently and redirect
      const updatedExchanges = [
        ...exchanges,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: sensitiveCheck.gentleResponse!,
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
          aiResponse: sensitiveCheck.gentleResponse,
          progress: 0,
          shouldEnd: false,
          isSensitive: true,
        },
      });
    }
    
    // Check for off-topic responses
    const { isOffTopic, isAskingAIQuestion, generateAIQuestionResponse } = await import('@/lib/ai/topic-detector');
    const lastAIMessage = exchanges.filter(ex => ex.role === 'assistant').pop()?.content;
    
    // Check if user is asking AI a question
    if (isAskingAIQuestion(message)) {
      const redirectResponse = generateAIQuestionResponse(lastAIMessage);
      
      const updatedExchanges = [
        ...exchanges,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: redirectResponse,
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
          aiResponse: redirectResponse,
          progress: 0,
          shouldEnd: false,
          isRedirect: true,
        },
      });
    }
    
    // Check if response is off-topic
    const topicCheck = isOffTopic(message, survey.objective, surveyTopics, lastAIMessage);
    
    if (topicCheck.isOffTopic) {
      const updatedExchanges = [
        ...exchanges,
        {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: topicCheck.redirectMessage!,
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
          aiResponse: topicCheck.redirectMessage,
          progress: 0,
          shouldEnd: false,
          isOffTopic: true,
        },
      });
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
    
    // Build conversation state from exchanges (survey variables already declared above)
    const conversationState = extractConversationState(exchanges, surveyTopics);
    
    // CRITICAL: Inject ending phase from currentState if it exists
    // This ensures the AI knows which step of the ending protocol it's on
    const currentState = session.currentState as {
      exchangeCount: number;
      topicsCovered: string[];
      lowQualityCount?: number;
      hasReEngaged?: boolean;
      isFlagged?: boolean;
      endingPhase?: 'none' | 'reflection_asked' | 'summary_shown' | 'confirmed';
      persona?: any;
    };
    
    if (currentState?.endingPhase) {
      conversationState.endingPhase = currentState.endingPhase;
      logConversation.debug('Ending phase loaded from state', { phase: currentState.endingPhase });
    }
    
    // Suggest intelligent follow-up based on user response
    const currentTopic = conversationState.coveredTopics[conversationState.coveredTopics.length - 1];
    const topicDepth = conversationState.topicDepth[currentTopic || ''] || 0;
    const followUpSuggestion = suggestFollowUp(message, {
      currentTopic,
      topicDepth,
      previousFollowUps: 0, // TODO: Track this in state
    });
    
    logConversation.debug('Follow-up suggestion', { reason: followUpSuggestion.reason, priority: followUpSuggestion.priority });
    
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
      logConversation.debug('Compressing conversation history');
      const { compressedExchanges, summary } = await compressConversationHistory(
        exchanges,
        surveyTopics
      );
      processedExchanges = compressedExchanges;
      compressionSummary = summary;
      logConversation.debug('Compression complete', { from: exchanges.length, to: compressedExchanges.length });
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
    
    // DISABLED: Contradiction detection has too many false positives
    // TODO: Improve algorithm before re-enabling
    // The current implementation compares unrelated statements and confuses users
    /*
    const userResponses = exchanges.filter(ex => ex.role === 'user').map(ex => ex.content);
    const contradiction = detectContradiction(message, userResponses);
    
    if (shouldAskClarification(contradiction, message)) {
      // ... clarification logic ...
    }
    */
    
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
    logConversation.debug('AI quality check', {
      score: aiQualityCheck.score,
      passed: aiQualityCheck.passed,
      issues: aiQualityCheck.issues,
    });
    
    // Auto-regenerate if quality is too low - ONE retry only
    if (!aiQualityCheck.passed && aiQualityCheck.score < QUALITY_THRESHOLDS.MIN_QUALITY_SCORE) {
      logConversation.debug('Low quality score, regenerating', { score: aiQualityCheck.score });
      
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
      
      logConversation.debug('Regenerated quality score', { score: regeneratedQualityCheck.score });
      
      // Use regenerated response if it's better
      if (regeneratedQualityCheck.score > aiQualityCheck.score) {
        structuredResponse.message = regeneratedResponse.message;
        structuredResponse.shouldEnd = regeneratedResponse.shouldEnd;
        structuredResponse.reason = regeneratedResponse.reason;
        structuredResponse.summary = regeneratedResponse.summary;
        structuredResponse.persona = regeneratedResponse.persona;
        aiQualityCheck = regeneratedQualityCheck;
        logConversation.debug('Using regenerated response (improved)');
      } else {
        logConversation.debug('Keeping original response (regeneration did not improve)');
      }
    }
    
    // For cost calculation, we need to make a regular call to get usage stats
    // This is a limitation - we'll estimate based on message length
    const estimatedInputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
    const estimatedOutputTokens = Math.ceil(structuredResponse.message.length / 4);
    // o4-mini pricing: $1.10/1M input, $4.40/1M output
    const cost = (estimatedInputTokens * 0.0000011) + (estimatedOutputTokens * 0.0000044);
    
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
    // Note: currentState already declared earlier, reuse it
    
    // Extract updated conversation state after this exchange
    const updatedConversationState = extractConversationState(updatedExchanges, surveyTopics);
    
    // Merge persona insights from AI response if provided
    if (structuredResponse.persona) {
      Object.assign(updatedConversationState.persona, structuredResponse.persona);
    }
    
    // Build enhanced state for storage (ending phase will be set later)
    const updatedState = {
      exchangeCount: currentState.exchangeCount + 1,
      topicsCovered: updatedConversationState.coveredTopics,
      lowQualityCount: currentState.lowQualityCount || 0,
      hasReEngaged: currentState.hasReEngaged || false,
      isFlagged: updatedConversationState.isFlagged || currentState.isFlagged || false,
      persona: updatedConversationState.persona,
      keyInsights: updatedConversationState.keyInsights,
      endingPhase: 'none' as 'none' | 'reflection_asked' | 'summary_shown' | 'confirmed', // Will be updated below
    };
    
    // Track API usage
    await supabase.from('ApiUsage').insert({
      context: `session:${session.id}`,
      provider: 'azure',
      model: 'o4-mini',
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
    const currentEndingPhase = currentState?.endingPhase || 'none';
    let newEndingPhase = currentEndingPhase;
    
    // Detect if AI asked reflection question (STEP 1) - More flexible patterns
    const messageLower = structuredResponse.message.toLowerCase();
    const askedReflection = 
      (messageLower.includes('anything') && messageLower.includes('didn\'t ask')) ||
      (messageLower.includes('anything') && messageLower.includes('should have')) ||
      (messageLower.includes('anything') && messageLower.includes('should know')) ||
      (messageLower.includes('anything') && messageLower.includes('missed')) ||
      (messageLower.includes('is there') && messageLower.includes('didn\'t ask'));
    
    // Detect if AI showed summary (STEP 2) - More flexible patterns
    const hasBullets = structuredResponse.message.includes('•') || 
                      structuredResponse.message.includes('-') || 
                      structuredResponse.message.includes('1.') ||
                      structuredResponse.message.includes('2.');
    
    const hasSummaryLanguage = 
      messageLower.includes('let me make sure') ||
      messageLower.includes('did i capture') ||
      messageLower.includes('here\'s what') ||
      messageLower.includes('to sum up') ||
      messageLower.includes('summary') ||
      messageLower.includes('here\'s what i heard') ||
      (messageLower.includes('you') && (messageLower.includes('mentioned') || messageLower.includes('said')));
    
    const showedSummary = hasBullets && hasSummaryLanguage;
    
    // Update ending phase based on AI response
    if (askedReflection && currentEndingPhase === 'none') {
      newEndingPhase = 'reflection_asked';
      logConversation.debug('Ending phase: STEP 1 - Reflection question asked');
    } else if (showedSummary && currentEndingPhase === 'reflection_asked') {
      newEndingPhase = 'summary_shown';
      logConversation.debug('Ending phase: STEP 2 - Summary shown');
    } else if (structuredResponse.shouldEnd && structuredResponse.reason === 'completed' && currentEndingPhase === 'summary_shown') {
      newEndingPhase = 'confirmed';
      logConversation.debug('Ending phase: STEP 3 - User confirmed, ending conversation');
    }
    
    // CRITICAL: Save ending phase to state so it persists across turns
    updatedState.endingPhase = newEndingPhase;
    
    // Update the session state immediately so next turn has access to it
    await supabase
      .from('ConversationSession')
      .update({
        currentState: updatedState,
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', session.id);
    
    // VALIDATION: Check if AI response matches expected step
    let validationError = null;
    
    // CRITICAL FIX: If AI skipped Step 2, force regeneration with explicit summary
    if (currentEndingPhase === 'reflection_asked' && !showedSummary) {
      validationError = 'AI should have shown summary at Step 2 but did not';
      logConversation.warn('Ending phase validation failed', { error: validationError });
      logConversation.debug('Forcing summary generation');
      
      // Build key insights from conversation state
      const insights = updatedConversationState.keyInsights.length > 0 
        ? updatedConversationState.keyInsights 
        : ['User shared their perspective on the topic'];
      
      // Force regenerate with explicit summary instruction
      const forcedSummaryMessages: AIMessage[] = [
        ...messages,
        {
          role: 'system',
          content: `CRITICAL ERROR CORRECTION: You must show a summary now (Step 2 of 3).

The user just responded to your reflection question. You CANNOT skip to "Thanks!" yet.

REQUIRED FORMAT (copy this structure):
"Let me make sure I got this right:

${insights.map((insight, i) => `• ${insight.substring(0, 100)}`).join('\n')}

Did I capture that accurately?"

Return ONLY this JSON:
{"message": "[summary above with bullets]", "shouldEnd": false}

DO NOT:
- Say "Thanks!" (that's Step 3)
- Set shouldEnd to true
- Skip the bullet points`,
        },
      ];
      
      try {
        const forcedResponse = await generateStructuredConversationResponse(
          forcedSummaryMessages,
          { temperature: 0.5, maxTokens: 400 }
        );
        
        // Use forced response instead
        structuredResponse.message = forcedResponse.message;
        structuredResponse.shouldEnd = false;
        newEndingPhase = 'summary_shown';
        updatedState.endingPhase = 'summary_shown';
        
        logConversation.debug('Successfully generated forced summary');
      } catch (error) {
        logConversation.error('Failed to generate forced summary', error);
        // Fallback: manually construct summary
        structuredResponse.message = `Let me make sure I got this right:\n\n${insights.map(i => `• ${i}`).join('\n')}\n\nDid I capture that accurately?`;
        structuredResponse.shouldEnd = false;
        newEndingPhase = 'summary_shown';
        updatedState.endingPhase = 'summary_shown';
      }
    }
    
    if (currentEndingPhase === 'reflection_asked' && structuredResponse.shouldEnd) {
      validationError = 'AI tried to end at Step 2 (should be false)';
      logConversation.warn('Ending phase validation failed', { error: validationError });
      // Force shouldEnd to false
      structuredResponse.shouldEnd = false;
    }
    
    if (currentEndingPhase === 'summary_shown' && !structuredResponse.shouldEnd) {
      validationError = 'AI should have ended at Step 3 but did not';
      logConversation.warn('Ending phase validation failed', { error: validationError });
      // Force ending if user confirmed
      if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('correct') || 
          message.toLowerCase().includes('right') || message.toLowerCase().includes('accurate')) {
        logConversation.debug('User confirmed summary, forcing end');
        structuredResponse.shouldEnd = true;
        structuredResponse.reason = 'completed';
        structuredResponse.summary = structuredResponse.message;
        structuredResponse.persona = updatedConversationState.persona;
        newEndingPhase = 'confirmed';
        updatedState.endingPhase = 'confirmed';
      }
    }
    
    // Determine if conversation should end
    // Use the AI's explicit signal from structured response
    let shouldEnd = structuredResponse.shouldEnd;
    let summary = structuredResponse.summary || structuredResponse.message;
    
    // Only allow ending if proper protocol followed (unless disqualified/max questions)
    if (shouldEnd && structuredResponse.reason === 'completed') {
      if (newEndingPhase !== 'confirmed' && newEndingPhase !== 'summary_shown') {
        logConversation.warn('AI tried to end without following 3-step protocol, preventing end');
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
    logConversation.error('Message handling error', error);
    
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
