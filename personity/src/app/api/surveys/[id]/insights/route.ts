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

    // Aggregate persona insights from all responses
    // First get all conversation IDs for this survey
    const { data: sessions } = await supabase
      .from('ConversationSession')
      .select('id')
      .eq('surveyId', surveyId)
      .eq('status', 'COMPLETED');

    const sessionIds = sessions?.map(s => s.id) || [];

    // Then get conversations for those sessions
    const { data: conversations } = await supabase
      .from('Conversation')
      .select('id')
      .in('sessionId', sessionIds);

    const conversationIds = conversations?.map(c => c.id) || [];

    // Finally get persona insights from response analysis
    // ONLY include quality responses (score >= 6 and not flagged)
    const { data: responses } = await supabase
      .from('ResponseAnalysis')
      .select('personaInsights')
      .in('conversationId', conversationIds)
      .gte('qualityScore', 6)
      .eq('isFlagged', false)
      .not('personaInsights', 'is', null);

    // Aggregate persona data
    const personaData = {
      painLevel: { low: 0, medium: 0, high: 0 },
      experience: { novice: 0, intermediate: 0, expert: 0 },
      sentiment: { positive: 0, neutral: 0, negative: 0 },
      readiness: { cold: 0, warm: 0, hot: 0 },
      clarity: { low: 0, medium: 0, high: 0 },
    };

    if (responses && responses.length > 0) {
      responses.forEach((response: any) => {
        const persona = response.personaInsights;
        if (persona) {
          if (persona.painLevel && persona.painLevel in personaData.painLevel) {
            personaData.painLevel[persona.painLevel as keyof typeof personaData.painLevel]++;
          }
          if (persona.experience && persona.experience in personaData.experience) {
            personaData.experience[persona.experience as keyof typeof personaData.experience]++;
          }
          if (persona.sentiment && persona.sentiment in personaData.sentiment) {
            personaData.sentiment[persona.sentiment as keyof typeof personaData.sentiment]++;
          }
          if (persona.readiness && persona.readiness in personaData.readiness) {
            personaData.readiness[persona.readiness as keyof typeof personaData.readiness]++;
          }
          if (persona.clarity && persona.clarity in personaData.clarity) {
            personaData.clarity[persona.clarity as keyof typeof personaData.clarity]++;
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
        objective: survey.objective,
        status: survey.status,
      },
      analysis,
      personaData,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
