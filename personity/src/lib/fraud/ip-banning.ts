/**
 * IP Banning System
 * 
 * Manages IP bans for fraud prevention
 * Requirements: 7.2
 */

import { createClient } from '@/lib/supabase/server';
import { FRAUD_THRESHOLDS } from '@/lib/constants';
import { logFraud } from '@/lib/logger';

export interface BanResult {
  success: boolean;
  message: string;
}

/**
 * Check if an IP address is banned
 * 
 * @param ipAddress - IP address to check
 * @returns True if IP is currently banned
 */
export async function isIPBanned(ipAddress: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data: bannedIp, error } = await supabase
    .from('BannedIp')
    .select('*')
    .eq('ipAddress', ipAddress)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking banned IP:', error);
    return false; // On error, allow access (fail open)
  }
  
  if (!bannedIp) {
    return false;
  }
  
  // Check if ban has expired
  if (bannedIp.expiresAt) {
    const expiryDate = new Date(bannedIp.expiresAt);
    if (expiryDate < new Date()) {
      // Ban has expired, remove it
      await unbanIP(ipAddress);
      return false;
    }
  }
  
  return true;
}

/**
 * Ban an IP address
 * 
 * @param ipAddress - IP address to ban
 * @param reason - Reason for the ban
 * @param durationDays - Duration of ban in days (null for permanent)
 * @returns Ban result
 */
export async function banIP(
  ipAddress: string,
  reason: string,
  durationDays: number | null = null
): Promise<BanResult> {
  const supabase = await createClient();
  
  // Check if already banned
  const alreadyBanned = await isIPBanned(ipAddress);
  if (alreadyBanned) {
    return {
      success: false,
      message: 'IP is already banned',
    };
  }
  
  // Calculate expiry date if duration specified
  let expiresAt: string | null = null;
  if (durationDays !== null) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + durationDays);
    expiresAt = expiryDate.toISOString();
  }
  
  // Insert ban record
  const { error } = await supabase
    .from('BannedIp')
    .insert({
      ipAddress,
      reason,
      expiresAt,
      bannedAt: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error banning IP:', error);
    return {
      success: false,
      message: 'Failed to ban IP',
    };
  }
  
  logFraud.info('IP banned', { ipAddress, reason, durationDays });
  
  return {
    success: true,
    message: `IP banned successfully${durationDays ? ` for ${durationDays} days` : ''}`,
  };
}

/**
 * Unban an IP address
 * 
 * @param ipAddress - IP address to unban
 * @returns Ban result
 */
export async function unbanIP(ipAddress: string): Promise<BanResult> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('BannedIp')
    .delete()
    .eq('ipAddress', ipAddress);
  
  if (error) {
    console.error('Error unbanning IP:', error);
    return {
      success: false,
      message: 'Failed to unban IP',
    };
  }
  
  logFraud.info('IP unbanned', { ipAddress });
  
  return {
    success: true,
    message: 'IP unbanned successfully',
  };
}

/**
 * Get all banned IPs
 * 
 * @returns List of banned IPs with details
 */
export async function getBannedIPs(): Promise<Array<{
  id: string;
  ipAddress: string;
  reason: string | null;
  bannedAt: string;
  expiresAt: string | null;
}>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('BannedIp')
    .select('*')
    .order('bannedAt', { ascending: false });
  
  if (error) {
    console.error('Error fetching banned IPs:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Automatically ban IP if it has too many low-quality sessions
 * 
 * @param ipAddress - IP address to check
 * @returns Ban result if banned, null otherwise
 */
export async function autoBanIfNeeded(ipAddress: string): Promise<BanResult | null> {
  const supabase = await createClient();
  
  // Get low-quality session count in last 24 hours
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  const { data: sessions, error } = await supabase
    .from('ConversationSession')
    .select('id, currentState')
    .eq('ipAddress', ipAddress)
    .gte('startedAt', twentyFourHoursAgo.toISOString());
  
  if (error || !sessions) {
    console.error('Error checking sessions for auto-ban:', error);
    return null;
  }
  
  // Count flagged sessions
  const flaggedCount = sessions.filter(session => {
    const state = session.currentState as any;
    return state?.isFlagged === true || state?.lowQualityCount >= 3;
  }).length;
  
  // Ban if flagged sessions exceed threshold
  if (flaggedCount >= FRAUD_THRESHOLDS.FLAGGED_SESSION_BAN_THRESHOLD) {
    return await banIP(
      ipAddress,
      `Automatic ban: ${flaggedCount} low-quality sessions in 24 hours`,
      FRAUD_THRESHOLDS.DEFAULT_BAN_DURATION_DAYS
    );
  }
  
  return null;
}

/**
 * Clean up expired bans (maintenance function)
 * 
 * @returns Number of expired bans removed
 */
export async function cleanupExpiredBans(): Promise<number> {
  const supabase = await createClient();
  
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('BannedIp')
    .delete()
    .lt('expiresAt', now)
    .select();
  
  if (error) {
    console.error('Error cleaning up expired bans:', error);
    return 0;
  }
  
  const count = data?.length || 0;
  if (count > 0) {
    logFraud.info('Cleaned up expired IP bans', { count });
  }
  
  return count;
}
