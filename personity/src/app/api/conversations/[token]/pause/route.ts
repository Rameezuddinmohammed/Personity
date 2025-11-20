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
      .select('*, Survey(shortUrl)')
      .eq('sessionToken', token)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is active
    if (session.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Session is not active' },
        { status: 400 }
      );
    }
    
    // Update session status to PAUSED
    await supabase
      .from('ConversationSession')
      .update({
        status: 'PAUSED',
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', session.id);
    
    // Generate resume URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://personity.vercel.app';
    const resumeUrl = `${appUrl}/s/${(session.Survey as any).shortUrl}/resume?token=${token}`;
    
    return NextResponse.json({
      success: true,
      data: {
        resumeUrl,
      },
    });
  } catch (error) {
    console.error('Pause conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
