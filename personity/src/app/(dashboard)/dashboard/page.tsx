'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveysList } from '@/components/dashboard/surveys-list';
import { UsageCard } from '@/components/dashboard/usage-card';
import { StickyBanner } from '@/components/ui/sticky-banner';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Surveys List - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <SurveysList />
        </div>

        {/* Sidebar - Takes 1 column on large screens */}
        <div className="space-y-6">
          <UsageCard />
        </div>
      </div>
    </div>
  );
}
