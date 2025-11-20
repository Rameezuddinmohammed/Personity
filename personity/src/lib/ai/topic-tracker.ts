import { generateAIResponse, AIMessage } from './azure-openai';

/**
 * Analyze conversation to identify which topics have been covered
 */
export async function identifyDiscussedTopics(
  conversationHistory: Array<{ role: string; content: string }>,
  allTopics: string[]
): Promise<string[]> {
  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are analyzing a conversation to identify which topics have been discussed.

Given a list of topics and a conversation, identify which topics have been meaningfully covered.

Respond with ONLY a comma-separated list of topic numbers (e.g., "1,3,4" or "none" if no topics covered).`,
      },
      {
        role: 'user',
        content: `Topics to cover:
${allTopics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

Recent conversation:
${conversationHistory.slice(-6).map(ex => `${ex.role}: ${ex.content}`).join('\n\n')}

Which topic numbers have been meaningfully discussed? Respond with only numbers separated by commas, or "none".`,
      },
    ];

    const response = await generateAIResponse(messages, {
      temperature: 0.3,
      maxTokens: 50,
    });

    const result = response.content.trim().toLowerCase();
    
    if (result === 'none') {
      return [];
    }

    // Parse comma-separated numbers
    const topicIndices = result
      .split(',')
      .map(s => parseInt(s.trim()) - 1)
      .filter(i => !isNaN(i) && i >= 0 && i < allTopics.length);

    return topicIndices.map(i => allTopics[i]);
  } catch (error) {
    console.error('Error identifying topics:', error);
    return [];
  }
}

/**
 * Check if all required topics have been covered
 */
export function areAllTopicsCovered(
  coveredTopics: string[],
  allTopics: string[]
): boolean {
  if (allTopics.length === 0) return true;
  return coveredTopics.length >= allTopics.length;
}

/**
 * Get topics that still need to be covered
 */
export function getRemainingTopics(
  coveredTopics: string[],
  allTopics: string[]
): string[] {
  return allTopics.filter(topic => !coveredTopics.includes(topic));
}
