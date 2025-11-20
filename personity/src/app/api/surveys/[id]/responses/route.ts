import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/surveys/[id]/responses
 * 
 * Fetch all response analyses for a survey
 * Requirements: 11.4, 11.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch survey
    const { data: survey, error: surveyError } = await supabase
      .from('Survey')
      .select('id, title, userId')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (survey.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get all completed sessions for this survey
    const { data: sessions, error: sessionsError } = await supabase
      .from('ConversationSession')
      .select('id')
      .eq('surveyId', surveyId)
      .eq('status', 'COMPLETED');

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        success: true,
        survey: {
          id: survey.id,
          title: survey.title,
        },
        responses: [],
      });
    }

    const sessionIds = sessions.map((s) => s.id);

    // Get conversations for these sessions
    const { data: conversations, error: conversationsError } = await supabase
      .from('Conversation')
      .select('id, sessionId')
      .in('sessionId', sessionIds);

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({
        success: true,
        survey: {
          id: survey.id,
          title: survey.title,
        },
        responses: [],
      });
    }

    const conversationIds = conversations.map((c) => c.id);

    // Get analyses for these conversations
    const { data: analyses, error: analysesError } = await supabase
      .from('ResponseAnalysis')
      .select('*')
      .in('conversationId', conversationIds)
      .order('createdAt', { ascending: false });

    if (analysesError) {
      console.error('Error fetching analyses:', analysesError);
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
      },
      responses: analyses || [],
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
