'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles, AlertCircle, TrendingUp, ArrowRight, BookOpen, MessageSquare, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StickyBanner } from '@/components/ui/sticky-banner';
import { useEffect, useState } from 'react';
import { PLANS } from '@/lib/razorpay/plans';

interface Survey {
  id: string;
  title: string;
  objective: string;
  status: string;
  shortUrl: string;
  createdAt: string;
  responseCount?: number;
  completedCount?: number;
}

interface UserData {
  name: string;
  email: string;
  plan: string;
  responsesUsedThisMonth: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [usage, setUsage] = useState<{
    plan: string;
    used: number;
    limit: number;
  } | null>(null);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchUserData();
    fetchRecentSurveys();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        const userPlan = (data.user.plan || 'FREE').toUpperCase();
        const planConfig = PLANS[userPlan as keyof typeof PLANS];
        setUsage({
          plan: userPlan,
          used: data.user.responsesUsedThisMonth || 0,
          limit: planConfig?.responses || 50,
        });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchRecentSurveys = async () => {
    try {
      const response = await fetch('/api/surveys/list');
      if (response.ok) {
        const data = await response.json();
        // Get top 3 most recent surveys
        setRecentSurveys((data.surveys || []).slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    }
  };

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

      {/* Personalized Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">
          {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-neutral-600 mt-1">
          Here's what's happening with your surveys today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Total Surveys</p>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-950">{recentSurveys.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Active surveys</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Responses</p>
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-950">{usage?.used || 0}</p>
          <p className="text-xs text-neutral-500 mt-1">This month</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-neutral-600">Usage</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-neutral-950">{Math.round(usagePercentage)}%</p>
          <p className="text-xs text-neutral-500 mt-1">
            {usage?.used || 0} / {usage?.limit || 50} limit
          </p>
        </div>
      </div>

      {/* Recent Surveys */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-950">Recent Surveys</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/surveys')}
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {recentSurveys.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">
              No surveys yet
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Create your first survey to start gathering insights
            </p>
            <Button onClick={() => router.push('/surveys/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Survey
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => router.push(`/surveys/${survey.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-950 group-hover:text-blue-600 transition-colors mb-1">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {survey.objective}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {survey.completedCount || 0} responses
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        survey.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {survey.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/surveys/${survey.id}/insights`);
                    }}
                  >
                    View Insights
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Resources */}
      {recentSurveys.length < 3 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-950 mb-2">
                Getting Started with Personity
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Learn how to create effective surveys and gather meaningful insights
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/help')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-950">Create Your First Survey</p>
                    <p className="text-xs text-neutral-600">5 min guide</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/help')}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-950">Understanding Insights</p>
                    <p className="text-xs text-neutral-600">3 min read</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
