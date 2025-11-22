'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { PLANS } from '@/lib/razorpay/plans';
import { Button } from '@/components/ui/button';

interface UsageData {
  plan: string;
  responsesUsedThisMonth: number;
  maxResponses: number;
  daysRemaining?: number;
  subscriptionRenewsAt?: string;
}

export function UsageCard() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        // Get max responses from PLANS configuration
        const userPlan = (user.plan || 'FREE').toUpperCase();
        const planConfig = PLANS[userPlan as keyof typeof PLANS];
        const maxResponses = planConfig?.responses || 50;

        // Calculate days remaining for free plan
        let daysRemaining;
        if (user.plan === 'FREE' || user.plan === 'free') {
          const createdAt = new Date(user.createdAt);
          const expiryDate = new Date(createdAt);
          expiryDate.setDate(expiryDate.getDate() + 30);
          const today = new Date();
          daysRemaining = Math.max(
            0,
            Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          );
        }

        setUsage({
          plan: user.plan,
          responsesUsedThisMonth: user.responsesUsedThisMonth || 0,
          maxResponses,
          daysRemaining,
          subscriptionRenewsAt: user.subscriptionRenewsAt,
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2"></div>
        <div className="h-2 bg-neutral-200 rounded w-full"></div>
      </div>
    );
  }

  if (!usage) return null;

  const usagePercentage = (usage.responsesUsedThisMonth / usage.maxResponses) * 100;
  const isNearLimit = usagePercentage >= 80;

  const getPlanName = (plan: string) => {
    const planKey = plan.toUpperCase() as keyof typeof PLANS;
    return PLANS[planKey]?.name || plan;
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Usage
        </h3>
        <span className="px-2 py-1 text-xs font-medium bg-blue-600/10 text-blue-600 rounded-md">
          {getPlanName(usage.plan)} Plan
        </span>
      </div>

      {/* Responses Usage */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-semibold text-neutral-950">
              {usage.responsesUsedThisMonth}
            </span>
            <span className="text-sm text-neutral-500 ml-1">
              / {usage.maxResponses} responses
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-600">
            {Math.round(usagePercentage)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isNearLimit ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        {isNearLimit && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                You're approaching your plan limit. Upgrade to continue collecting responses.
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700"
              onClick={() => router.push('/billing')}
            >
              Upgrade Plan
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {usagePercentage >= 100 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 font-medium">
                Limit reached! Upgrade now to continue collecting responses.
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="w-full mt-2 bg-red-600 hover:bg-red-700"
              onClick={() => router.push('/billing')}
            >
              Upgrade Now
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Time Remaining (Free Plan) */}
      {usage.plan === 'free' && usage.daysRemaining !== undefined && (
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4" />
            <span>
              {usage.daysRemaining} days remaining on free plan
            </span>
          </div>
        </div>
      )}

      {/* Renewal Date (Paid Plans) */}
      {usage.plan !== 'free' && usage.subscriptionRenewsAt && (
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <TrendingUp className="w-4 h-4" />
            <span>
              Renews on {new Date(usage.subscriptionRenewsAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
