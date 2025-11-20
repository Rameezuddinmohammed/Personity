import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateResponsesCSV } from '@/lib/export/csv-generator';

/**
 * GET /api/surveys/[id]/export/csv
 * 
 * Generate and download CSV export of survey responses
 * Requirements: 12.4, 12.5
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
      .select('id, title, userId, mode')
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

    // Fetch all completed sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('ConversationSession')
      .select('id')
      .eq('surveyId', surveyId)
      .eq('status', 'COMPLETED');

    if (sessionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { error: 'No completed responses available for export' },
        { status: 400 }
      );
    }

    const sessionIds = sessions.map((s) => s.id);

    // Get conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('Conversation')
      .select('id, sessionId')
      .in('sessionId', sessionIds);

    if (conversationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json(
        { error: 'No conversation data available for export' },
        { status: 400 }
      );
    }

    const conversationIds = conversations.map((c) => c.id);

    // Get analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('ResponseAnalysis')
      .select('*')
      .in('conversationId', conversationIds)
      .order('createdAt', { ascending: false });

    if (analysesError) {
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json(
        { error: 'No analysis data available for export' },
        { status: 400 }
      );
    }

    // Generate CSV
    const csvData = generateResponsesCSV({
      surveyMode: (survey as any).mode,
      responses: analyses.map((r) => ({
        timestamp: r.createdAt,
        summary: r.summary,
        keyThemes: r.keyThemes as string[],
        sentiment: r.sentiment,
        qualityScore: r.qualityScore,
        painPoints: r.painPoints as string[],
        opportunities: r.opportunities as string[],
        topQuotes: r.topQuotes as any,
      })),
    });

    // Return CSV as downloadable file
    const fileName = `survey-${surveyId}-responses-${Date.now()}.csv`;
    
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    );
  }
}
