import OpenAI from 'openai';

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
 * Generate AI response using Azure OpenAI GPT-4o
 */
export async function generateAIResponse(
  messages: AIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<AIResponse> {
  try {
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 200,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
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
      temperature: 0.3,
      maxTokens: 10,
    });

    const answer = response.content.trim().toUpperCase();
    return answer === 'YES';
  } catch (error) {
    console.error('Error detecting context need:', error);
    // Default to not requiring context if AI fails
    return false;
  }
}

/**
 * Calculate cost based on token usage
 * GPT-4o pricing: $2.50/1M input tokens, $10.00/1M output tokens
 */
export function calculateCost(usage: {
  inputTokens: number;
  outputTokens: number;
}): number {
  const COST_PER_1M_TOKENS = {
    input: 2.5,
    output: 10.0,
  };

  return (
    (usage.inputTokens / 1_000_000) * COST_PER_1M_TOKENS.input +
    (usage.outputTokens / 1_000_000) * COST_PER_1M_TOKENS.output
  );
}
