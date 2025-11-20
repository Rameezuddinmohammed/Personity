import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch survey with response counts
    const { data: survey, error: surveyError } = await supabase
      .from('Survey')
      .select(`
        *,
        ConversationSession (
          id,
          status,
          startedAt,
          completedAt
        )
      `)
      .eq('id', id)
      .eq('userId', user.id)
      .single();

    if (surveyError || !survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const sessions = survey.ConversationSession || [];
    const totalResponses = sessions.length;
    const completedResponses = sessions.filter(
      (s: any) => s.status === 'COMPLETED'
    ).length;
    const activeResponses = sessions.filter(
      (s: any) => s.status === 'ACTIVE'
    ).length;
    const pausedResponses = sessions.filter(
      (s: any) => s.status === 'PAUSED'
    ).length;
    const completionRate = totalResponses > 0 
      ? Math.round((completedResponses / totalResponses) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      survey: {
        ...survey,
        stats: {
          totalResponses,
          completedResponses,
          activeResponses,
          pausedResponses,
          completionRate,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (status && !['ACTIVE', 'PAUSED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update survey
    const { data: survey, error: updateError } = await supabase
      .from('Survey')
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .eq('userId', user.id)
      .select()
      .single();

    if (updateError || !survey) {
      return NextResponse.json(
        { error: 'Failed to update survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete by updating status to 'COMPLETED'
    const { error: deleteError } = await supabase
      .from('Survey')
      .update({ 
        status: 'COMPLETED',
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .eq('userId', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete survey' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Survey deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
