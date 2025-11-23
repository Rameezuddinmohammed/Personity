import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, AIMessage } from '@/lib/ai/azure-openai';
import { generateMasterPrompt } from '@/lib/ai/master-prompt';
import { z } from 'zod';

const testRequestSchema = z.object({
  objective: z.string(),
  context: z
    .object({
      productDescription: z.string().optional(),
      userInfo: z.string().optional(),
      knownIssues: z.string().optional(),
    })
    .optional(),
  topics: z.array(z.string()),
  settings: z.object({
    length: z.enum(['quick', 'standard', 'deep']),
    tone: z.enum(['professional', 'friendly', 'casual']),
    stopCondition: z.enum(['questions', 'topics_covered']),
    maxQuestions: z.number().optional(),
  }),
  mode: z.enum(['PRODUCT_DISCOVERY', 'FEEDBACK_SATISFACTION', 'EXPLORATORY_GENERAL']).optional(),
  action: z.enum(['start', 'message']),
  message: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = testRequestSchema.parse(body);

    // Generate master prompt with mode
    const masterPrompt = generateMasterPrompt({
      objective: validatedData.objective,
      context: validatedData.context,
      topics: validatedData.topics,
      settings: validatedData.settings,
      mode: validatedData.mode || 'EXPLORATORY_GENERAL',
    });

    // Build conversation history
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: masterPrompt,
      },
    ];

    // Add history if provided
    if (validatedData.history && validatedData.history.length > 0) {
      messages.push(
        ...validatedData.history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      );
    }

    // Add current message if provided
    if (validatedData.action === 'message' && validatedData.message) {
      messages.push({
        role: 'user',
        content: validatedData.message,
      });
    }

    // Generate AI response
    const response = await generateAIResponse(messages, {
      temperature: 0.7,
      maxTokens: 200,
    });

    // Parse JSON response from AI (master prompt returns structured format)
    const parseMessages = (content: string): string[] => {
      try {
        const parsed = JSON.parse(content);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          // Initial greeting returns array of messages
          return parsed.messages.map((m: any) => m.message).filter(Boolean);
        } else if (parsed.message) {
          // Regular response returns single message
          return [parsed.message];
        }
        return [content];
      } catch {
        // If not JSON, use content as-is
        return [content];
      }
    };

    const parsedMessages = parseMessages(response.content);

    return NextResponse.json({
      success: true,
      data: {
        messages: parsedMessages, // Return array of messages
        usage: response.usage,
      },
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

    console.error('Error in test conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate response',
      },
      { status: 500 }
    );
  }
}
