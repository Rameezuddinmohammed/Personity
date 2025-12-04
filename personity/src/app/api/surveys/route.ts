import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createSurveySchema } from '@/lib/validations/survey';
import { generateMasterPrompt } from '@/lib/ai/master-prompt';
import { generateShortUrl } from '@/lib/utils/short-url';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSurveySchema.parse(body);

    // Generate unique short URL
    let shortUrl = generateShortUrl();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure short URL is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from('Survey')
        .select('id')
        .eq('shortUrl', shortUrl)
        .single();

      if (!existing) break;

      shortUrl = generateShortUrl();
      attempts++;
    }

    if (attempts === maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique short URL' },
        { status: 500 }
      );
    }

    // Generate master prompt with mode and document context
    const masterPrompt = generateMasterPrompt({
      objective: validatedData.objective,
      context: validatedData.context,
      documentContext: validatedData.documentContext,
      topics: validatedData.topics,
      settings: validatedData.settings,
      mode: validatedData.mode || 'EXPLORATORY_GENERAL',
    });

    // Create survey in database
    const { data, error: insertError} = await supabaseAdmin
      .from('Survey')
      .insert({
        userId: user.id,
        title: validatedData.title,
        objective: validatedData.objective,
        context: validatedData.context || null,
        documentContext: validatedData.documentContext || null,
        topics: validatedData.topics as any,
        settings: validatedData.settings as any,
        masterPrompt,
        shortUrl,
        status: 'ACTIVE',
        mode: validatedData.mode || 'EXPLORATORY_GENERAL',
      })
      .select()
      .single();

    if (insertError || !data) {
      logger.error('Failed to insert survey', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create survey' },
        { status: 500 }
      );
    }
    
    logger.info('Survey created', { surveyId: data.id, userId: user.id });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        shortUrl: data.shortUrl,
        status: data.status,
        createdAt: data.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Survey validation error', { issues: error.issues });
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error('Error creating survey', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create survey',
      },
      { status: 500 }
    );
  }
}

/**
 * @deprecated Use /api/surveys/list instead for detailed stats
 * This endpoint is kept for backward compatibility
 */
export async function GET() {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's surveys
    const { data: surveys, error: fetchError } = await supabaseAdmin
      .from('Survey')
      .select('id, title, objective, status, shortUrl, createdAt, updatedAt')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });

    if (fetchError) {
      logger.error('Error fetching surveys', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch surveys' },
        { status: 500 }
      );
    }

    // Get session counts for each survey
    const surveysWithCounts = await Promise.all(
      (surveys || []).map(async (survey) => {
        const { count } = await supabaseAdmin
          .from('ConversationSession')
          .select('*', { count: 'exact', head: true })
          .eq('surveyId', survey.id);

        return {
          ...survey,
          _count: {
            sessions: count || 0,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: surveysWithCounts,
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch surveys',
      },
      { status: 500 }
    );
  }
}
