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

CRITICAL JSON REQUIREMENTS:
1. ALWAYS return valid JSON
2. NO markdown code blocks (no \`\`\`json)
3. NO explanations before or after JSON
4. NO extra characters outside JSON object
5. If unsure, return: {"message": "Could you clarify that?", "shouldEnd": false}

REQUIRED FORMAT - START WITH { AND END WITH }:
{"message": "Your question", "shouldEnd": false}

OR when ending:
{"message": "Thanks!", "shouldEnd": true, "reason": "completed", "summary": "Brief summary", "persona": {"painLevel": "high", "experience": "intermediate", "sentiment": "negative", "readiness": "hot", "clarity": "high"}}

RETURN ONLY THE JSON OBJECT. NO OTHER TEXT.`,
    },
  ];

  try {
    const response = await generateAIResponse(enhancedMessages, {
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 300,
    });

    // Clean response - remove markdown code blocks if present
    let cleanedContent = response.content.trim();
    cleanedContent = cleanedContent.replace(/```json\s*/g, '');
    cleanedContent = cleanedContent.replace(/```\s*/g, '');
    cleanedContent = cleanedContent.trim();

    // Parse JSON response
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON found in response:', cleanedContent);
      // Fallback: treat as regular message, don't end
      return {
        message: cleanedContent || 'Could you clarify that?',
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
