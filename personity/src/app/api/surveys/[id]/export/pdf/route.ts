import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getLatestAggregateAnalysis } from '@/lib/ai/aggregate-analysis';
import { generateInsightsPDF } from '@/lib/export/pdf-generator';

/**
 * GET /api/surveys/[id]/export/pdf
 * 
 * Generate and download PDF export of survey insights
 * Requirements: 12.1, 12.2, 12.3, 12.6
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
      .select('id, title, objective, userId, mode')
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

    // Get user's plan to determine watermark
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    const includeWatermark = userData.plan === 'FREE';

    // Fetch aggregate analysis
    const aggregateAnalysis = await getLatestAggregateAnalysis(surveyId);

    if (!aggregateAnalysis) {
      return NextResponse.json(
        { error: 'No analysis available yet. Complete at least 5 responses to generate insights.' },
        { status: 400 }
      );
    }

    // Fetch individual response analyses
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

    let responses: any[] = [];

    if (sessions && sessions.length > 0) {
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

      if (conversations && conversations.length > 0) {
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

        responses = analyses || [];
      }
    }

    // Generate PDF
    const pdfData = generateInsightsPDF({
      surveyTitle: survey.title,
      surveyObjective: survey.objective,
      executiveSummary: aggregateAnalysis.executiveSummary,
      surveyMode: (survey as any).mode,
      topThemes: aggregateAnalysis.topThemes as any,
      userSegments: aggregateAnalysis.userSegments as any,
      responses: responses.map((r) => ({
        summary: r.summary,
        sentiment: r.sentiment,
        qualityScore: r.qualityScore,
        keyThemes: r.keyThemes as string[],
        painPoints: r.painPoints as string[],
        topQuotes: r.topQuotes as any,
        createdAt: r.createdAt,
      })),
      responseCount: aggregateAnalysis.responseCount,
      includeWatermark,
    });

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const fileName = `survey-${surveyId}-insights-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('exports')
      .upload(fileName, pdfData, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload PDF' },
        { status: 500 }
      );
    }

    // Generate signed URL (1 hour expiry) using admin client
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('exports')
      .createSignedUrl(fileName, 3600); // 1 hour

    if (signedUrlError) {
      console.error('Error generating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      fileName,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error generating PDF export:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF export' },
      { status: 500 }
    );
  }
}
