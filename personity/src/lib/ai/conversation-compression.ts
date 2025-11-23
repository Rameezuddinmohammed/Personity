/**
 * Conversation Compression
 * 
 * Compresses long conversation histories to prevent prompt truncation
 * Triggered after 10+ exchanges to keep context manageable
 */

import { generateAIResponse, AIMessage } from './azure-openai';

export interface CompressionResult {
  summary: string;
  keyInsights: string[];
  personaSnapshot: {
    painLevel?: string;
    experience?: string;
    sentiment?: string;
    readiness?: string;
  };
  topicsCovered: string[];
}

/**
 * Compress conversation history into a summary
 * Keeps last 3 exchanges + summary of earlier ones
 */
export async function compressConversationHistory(
  exchanges: Array<{ role: string; content: string; timestamp?: string }>,
  topics: string[]
): Promise<{
  compressedExchanges: Array<{ role: string; content: string; timestamp: string }>;
  summary: CompressionResult;
}> {
  // Keep last 3 exchanges (6 messages) - most recent context
  const recentExchanges = exchanges.slice(-6).map(ex => ({
    ...ex,
    timestamp: ex.timestamp || new Date().toISOString(),
  }));
  
  // Compress earlier exchanges
  const earlierExchanges = exchanges.slice(0, -6);
  
  if (earlierExchanges.length === 0) {
    // Nothing to compress
    return {
      compressedExchanges: exchanges.map(ex => ({
        ...ex,
        timestamp: ex.timestamp || new Date().toISOString(),
      })),
      summary: {
        summary: '',
        keyInsights: [],
        personaSnapshot: {},
        topicsCovered: [],
      },
    };
  }
  
  // Build compression prompt
  const compressionPrompt = `Analyze this conversation and extract:
1. Key insights (important quotes/statements)
2. Topics covered
3. User persona (pain level, experience, sentiment, readiness)
4. Brief summary (2-3 sentences)

Conversation:
${earlierExchanges.map(ex => `${ex.role.toUpperCase()}: ${ex.content}`).join('\n\n')}

Topics to check: ${topics.join(', ')}

Return ONLY valid JSON:
{
  "summary": "Brief 2-3 sentence summary",
  "keyInsights": ["quote 1", "quote 2", "quote 3"],
  "personaSnapshot": {
    "painLevel": "low|medium|high",
    "experience": "novice|intermediate|expert",
    "sentiment": "positive|neutral|negative",
    "readiness": "cold|warm|hot"
  },
  "topicsCovered": ["topic1", "topic2"]
}`;

  try {
    const response = await generateAIResponse(
      [
        {
          role: 'system',
          content: 'You are a research analyst. Extract key information from conversations and return ONLY valid JSON. No markdown, no explanations.',
        },
        {
          role: 'user',
          content: compressionPrompt,
        },
      ],
      {
        temperature: 0.3, // Low temperature for consistent extraction
        maxTokens: 500,
      }
    );

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in compression response');
    }

    const summary: CompressionResult = JSON.parse(jsonMatch[0]);

    // Create compressed history with summary
    const compressedExchanges = [
      {
        role: 'system',
        content: `CONVERSATION SUMMARY (Earlier exchanges):
${summary.summary}

Key insights captured:
${summary.keyInsights.map((insight, i) => `${i + 1}. "${insight}"`).join('\n')}

Topics covered: ${summary.topicsCovered.join(', ')}

Persona snapshot:
${Object.entries(summary.personaSnapshot).map(([key, val]) => `- ${key}: ${val}`).join('\n')}`,
        timestamp: new Date().toISOString(),
      },
      ...recentExchanges,
    ];

    return {
      compressedExchanges,
      summary,
    };
  } catch (error) {
    console.error('Compression failed:', error);
    // Fallback: just keep recent exchanges with timestamps
    return {
      compressedExchanges: recentExchanges.map(ex => ({
        ...ex,
        timestamp: ex.timestamp || new Date().toISOString(),
      })),
      summary: {
        summary: 'Compression failed - using recent exchanges only',
        keyInsights: [],
        personaSnapshot: {},
        topicsCovered: [],
      },
    };
  }
}

/**
 * Check if conversation needs compression
 */
export function needsCompression(exchanges: Array<{ role: string; content: string }>): boolean {
  // Compress after 10+ exchanges (20+ messages)
  return exchanges.length > 20;
}
