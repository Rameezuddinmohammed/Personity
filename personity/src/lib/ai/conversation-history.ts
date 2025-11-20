/**
 * Conversation History Management
 * 
 * Handles token counting and history summarization to prevent
 * exceeding the 100k token limit.
 */

import { AIMessage } from './azure-openai';

interface Exchange {
  role: string;
  content: string;
  timestamp: string;
}

// Approximate token count (rough estimate: 1 token ≈ 4 characters)
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Count total tokens in message history
export function getTotalTokens(messages: AIMessage[]): number {
  return messages.reduce((total, msg) => {
    return total + countTokens(msg.content);
  }, 0);
}

// Summarize conversation history when approaching token limit
export async function summarizeHistory(
  exchanges: Exchange[],
  masterPrompt: string,
  generateSummary: (messages: AIMessage[]) => Promise<string>
): Promise<Exchange[]> {
  // Keep first 2 and last 6 exchanges
  const firstExchanges = exchanges.slice(0, 4); // 2 exchanges = 4 messages (user + assistant)
  const lastExchanges = exchanges.slice(-12); // 6 exchanges = 12 messages
  
  // Get middle exchanges to summarize
  const middleExchanges = exchanges.slice(4, -12);
  
  if (middleExchanges.length === 0) {
    return exchanges;
  }
  
  // Create summary of middle exchanges
  const summaryMessages: AIMessage[] = [
    {
      role: 'system',
      content: 'Summarize the following conversation exchanges concisely, preserving key information and context.',
    },
    ...middleExchanges.map((ex) => ({
      role: ex.role as 'user' | 'assistant' | 'system',
      content: ex.content,
    })),
  ];
  
  const summary = await generateSummary(summaryMessages);
  
  // Create summarized history
  const summarizedExchanges: Exchange[] = [
    ...firstExchanges,
    {
      role: 'system',
      content: `[CONVERSATION SUMMARY]\n${summary}`,
      timestamp: new Date().toISOString(),
    },
    ...lastExchanges,
  ];
  
  return summarizedExchanges;
}

// Check if history needs summarization
export function needsSummarization(exchanges: Exchange[], masterPrompt: string): boolean {
  const messages: AIMessage[] = [
    { role: 'system', content: masterPrompt },
    ...exchanges.map((ex) => ({
      role: ex.role as 'user' | 'assistant' | 'system',
      content: ex.content,
    })),
  ];
  
  const totalTokens = getTotalTokens(messages);
  
  // Trigger summarization at 80k tokens (80% of 100k limit)
  return totalTokens > 80000;
}

// Load conversation history with optional summarization
export async function loadConversationHistory(
  exchanges: Exchange[],
  masterPrompt: string,
  generateSummary?: (messages: AIMessage[]) => Promise<string>
): Promise<Exchange[]> {
  if (!generateSummary || !needsSummarization(exchanges, masterPrompt)) {
    return exchanges;
  }
  
  return summarizeHistory(exchanges, masterPrompt, generateSummary);
}
