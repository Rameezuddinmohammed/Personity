import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeConversation, saveAnalysis } from '@/lib/ai/response-analysis';
import { triggerAggregateAnalysisIfNeeded } from '@/lib/ai/aggregate-analysis';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

const completeSchema = z.object({
  confirmed: z.boolean(),
  persona: z.object({
    painLevel: z.enum(['low', 'medium', 'high']).optional(),
    experience: z.enum(['novice', 'intermediate', 'expert']).optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
    readiness: z.enum(['cold', 'warm', 'hot']).optional(),
    clarity: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
});

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { token } = await context.params;
    const supabase = await createClient();
    
    // Validate request body
    const body = await request.json();
    const validation = completeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { confirmed } = validation.data;
    
    // Fetch session with survey and user info
    const { data: session, error: sessionError } = await supabase
      .from('ConversationSession')
      .select('*, Survey(*, User(*))')
      .eq('sessionToken', token)
      .single();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Check if session is active or already completed
    if (session.status !== 'ACTIVE' && session.status !== 'COMPLETED') {
      console.error(`[Complete] Session status is ${session.status}, expected ACTIVE or COMPLETED`);
      return NextResponse.json(
        { error: `Session is ${session.status.toLowerCase()}. Cannot complete.` },
        { status: 400 }
      );
    }
    
    // If already completed, just return success
    if (session.status === 'COMPLETED') {
      return NextResponse.json({
        success: true,
        data: {
          completed: true,
          alreadyCompleted: true,
        },
      });
    }
    
    if (!confirmed) {
      // User rejected the summary, continue conversation
      return NextResponse.json({
        success: true,
        data: {
          continued: true,
        },
      });
    }
    
    // Mark session as completed
    await supabase
      .from('ConversationSession')
      .update({
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', session.id);
    
    // Increment creator's response counter
    const survey = session.Survey as any;
    const user = survey.User as any;
    
    await supabase
      .from('User')
      .update({
        responsesUsedThisMonth: user.responsesUsedThisMonth + 1,
      })
      .eq('id', user.id);
    
    // Calculate conversation duration
    const startTime = new Date(session.startedAt).getTime();
    const endTime = new Date().getTime();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Trigger per-response analysis
    try {
      // Fetch conversation with exchanges
      const { data: conversation } = await supabase
        .from('Conversation')
        .select('id, exchanges')
        .eq('sessionId', session.id)
        .single();
      
      if (conversation) {
        // Update conversation with duration
        await supabase
          .from('Conversation')
          .update({ durationSeconds })
          .eq('id', conversation.id);
        
        const exchanges = conversation.exchanges as Array<{
          role: string;
          content: string;
          timestamp: string;
        }>;
        
        // Check if session was flagged for quality issues
        const currentState = session.currentState as any;
        const isFlagged = currentState?.isFlagged === true;
        
        // Analyze the conversation
        const analysis = await analyzeConversation(
          conversation.id,
          exchanges,
          survey.objective
        );
        
        // CRITICAL: Use persona from request body, fallback to currentState.persona
        // This ensures we capture persona even if frontend didn't send it
        const personaData = body.persona || currentState?.persona || null;
        
        if (!personaData || Object.keys(personaData).length === 0) {
          console.warn('[Complete] No persona data available. Frontend:', body.persona, 'State:', currentState?.persona);
        } else {
          console.log('[Complete] Saving persona data:', personaData);
        }
        
        // Save analysis to database with persona data
        await saveAnalysis(conversation.id, analysis, isFlagged, personaData);
        
        console.log(`Analysis completed for conversation ${conversation.id} (duration: ${durationSeconds}s)`);
        
        // Trigger aggregate analysis if milestone reached (5, 10, 15, etc. responses)
        await triggerAggregateAnalysisIfNeeded(survey.id, survey.objective);
      }
    } catch (analysisError) {
      // Log error but don't fail the completion
      console.error('Error during analysis:', analysisError);
    }
    
    // TODO: Send email notification to creator (will be implemented in Task 14)
    
    return NextResponse.json({
      success: true,
      data: {
        completed: true,
      },
    });
  } catch (error) {
    console.error('Complete conversation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
