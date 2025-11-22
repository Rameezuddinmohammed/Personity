/**
 * Structured AI Response
 * 
 * Forces AI to return structured JSON with explicit conversation control signals
 */

import { generateAIResponse, AIMessage } from './azure-openai';

export interface PersonaInsights {
  painLevel?: 'low' | 'medium' | 'high';
  experience?: 'novice' | 'intermediate' | 'expert';
  sentiment?: 'positive' | 'neutral' | 'negative';
  readiness?: 'cold' | 'warm' | 'hot';
  clarity?: 'low' | 'medium' | 'high';
}

export interface StructuredConversationResponse {
  message: string;
  shouldEnd: boolean;
  reason?: 'completed' | 'disqualified' | 'low_quality' | 'max_questions';
  summary?: string;
  persona?: PersonaInsights;
  messages?: Array<{
    message: string;
    shouldEnd: boolean;
  }>;
}

/**
 * Generate AI response with structured output for conversation control
 */
export async function generateStructuredConversationResponse(
  messages: AIMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<StructuredConversationResponse> {
  // Add JSON instruction to the last user message
  const lastMessage = messages[messages.length - 1];
  const enhancedMessages = [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      content: `${lastMessage.content}

IMPORTANT: Respond with ONLY a JSON object in this exact format:
{
  "message": "Your response to the user",
  "shouldEnd": true/false,
  "reason": "completed" | "disqualified" | "low_quality" | "max_questions" (only if shouldEnd is true),
  "summary": "Brief summary of key insights" (only if shouldEnd is true)
}

Set shouldEnd to true if:
- You've covered all topics and are wrapping up
- The respondent is not qualified or not a good fit
- The respondent is giving consistently low-quality answers
- You've reached the maximum number of questions

Set shouldEnd to false if:
- The conversation should continue
- You're asking another question`,
    },
  ];

  try {
    const response = await generateAIResponse(enhancedMessages, {
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 300,
    });

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback: treat as regular message, don't end
      return {
        message: response.content,
        shouldEnd: false,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Handle multi-message response (for opening)
    if (parsed.messages && Array.isArray(parsed.messages)) {
      return {
        message: parsed.messages[0]?.message || response.content,
        shouldEnd: false,
        messages: parsed.messages,
      };
    }

    // Handle single message response (normal conversation)
    return {
      message: parsed.message || response.content,
      shouldEnd: parsed.shouldEnd === true,
      reason: parsed.reason,
      summary: parsed.summary,
      persona: parsed.persona,
    };
  } catch (error) {
    console.error('Error parsing structured response:', error);
    // Fallback: return raw response, don't end
    const response = await generateAIResponse(messages, options);
    return {
      message: response.content,
      shouldEnd: false,
    };
  }
}
