import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/constants';
import { logAI } from '@/lib/logger';

// Initialize Azure OpenAI client using OpenAI SDK with Azure configuration
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Generate AI response using Azure OpenAI o4-mini
 * Note: o4-mini is a reasoning model that:
 * - Doesn't support temperature parameter
 * - Doesn't support system messages (must use developer role or merge into user message)
 * - Uses max_completion_tokens instead of max_tokens
 */
export async function generateAIResponse(
  messages: AIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<AIResponse> {
  try {
    // o4-mini reasoning model: convert system messages to developer role
    // and use max_completion_tokens instead of max_tokens
    const convertedMessages = messages.map((msg) => {
      if (msg.role === 'system') {
        // o-series models use 'developer' role instead of 'system'
        return { role: 'developer' as const, content: msg.content };
      }
      return msg;
    });

    // o4-mini uses tokens for reasoning before generating content
    // Need much higher limit: reasoning_tokens + output_tokens
    // Minimum 1000 for simple responses, 2000+ for complex ones
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages: convertedMessages as any,
      max_completion_tokens: Math.max(options.maxTokens ?? 200, 1) * 10, // 10x multiplier for reasoning overhead
    });

    const messageContent = response.choices[0]?.message?.content || '';

    return {
      content: messageContent,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error: any) {
    logAI.error('Azure OpenAI API error', error, {
      code: error?.code,
      status: error?.status,
      message: error?.message,
    });
    
    // Handle content filter errors
    if (error?.code === 'content_filter' || error?.status === 400) {
      throw new Error('CONTENT_FILTERED');
    }
    
    throw new Error(`Failed to generate AI response: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Detect if additional context is needed based on the objective
 */
export async function detectContextNeed(objective: string): Promise<boolean> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `You are an AI assistant that determines if additional context is needed for a research objective.
      
Analyze the objective and respond with ONLY "YES" or "NO".

Respond "YES" ONLY if the objective is vague or unclear about:
- What product/service is being researched
- Who the target users are
- What specific problem is being investigated

Respond "NO" if the objective:
- Clearly describes what is being researched
- Contains enough detail to ask meaningful questions
- Is specific about the research focus

Default to "NO" unless context is truly essential - most objectives are clear enough on their own.`,
    },
    {
      role: 'user',
      content: `Research objective: "${objective}"

Does this objective need additional context? Respond with only YES or NO.`,
    },
  ];

  try {
    const response = await generateAIResponse(messages, {
      temperature: AI_CONFIG.ANALYSIS_TEMPERATURE,
      maxTokens: 10,
    });

    const answer = response.content.trim().toUpperCase();
    return answer === 'YES';
  } catch (error) {
    logAI.error('Error detecting context need', error);
    // Default to not requiring context if AI fails
    return false;
  }
}

/**
 * Calculate cost based on token usage
 * o4-mini pricing: $1.10/1M input tokens, $4.40/1M output tokens
 */
export function calculateCost(usage: {
  inputTokens: number;
  outputTokens: number;
}): number {
  const COST_PER_1M_TOKENS = {
    input: 1.1,
    output: 4.4,
  };

  return (
    (usage.inputTokens / 1_000_000) * COST_PER_1M_TOKENS.input +
    (usage.outputTokens / 1_000_000) * COST_PER_1M_TOKENS.output
  );
}
