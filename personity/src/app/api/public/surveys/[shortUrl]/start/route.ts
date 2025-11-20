import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, calculateCost, AIMessage } from '@/lib/ai/azure-openai';
import { nanoid } from 'nanoid';

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
    
    // Generate initial AI greeting using master prompt
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
    
    const aiResponse = await generateAIResponse(initialMessages, {
      temperature: 0.7,
      maxTokens: 200,
    });
    
    const cost = calculateCost(aiResponse.usage);
    
    // Track API usage
    await supabase.from('ApiUsage').insert({
      context: `session:${session.id}`,
      provider: 'azure',
      model: 'gpt-4o',
      tokensInput: aiResponse.usage.inputTokens,
      tokensOutput: aiResponse.usage.outputTokens,
      cost,
    });
    
    // Create initial conversation record
    await supabase.from('Conversation').insert({
      sessionId: session.id,
      exchanges: [
        {
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
        },
      ],
      durationSeconds: 0,
      tokenUsage: {
        input: aiResponse.usage.inputTokens,
        output: aiResponse.usage.outputTokens,
        cost,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        sessionToken: session.sessionToken,
        initialMessage: aiResponse.content,
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
