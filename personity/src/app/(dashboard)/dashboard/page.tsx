'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveysList } from '@/components/dashboard/surveys-list';
import { StickyBanner } from '@/components/ui/sticky-banner';
import { useEffect, useState } from 'react';
import { PLANS } from '@/lib/razorpay/plans';

export default function DashboardPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<{
    plan: string;
    used: number;
    limit: number;
  } | null>(null);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const userPlan = (data.user.plan || 'FREE').toUpperCase();
          const planConfig = PLANS[userPlan as keyof typeof PLANS];
          setUsage({
            plan: userPlan,
            used: data.user.responsesUsedThisMonth || 0,
            limit: planConfig?.responses || 50,
          });
        }
      })
      .catch((error) => console.error('Failed to fetch usage:', error));
  }, []);

  const usagePercentage = usage ? (usage.used / usage.limit) * 100 : 0;
  const showWarning = usage && usagePercentage >= 80 && !dismissedWarning;

  return (
    <div className="animate-fade-in">
      {/* Usage Warning Banners */}
      {showWarning && (
        <div className="-mx-6 md:-mx-10 mb-8">
          {usagePercentage >= 100 ? (
            <StickyBanner
              className="bg-gradient-to-r from-red-600 to-red-700"
              onDismiss={() => setDismissedWarning(true)}
            >
              <div className="flex items-center justify-between gap-4 text-white w-full">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">
                    <span className="font-bold">Limit Reached!</span> You've used all {usage.limit} responses this month. Upgrade to continue.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => router.push('/billing')}
                >
                  Upgrade Now
                </Button>
              </div>
            </StickyBanner>
          ) : (
            <StickyBanner
              className="bg-gradient-to-r from-yellow-500 to-yellow-600"
              onDismiss={() => setDismissedWarning(true)}
            >
              <div className="flex items-center justify-between gap-4 text-white w-full">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-medium">
                    <span className="font-bold">Almost There!</span> You've used {usage.used}/{usage.limit} responses ({Math.round(usagePercentage)}%). Consider upgrading.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => router.push('/billing')}
                >
                  View Plans
                </Button>
              </div>
            </StickyBanner>
          )}
        </div>
      )}

      {/* Beta Announcement Banner */}
      <div className="-mx-6 md:-mx-10 mb-8">
        <StickyBanner className="bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 shrink-0" />
            <p className="text-sm font-medium">
              <span className="font-bold">Welcome to Beta!</span> Your first survey includes 50 free responses. No credit card required.
            </p>
          </div>
        </StickyBanner>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--color-foreground))] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))] mt-1 sm:mt-2">
            Manage your surveys and track responses
          </p>
        </div>
        <Button
          onClick={() => router.push('/surveys/create')}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Surveys List */}
      <SurveysList />
    </div>
  );
}
