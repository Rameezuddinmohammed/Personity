'use client';

import { AlertCircle, CheckCircle2, TrendingUp, Hammer, ThumbsUp, Search } from 'lucide-react';

type SurveyMode = 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';

interface ModeSummaryProps {
  mode: SurveyMode;
  responses: Array<{
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    qualityScore: number;
    painPoints?: string[];
  }>;
}

export function ModeSummary({ mode, responses }: ModeSummaryProps) {
  const positiveCount = responses.filter(r => r.sentiment === 'POSITIVE').length;
  const negativeCount = responses.filter(r => r.sentiment === 'NEGATIVE').length;
  const avgQuality = responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length;
  const totalPainPoints = responses.reduce((sum, r) => sum + (r.painPoints?.length || 0), 0);

  if (mode === 'PRODUCT_DISCOVERY') {
    return (
      <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Hammer className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
              Product Discovery Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{totalPainPoints} Pain Points</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Identified across responses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{avgQuality.toFixed(1)}/10 Depth</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Average response quality</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{responses.length} Insights</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Validated with users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'FEEDBACK_SATISFACTION') {
    const satisfactionRate = Math.round((positiveCount / responses.length) * 100);
    const atRiskCount = negativeCount;

    return (
      <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <ThumbsUp className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
              Satisfaction Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{satisfactionRate}% Satisfied</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Positive sentiment rate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{atRiskCount} At Risk</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Negative feedback received</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{positiveCount} Praise</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Positive responses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EXPLORATORY_GENERAL
  const themeCount = new Set(responses.flatMap(r => r.painPoints || [])).size;

  return (
    <div className="bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <Search className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            Research Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{themeCount}+ Themes</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Unique topics discovered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{avgQuality.toFixed(1)}/10 Depth</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Response quality</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50">{responses.length} Perspectives</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Unique viewpoints</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
