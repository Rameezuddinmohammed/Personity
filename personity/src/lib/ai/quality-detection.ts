/**
 * Quality Detection Module
 * 
 * Detects low-quality responses using AI analysis
 * Requirements: 4.5, 7.1
 */

import { generateAIResponse, AIMessage } from './azure-openai';
import { QUALITY_THRESHOLDS } from '@/lib/constants';
import { logAI } from '@/lib/logger';

export interface QualityCheckResult {
  isLowQuality: boolean;
  reason?: string;
  shouldReEngage: boolean;
}

/**
 * Check if a user response is low quality
 * 
 * Detects:
 * - 1-2 word responses
 * - "idk", "dunno", "nothing" type responses
 * - Generic, non-informative answers
 * 
 * @param userMessage - The user's message to check
 * @param conversationContext - Recent conversation history for context
 * @returns Quality check result
 */
export async function checkResponseQuality(
  userMessage: string,
  conversationContext: Array<{ role: string; content: string }>
): Promise<QualityCheckResult> {
  // Quick heuristic checks first (no AI needed)
  const trimmedMessage = userMessage.trim().toLowerCase();
  const wordCount = trimmedMessage.split(/\s+/).length;
  
  // Check for very short responses
  if (wordCount <= 2) {
    const lowQualityPatterns = [
      'idk',
      'dunno',
      'nothing',
      'no',
      'yes',
      'ok',
      'maybe',
      'sure',
      'nope',
      'nah',
      'yep',
      'yeah',
    ];
    
    if (lowQualityPatterns.includes(trimmedMessage)) {
      return {
        isLowQuality: true,
        reason: 'Very short, non-informative response',
        shouldReEngage: true,
      };
    }
  }
  
  // For slightly longer responses, use AI to assess quality
  if (wordCount <= QUALITY_THRESHOLDS.SHORT_RESPONSE_WORD_COUNT) {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `You are analyzing user responses in a research conversation to detect low-quality answers.

Respond with ONLY "LOW_QUALITY" or "ACCEPTABLE".

LOW_QUALITY responses are:
- Generic answers like "it's fine", "it's okay", "not much"
- Dismissive responses like "idk", "dunno", "nothing really"
- Responses that don't engage with the question
- Responses that provide no useful information

ACCEPTABLE responses are:
- Specific details or examples
- Thoughtful opinions or feelings
- Relevant information, even if brief

Respond with only LOW_QUALITY or ACCEPTABLE.`,
        },
        {
          role: 'user',
          content: `Recent conversation:
${conversationContext.slice(-4).map(ex => `${ex.role}: ${ex.content}`).join('\n')}

User's latest response: "${userMessage}"

Is this response LOW_QUALITY or ACCEPTABLE?`,
        },
      ];
      
      const response = await generateAIResponse(messages, {
        temperature: 0.3,
        maxTokens: 10,
      });
      
      const isLowQuality = response.content.trim().toUpperCase() === 'LOW_QUALITY';
      
      return {
        isLowQuality,
        reason: isLowQuality ? 'Generic or non-informative response' : undefined,
        shouldReEngage: isLowQuality,
      };
    } catch (error) {
      console.error('Error checking response quality:', error);
      // On error, be lenient and assume acceptable
      return {
        isLowQuality: false,
        shouldReEngage: false,
      };
    }
  }
  
  // Longer responses are generally acceptable
  return {
    isLowQuality: false,
    shouldReEngage: false,
  };
}

/**
 * Generate a re-engagement message to encourage better responses
 * 
 * @param lastAIQuestion - The last question asked by the AI
 * @returns A re-engagement message
 */
export async function generateReEngagementMessage(
  lastAIQuestion: string
): Promise<string> {
  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are helping to re-engage a respondent who gave a very brief or low-quality answer.

Generate a friendly, encouraging follow-up that:
- Acknowledges their response
- Gently asks for more detail
- Provides specific prompts or examples
- Stays warm and non-judgmental
- Is 2-3 sentences maximum

Keep the tone conversational and supportive.`,
      },
      {
        role: 'user',
        content: `The AI asked: "${lastAIQuestion}"

The respondent gave a very brief or generic answer.

Generate a re-engagement message to encourage them to share more details.`,
      },
    ];
    
    const response = await generateAIResponse(messages, {
      temperature: 0.7,
      maxTokens: 100,
    });
    
    return response.content;
  } catch (error) {
    console.error('Error generating re-engagement message:', error);
    // Fallback message
    return "I'd love to hear more about that. Could you share a bit more detail or give me an example?";
  }
}

/**
 * Track low-quality responses for a session
 * 
 * @param currentState - Current session state
 * @returns Updated state with quality tracking
 */
export function trackLowQualityResponse(
  currentState: {
    exchangeCount: number;
    topicsCovered: string[];
    lowQualityCount?: number;
    hasReEngaged?: boolean;
  }
): {
  exchangeCount: number;
  topicsCovered: string[];
  lowQualityCount: number;
  hasReEngaged: boolean;
  shouldFlag: boolean;
} {
  const lowQualityCount = (currentState.lowQualityCount || 0) + 1;
  const hasReEngaged = currentState.hasReEngaged || false;
  
  // Flag session after threshold low-quality responses
  const shouldFlag = lowQualityCount >= QUALITY_THRESHOLDS.LOW_QUALITY_COUNT_LIMIT;
  
  if (shouldFlag) {
    logAI.warn('Session flagged for low quality', { lowQualityCount });
  }
  
  return {
    exchangeCount: currentState.exchangeCount,
    topicsCovered: currentState.topicsCovered,
    lowQualityCount,
    hasReEngaged,
    shouldFlag,
  };
}
