import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, calculateCost, AIMessage } from '@/lib/ai/azure-openai';
import { nanoid } from 'nanoid';
import { checkUsageLimit } from '@/lib/usage/limits';

interface RouteContext {
  params: Promise<{
    shortUrl: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { shortUrl } = await context.params;
    const supabase = await createClient();
    
    // Fetch survey by short URL
    const { data: survey, error: surveyError } = await supabase
      .from('Survey')
      .select('*')
      .eq('shortUrl', shortUrl)
      .eq('status', 'ACTIVE')
      .single();
    
    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found or inactive' },
        { status: 404 }
      );
    }
    
    // Check usage limit for survey creator
    const usageCheck = await checkUsageLimit(survey.userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.reason,
          usageLimit: {
            currentUsage: usageCheck.currentUsage,
            limit: usageCheck.limit,
            plan: usageCheck.plan,
          }
        },
        { status: 403 }
      );
    }
    
    // Extract metadata from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Get country code from Vercel headers (if available)
    const countryCode = request.headers.get('x-vercel-ip-country') || null;
    
    // Check if IP is banned
    const { data: bannedIp } = await supabase
      .from('BannedIp')
      .select('*')
      .eq('ipAddress', ipAddress)
      .single();
    
    if (bannedIp) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Generate unique session token
    const sessionToken = nanoid(32);
    
    // Create conversation session
    const { data: session, error: sessionError } = await supabase
      .from('ConversationSession')
      .insert({
        surveyId: survey.id,
        sessionToken,
        status: 'ACTIVE',
        currentState: {
          exchangeCount: 0,
          topicsCovered: [],
        },
        ipAddress,
        userAgent,
        countryCode,
      })
      .select()
      .single();
    
    if (sessionError || !session) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }
    
    // Generate initial AI greeting using structured response (two-message opening)
    const { generateStructuredConversationResponse } = await import('@/lib/ai/structured-response');
    
    const initialMessages: AIMessage[] = [
      {
        role: 'system',
        content: survey.masterPrompt,
      },
      {
        role: 'user',
        content: '[START_CONVERSATION]',
      },
    ];
    
    const structuredResponse = await generateStructuredConversationResponse(initialMessages, {
      temperature: 0.7,
      maxTokens: 300,
    });
    
    // Estimate token usage (since structured response doesn't return usage)
    const estimatedInputTokens = Math.ceil(survey.masterPrompt.length / 4);
    const estimatedOutputTokens = Math.ceil(structuredResponse.message.length / 4);
    const cost = (estimatedInputTokens * 0.0000025) + (estimatedOutputTokens * 0.00001);
    
    // Handle two-message opening
    const exchanges = [];
    if (structuredResponse.messages && structuredResponse.messages.length > 0) {
      // Multi-message opening (intro + first question)
      for (const msg of structuredResponse.messages) {
        exchanges.push({
          role: 'assistant',
          content: msg.message,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Single message fallback
      exchanges.push({
        role: 'assistant',
        content: structuredResponse.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Track API usage
    await supabase.from('ApiUsage').insert({
      context: `session:${session.id}`,
      provider: 'azure',
      model: 'gpt-4o',
      tokensInput: estimatedInputTokens,
      tokensOutput: estimatedOutputTokens,
      cost,
    });
    
    // Create initial conversation record
    await supabase.from('Conversation').insert({
      sessionId: session.id,
      exchanges,
      durationSeconds: 0,
      tokenUsage: {
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        cost,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sessionToken: session.sessionToken,
        initialMessages: exchanges.map(ex => ex.content),
      },
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
