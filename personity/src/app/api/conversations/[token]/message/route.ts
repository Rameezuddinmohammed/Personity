import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, calculateCost, AIMessage } from '@/lib/ai/azure-openai';
import { loadConversationHistory, needsSummarization } from '@/lib/ai/conversation-history';
import { identifyDiscussedTopics, areAllTopicsCovered } from '@/lib/ai/topic-tracker';
import { checkResponseQuality, generateReEngagementMessage, trackLowQualityResponse } from '@/lib/ai/quality-detection';
import { checkForSpam, flagSession } from '@/lib/fraud/spam-detection';
import { autoBanIfNeeded } from '@/lib/fraud/ip-banning';
import { conversationRateLimit, getClientIp } from '@/lib/rate-limit';
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
    
    // Check response quality
    const qualityCheck = await checkResponseQuality(message, exchanges);
    
    let shouldReEngage = false;
    let reEngagementMessage: string | undefined;
    
    if (qualityCheck.isLowQuality && qualityCheck.shouldReEngage) {
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
    
    // Check if history needs summarization
    let processedExchanges = exchanges;
    if (needsSummarization(exchanges, masterPrompt)) {
      // Summarize history to prevent token overflow
      const generateSummary = async (messages: AIMessage[]) => {
        const summaryResponse = await generateAIResponse(messages, {
          temperature: 0.5,
          maxTokens: 150,
        });
        return summaryResponse.content;
      };
      
      processedExchanges = await loadConversationHistory(
        exchanges,
        masterPrompt,
        generateSummary
      );
    }
    
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: masterPrompt,
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
    
    // Generate AI response
    const aiResponse = await generateAIResponse(messages, {
      temperature: 0.7,
      maxTokens: 200,
    });
    
    const cost = calculateCost(aiResponse.usage);
    
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
        content: aiResponse.content,
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
      input: currentTokenUsage.input + aiResponse.usage.inputTokens,
      output: currentTokenUsage.output + aiResponse.usage.outputTokens,
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
    
    // Update session state with topic tracking
    const currentState = session.currentState as {
      exchangeCount: number;
      topicsCovered: string[];
    };
    
    // Identify newly discussed topics
    const surveyTopics = ((session.Survey as any).topics as string[]) || [];
    const discussedTopics = await identifyDiscussedTopics(
      updatedExchanges,
      surveyTopics
    );
    
    // Merge with previously covered topics (unique)
    const allCoveredTopics = Array.from(
      new Set([...currentState.topicsCovered, ...discussedTopics])
    );
    
    const updatedState = {
      exchangeCount: currentState.exchangeCount + 1,
      topicsCovered: allCoveredTopics,
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
      tokensInput: aiResponse.usage.inputTokens,
      tokensOutput: aiResponse.usage.outputTokens,
      cost,
    });
    
    // Calculate progress (simple: based on exchange count)
    const surveySettings = (session.Survey as any).settings as {
      stopCondition: string;
      maxQuestions?: number;
    };
    
    let progress = 0;
    if (surveySettings.stopCondition === 'questions' && surveySettings.maxQuestions) {
      progress = Math.min(
        (updatedState.exchangeCount / surveySettings.maxQuestions) * 100,
        100
      );
    } else {
      // For topics_covered, use a simple heuristic
      const topics = ((session.Survey as any).topics as string[]) || [];
      progress = Math.min(
        (updatedState.topicsCovered.length / topics.length) * 100,
        100
      );
    }
    
    // Determine if conversation should end
    let shouldEnd = false;
    let summary: string | undefined;
    
    if (surveySettings.stopCondition === 'questions' && surveySettings.maxQuestions) {
      shouldEnd = updatedState.exchangeCount >= surveySettings.maxQuestions;
    } else {
      // For topics_covered, check if all topics are covered AND AI signals completion
      const allTopicsCovered = areAllTopicsCovered(updatedState.topicsCovered, surveyTopics);
      
      // Use AI to detect if conversation is complete
      try {
        const completionCheckMessages: AIMessage[] = [
          {
            role: 'system',
            content: `You are analyzing a research conversation to determine if it should end.

Respond with ONLY "COMPLETE" or "CONTINUE".

Respond "COMPLETE" if the AI interviewer:
- Is wrapping up with a summary
- Is thanking the respondent and ending
- Is disqualifying the respondent (e.g., "not the best fit", "not qualified")
- Has clearly signaled the conversation is over
- Is saying goodbye or closing remarks

Respond "CONTINUE" if:
- The AI is asking another question
- The conversation is mid-flow
- More information is being gathered`,
          },
          {
            role: 'user',
            content: `Context:
- Topics covered: ${updatedState.topicsCovered.length} of ${surveyTopics.length}
- All topics covered: ${allTopicsCovered ? 'Yes' : 'No'}
- Exchange count: ${updatedState.exchangeCount}

Latest AI response:
"${aiResponse.content}"

Should this conversation end now? Respond with only COMPLETE or CONTINUE.`,
          },
        ];
        
        const completionCheck = await generateAIResponse(completionCheckMessages, {
          temperature: 0.3,
          maxTokens: 10,
        });
        
        const aiSaysComplete = completionCheck.content.trim().toUpperCase() === 'COMPLETE';
        
        // Trust the AI's decision - end if it says the conversation is complete
        // This handles both natural completion AND disqualification
        shouldEnd = aiSaysComplete;
        
        if (shouldEnd) {
          summary = aiResponse.content;
        }
      } catch (error) {
        console.error('Error checking completion:', error);
        // Fallback: only end if all topics covered (conservative approach)
        shouldEnd = allTopicsCovered;
        if (shouldEnd) {
          summary = aiResponse.content;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        aiResponse: aiResponse.content,
        progress,
        shouldEnd,
        summary,
        topicsCovered: updatedState.topicsCovered,
      },
    });
  } catch (error) {
    console.error('Message handling error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
