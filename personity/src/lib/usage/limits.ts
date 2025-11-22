import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/razorpay/plans';

export interface UsageCheck {
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  limit: number;
  plan: string;
}

export async function checkUsageLimit(userId: string): Promise<UsageCheck> {
  const supabase = await createClient();

  // Get user's current plan and usage
  const { data: user, error } = await supabase
    .from('User')
    .select('plan, responsesUsedThisMonth, subscriptionStatus')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return {
      allowed: false,
      reason: 'User not found',
      currentUsage: 0,
      limit: 0,
      plan: 'FREE',
    };
  }

  const plan = user.plan || 'FREE';
  const currentUsage = user.responsesUsedThisMonth || 0;

  // Get plan limits
  const planConfig = PLANS[plan as keyof typeof PLANS];
  const limit = planConfig.responses || 0;

  // Check if subscription is active (for paid plans)
  if (plan !== 'FREE' && user.subscriptionStatus !== 'ACTIVE') {
    return {
      allowed: false,
      reason: 'Subscription inactive. Please renew your subscription.',
      currentUsage,
      limit,
      plan,
    };
  }

  // Check usage limit
  if (currentUsage >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} responses. Upgrade to continue.`,
      currentUsage,
      limit,
      plan,
    };
  }

  return {
    allowed: true,
    currentUsage,
    limit,
    plan,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient();

  await supabase.rpc('increment_responses_used', {
    user_id: userId,
  });
}
