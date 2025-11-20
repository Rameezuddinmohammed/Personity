import { NextRequest, NextResponse } from 'next/server';
import { detectSurveyMode } from '@/lib/ai/mode-detector';
import { z } from 'zod';

const requestSchema = z.object({
  objective: z.string().min(10, 'Objective must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objective } = requestSchema.parse(body);

    const result = await detectSurveyMode(objective);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Error detecting mode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect survey mode' },
      { status: 500 }
    );
  }
}
