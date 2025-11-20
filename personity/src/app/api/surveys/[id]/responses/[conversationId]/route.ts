import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/surveys/[id]/responses/[conversationId]
 * 
 * Fetch detailed response analysis with full transcript and navigation
 * Requirements: 11.6
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; conversationId: string }> }
) {
  try {
    const { id: surveyId, conversationId } = await params;
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

    // Fetch conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('Conversation')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Fetch the session to verify it belongs to this survey
    const { data: session, error: sessionError } = await supabase
      .from('ConversationSession')
      .select('surveyId')
      .eq('id', conversation.sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify conversation belongs to this survey
    if (session.surveyId !== surveyId) {
      return NextResponse.json(
        { error: 'Conversation does not belong to this survey' },
        { status: 403 }
      );
    }

    // Fetch response analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('ResponseAnalysis')
      .select('*')
      .eq('conversationId', conversationId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Get all completed sessions for navigation
    const { data: sessions, error: sessionsError } = await supabase
      .from('ConversationSession')
      .select('id')
      .eq('surveyId', surveyId)
      .eq('status', 'COMPLETED')
      .order('completedAt', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions for navigation:', sessionsError);
    }

    // Get all conversations for these sessions
    const sessionIds = sessions?.map((s) => s.id) || [];
    const { data: allConversations, error: allConversationsError } = await supabase
      .from('Conversation')
      .select('id, sessionId, createdAt')
      .in('sessionId', sessionIds)
      .order('createdAt', { ascending: false });

    if (allConversationsError) {
      console.error('Error fetching conversations for navigation:', allConversationsError);
    }

    // Build navigation info
    let navigation = null;
    if (allConversations && allConversations.length > 0) {
      const currentIndex = allConversations.findIndex((c) => c.id === conversationId);
      if (currentIndex !== -1) {
        navigation = {
          prevId: currentIndex > 0 ? allConversations[currentIndex - 1].id : null,
          nextId: currentIndex < allConversations.length - 1 ? allConversations[currentIndex + 1].id : null,
          currentIndex: currentIndex + 1,
          totalCount: allConversations.length,
        };
      }
    }

    // Build response object
    const response = {
      id: analysis.id,
      conversationId: analysis.conversationId,
      summary: analysis.summary,
      keyThemes: analysis.keyThemes as string[],
      sentiment: analysis.sentiment,
      topQuotes: analysis.topQuotes as Array<{ quote: string; context: string }>,
      painPoints: analysis.painPoints as string[],
      opportunities: analysis.opportunities as string[],
      qualityScore: analysis.qualityScore,
      isFlagged: analysis.isFlagged,
      createdAt: analysis.createdAt,
      conversation: {
        exchanges: conversation.exchanges as Array<{
          role: string;
          content: string;
          timestamp: string;
        }>,
        durationSeconds: conversation.durationSeconds,
      },
    };

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
      },
      response,
      navigation,
    });
  } catch (error) {
    console.error('Error fetching response detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response detail' },
      { status: 500 }
    );
  }
}
