import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLatestAggregateAnalysis } from '@/lib/ai/aggregate-analysis';

/**
 * GET /api/surveys/[id]/insights
 * 
 * Fetch insights (aggregate analysis) for a survey
 * Requirements: 11.1, 11.2, 11.3
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
      .select('id, title, objective, status, userId')
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

    // Fetch latest aggregate analysis
    const analysis = await getLatestAggregateAnalysis(surveyId);

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
        objective: survey.objective,
        status: survey.status,
      },
      analysis,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
