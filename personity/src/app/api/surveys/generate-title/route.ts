import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai/azure-openai';
import { z } from 'zod';

const generateTitleSchema = z.object({
  objective: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { objective } = generateTitleSchema.parse(body);

    // Use AI to generate a concise, engaging title
    const response = await generateAIResponse(
      [
        {
          role: 'system',
          content: `You are a survey title generator. Create a short, clear, engaging survey title (max 60 characters) based on the research objective. 

Rules:
- Be concise and specific
- Use title case
- No quotes or extra punctuation
- Make it sound professional yet approachable
- Focus on what respondents will discuss, not the researcher's goal

Examples:
Objective: "I want to understand why users abandon their shopping carts"
Title: Shopping Cart Abandonment Study

Objective: "I want to learn what features users want in a mobile banking app"
Title: Mobile Banking Feature Preferences

Objective: "I want to understand customer satisfaction with our support team"
Title: Customer Support Experience Survey`,
        },
        {
          role: 'user',
          content: `Generate a survey title for this objective: "${objective}"`,
        },
      ],
      {
        temperature: 0.7,
        maxTokens: 50,
      }
    );

    // Clean up the response (remove quotes if AI added them)
    let title = response.content.trim().replace(/^["']|["']$/g, '');
    
    // Ensure it's not too long
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    return NextResponse.json({
      success: true,
      title,
    });
  } catch (error) {
    console.error('Generate title error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate title' },
      { status: 500 }
    );
  }
}
