import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's surveys with response counts
    const { data: surveys, error: surveysError } = await supabase
      .from('Survey')
      .select(`
        id,
        title,
        objective,
        status,
        shortUrl,
        createdAt,
        updatedAt,
        ConversationSession (
          id,
          status
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (surveysError) {
      console.error('Error fetching surveys:', surveysError);
      return NextResponse.json(
        { error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }

    // Calculate response counts and completion rates
    const surveysWithStats = surveys.map((survey: any) => {
      const sessions = survey.ConversationSession || [];
      const totalResponses = sessions.length;
      const completedResponses = sessions.filter(
        (s: any) => s.status === 'COMPLETED'
      ).length;
      const completionRate = totalResponses > 0 
        ? Math.round((completedResponses / totalResponses) * 100) 
        : 0;

      return {
        id: survey.id,
        title: survey.title,
        objective: survey.objective,
        status: survey.status,
        shortUrl: survey.shortUrl,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        responseCount: totalResponses,
        completedCount: completedResponses,
        completionRate,
      };
    });

    return NextResponse.json({
      success: true,
      surveys: surveysWithStats,
    });
  } catch (error) {
    console.error('Error in surveys list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
