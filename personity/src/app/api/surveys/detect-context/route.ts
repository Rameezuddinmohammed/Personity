import { NextRequest, NextResponse } from 'next/server';
import { detectContextNeed } from '@/lib/ai/azure-openai';
import { z } from 'zod';

const requestSchema = z.object({
  objective: z.string().min(10, 'Objective must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objective } = requestSchema.parse(body);

    const needsContext = await detectContextNeed(objective);

    return NextResponse.json({
      success: true,
      data: { needsContext },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error detecting context need:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze objective',
      },
      { status: 500 }
    );
  }
}
