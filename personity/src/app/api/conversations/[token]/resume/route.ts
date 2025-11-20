import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const supabase = await createClient();
    
    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('ConversationSession')
      .select('*')
      .eq('sessionToken', token)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is paused
    if (session.status !== 'PAUSED') {
      return NextResponse.json(
        { error: 'Session is not paused' },
        { status: 400 }
      );
    }
    
    // Check if session is abandoned (paused for more than 7 days)
    const pausedDate = new Date(session.lastMessageAt);
    const now = new Date();
    const daysSincePaused = (now.getTime() - pausedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePaused > 7) {
      // Mark as abandoned
      await supabase
        .from('ConversationSession')
        .update({
          status: 'ABANDONED',
        })
        .eq('id', session.id);
      
      return NextResponse.json(
        { error: 'Session has expired (inactive for more than 7 days)' },
        { status: 410 }
      );
    }
    
    // Resume session
    await supabase
      .from('ConversationSession')
      .update({
        status: 'ACTIVE',
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', session.id);
    
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
    
    return NextResponse.json({
      success: true,
      data: {
        sessionToken: session.sessionToken,
        exchanges: conversation.exchanges,
        currentState: session.currentState,
      },
    });
  } catch (error) {
    console.error('Resume conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
