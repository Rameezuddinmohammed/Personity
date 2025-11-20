'use client';

import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, Hammer, ThumbsUp, Search } from 'lucide-react';

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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Hammer className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">
              Product Discovery Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{totalPainPoints} Pain Points</p>
                  <p className="text-xs text-neutral-600">Identified across responses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{avgQuality.toFixed(1)}/10 Depth</p>
                  <p className="text-xs text-neutral-600">Average response quality</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{responses.length} Insights</p>
                  <p className="text-xs text-neutral-600">Validated with users</p>
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
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <ThumbsUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">
              Satisfaction Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {satisfactionRate >= 70 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-950">{satisfactionRate}% Satisfied</p>
                  <p className="text-xs text-neutral-600">Positive sentiment rate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{atRiskCount} At Risk</p>
                  <p className="text-xs text-neutral-600">Negative feedback received</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-950">{positiveCount} Praise</p>
                  <p className="text-xs text-neutral-600">Positive responses</p>
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
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Search className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-950 mb-2">
            Research Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-neutral-950">{themeCount}+ Themes</p>
                <p className="text-xs text-neutral-600">Unique topics discovered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-neutral-950">{avgQuality.toFixed(1)}/10 Depth</p>
                <p className="text-xs text-neutral-600">Response quality</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-neutral-950">{responses.length} Perspectives</p>
                <p className="text-xs text-neutral-600">Unique viewpoints</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
