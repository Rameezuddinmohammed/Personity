/**
 * Spam and Abuse Detection Module
 * 
 * Detects spam patterns and abusive behavior
 * Requirements: 7.2, 7.3, 7.4
 */

import { createClient } from '@/lib/supabase/server';

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  shouldBan: boolean;
}

/**
 * Check for identical responses (spam pattern)
 * 
 * @param exchanges - Conversation history
 * @param newMessage - New user message
 * @returns True if message is identical to 3+ previous messages
 */
export function detectIdenticalResponses(
  exchanges: Array<{ role: string; content: string }>,
  newMessage: string
): boolean {
  const userMessages = exchanges
    .filter(ex => ex.role === 'user')
    .map(ex => ex.content.trim().toLowerCase());
  
  const normalizedNew = newMessage.trim().toLowerCase();
  
  // Count how many times this exact message appears
  const identicalCount = userMessages.filter(msg => msg === normalizedNew).length;
  
  // Flag if this would be the 3rd+ identical response
  return identicalCount >= 2;
}

/**
 * Calculate average exchange time for a session
 * 
 * @param exchanges - Conversation history with timestamps
 * @returns Average time in seconds between exchanges
 */
export function calculateAverageExchangeTime(
  exchanges: Array<{ role: string; content: string; timestamp: string }>
): number {
  if (exchanges.length < 4) {
    return 0; // Not enough data
  }
  
  const userExchanges = exchanges.filter(ex => ex.role === 'user');
  
  if (userExchanges.length < 2) {
    return 0;
  }
  
  let totalTime = 0;
  let count = 0;
  
  for (let i = 1; i < userExchanges.length; i++) {
    const prevTime = new Date(userExchanges[i - 1].timestamp).getTime();
    const currTime = new Date(userExchanges[i].timestamp).getTime();
    const diff = (currTime - prevTime) / 1000; // Convert to seconds
    
    totalTime += diff;
    count++;
  }
  
  return count > 0 ? totalTime / count : 0;
}

/**
 * Check if exchange time is suspiciously fast (bot-like behavior)
 * 
 * @param averageExchangeTime - Average time in seconds
 * @returns True if suspiciously fast
 */
export function isSuspiciousSpeed(averageExchangeTime: number): boolean {
  // Flag if average response time is under 5 seconds
  return averageExchangeTime > 0 && averageExchangeTime < 5;
}

/**
 * Get session count for an IP address in the last 24 hours
 * 
 * @param ipAddress - IP address to check
 * @returns Number of sessions created by this IP in last 24 hours
 */
export async function getIPSessionCount(ipAddress: string): Promise<number> {
  const supabase = await createClient();
  
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const { count, error } = await supabase
    .from('ConversationSession')
    .select('id', { count: 'exact', head: true })
    .eq('ipAddress', ipAddress)
    .gte('startedAt', twentyFourHoursAgo.toISOString());
  
  if (error) {
    console.error('Error fetching IP session count:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Get low-quality session count for an IP in the last 24 hours
 * 
 * @param ipAddress - IP address to check
 * @returns Number of flagged sessions from this IP
 */
export async function getLowQualitySessionCount(ipAddress: string): Promise<number> {
  const supabase = await createClient();
  
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  // Get sessions from this IP in last 24 hours
  const { data: sessions, error: sessionsError } = await supabase
    .from('ConversationSession')
    .select('id, currentState')
    .eq('ipAddress', ipAddress)
    .gte('startedAt', twentyFourHoursAgo.toISOString());
  
  if (sessionsError || !sessions) {
    console.error('Error fetching sessions:', sessionsError);
    return 0;
  }
  
  // Count sessions that are flagged as low quality
  const flaggedCount = sessions.filter(session => {
    const state = session.currentState as any;
    return state?.isFlagged === true || state?.lowQualityCount >= 3;
  }).length;
  
  return flaggedCount;
}

/**
 * Comprehensive spam check for a session
 * 
 * @param ipAddress - IP address of the session
 * @param exchanges - Conversation history
 * @param newMessage - New user message
 * @returns Spam check result
 */
export async function checkForSpam(
  ipAddress: string,
  exchanges: Array<{ role: string; content: string; timestamp: string }>,
  newMessage: string
): Promise<SpamCheckResult> {
  // Check for identical responses
  if (detectIdenticalResponses(exchanges, newMessage)) {
    return {
      isSpam: true,
      reason: 'Identical responses detected (3+ times)',
      shouldBan: false, // Don't ban immediately, just flag
    };
  }
  
  // Check for suspicious speed
  const avgTime = calculateAverageExchangeTime(exchanges);
  if (isSuspiciousSpeed(avgTime)) {
    return {
      isSpam: true,
      reason: `Suspiciously fast responses (avg ${avgTime.toFixed(1)}s)`,
      shouldBan: false,
    };
  }
  
  // Check IP session count
  const sessionCount = await getIPSessionCount(ipAddress);
  if (sessionCount > 20) {
    return {
      isSpam: true,
      reason: `Too many sessions from IP (${sessionCount} in 24h)`,
      shouldBan: true, // This is more serious
    };
  }
  
  // Check low-quality session count
  const lowQualityCount = await getLowQualitySessionCount(ipAddress);
  if (lowQualityCount >= 10) {
    return {
      isSpam: true,
      reason: `Too many low-quality sessions (${lowQualityCount} in 24h)`,
      shouldBan: true, // Ban after 10+ low-quality sessions
    };
  }
  
  return {
    isSpam: false,
    shouldBan: false,
  };
}

/**
 * Flag a session as spam/low-quality
 * 
 * @param sessionId - Session ID to flag
 * @param reason - Reason for flagging
 */
export async function flagSession(
  sessionId: string,
  reason: string
): Promise<void> {
  const supabase = await createClient();
  
  // Get current session state
  const { data: session } = await supabase
    .from('ConversationSession')
    .select('currentState')
    .eq('id', sessionId)
    .single();
  
  if (!session) {
    return;
  }
  
  const currentState = session.currentState as any;
  
  // Update state with flag
  await supabase
    .from('ConversationSession')
    .update({
      currentState: {
        ...currentState,
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
      },
    })
    .eq('id', sessionId);
  
  console.log(`Session ${sessionId} flagged: ${reason}`);
}
