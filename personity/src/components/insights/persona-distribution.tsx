'use client';

import { Users, TrendingUp, Zap, Target, MessageCircle, Flame, Snowflake, Wind } from 'lucide-react';

interface PersonaData {
  painLevel: { low: number; medium: number; high: number };
  experience: { novice: number; intermediate: number; expert: number };
  sentiment: { positive: number; neutral: number; negative: number };
  readiness: { cold: number; warm: number; hot: number };
  clarity: { low: number; medium: number; high: number };
}

interface PersonaDistributionProps {
  data: PersonaData;
  totalResponses: number;
}

export function PersonaDistribution({ data, totalResponses }: PersonaDistributionProps) {
  const getPercentage = (count: number) => {
    if (totalResponses === 0) return 0;
    return Math.round((count / totalResponses) * 100);
  };

  const hasData = totalResponses > 0;

  // Calculate dominant segments
  const dominantPain = Object.entries(data.painLevel).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantExperience = Object.entries(data.experience).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const dominantReadiness = Object.entries(data.readiness).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    segments: { label: string; count: number; color: string; bgColor: string }[]
  ) => {
    const total = segments.reduce((sum, seg) => sum + seg.count, 0);
    
    return (
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">{title}</h3>
        </div>
        
        <div className="space-y-3">
          {segments.map((segment) => {
            const percentage = getPercentage(segment.count);
            return (
              <div key={segment.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {segment.label}
                  </span>
                  <span className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${segment.bgColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {segment.count} {segment.count === 1 ? 'response' : 'responses'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSegmentCard = (
    icon: React.ReactNode,
    title: string,
    percentage: number,
    count: number,
    description: string,
    accentColor: string
  ) => (
    <div className={`bg-white dark:bg-zinc-900 border-2 ${accentColor} rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">{title}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">{percentage}%</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{count} total</div>
        </div>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Persona Insights</h2>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No persona data available yet. Complete more responses to see insights.
          </p>
        </div>
      ) : (
        <>
          {/* Key Segments - Decision Ready */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Decision Readiness Segments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderSegmentCard(
                <Flame className="w-5 h-5 text-red-600 dark:text-red-400" />,
                'Hot Leads',
                getPercentage(data.readiness.hot),
                data.readiness.hot,
                'Ready to make a decision now',
                'border-red-200 dark:border-red-900'
              )}
              {renderSegmentCard(
                <Wind className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
                'Warm Prospects',
                getPercentage(data.readiness.warm),
                data.readiness.warm,
                'Evaluating options actively',
                'border-orange-200 dark:border-orange-900'
              )}
              {renderSegmentCard(
                <Snowflake className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
                'Cold Leads',
                getPercentage(data.readiness.cold),
                data.readiness.cold,
                'Early stage, not ready yet',
                'border-blue-200 dark:border-blue-900'
              )}
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Detailed Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderMetricCard(
                <Zap className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />,
                'Pain Level',
                [
                  { label: 'High', count: data.painLevel.high, color: 'text-red-600', bgColor: 'bg-red-600 dark:bg-red-500' },
                  { label: 'Medium', count: data.painLevel.medium, color: 'text-orange-600', bgColor: 'bg-orange-500 dark:bg-orange-400' },
                  { label: 'Low', count: data.painLevel.low, color: 'text-neutral-600', bgColor: 'bg-neutral-400 dark:bg-neutral-500' },
                ]
              )}

              {renderMetricCard(
                <TrendingUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />,
                'Experience',
                [
                  { label: 'Expert', count: data.experience.expert, color: 'text-green-600', bgColor: 'bg-green-600 dark:bg-green-500' },
                  { label: 'Intermediate', count: data.experience.intermediate, color: 'text-blue-600', bgColor: 'bg-blue-500 dark:bg-blue-400' },
                  { label: 'Novice', count: data.experience.novice, color: 'text-neutral-600', bgColor: 'bg-neutral-400 dark:bg-neutral-500' },
                ]
              )}

              {renderMetricCard(
                <Target className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />,
                'Readiness',
                [
                  { label: 'Hot', count: data.readiness.hot, color: 'text-red-600', bgColor: 'bg-red-600 dark:bg-red-500' },
                  { label: 'Warm', count: data.readiness.warm, color: 'text-orange-600', bgColor: 'bg-orange-500 dark:bg-orange-400' },
                  { label: 'Cold', count: data.readiness.cold, color: 'text-blue-600', bgColor: 'bg-blue-400 dark:bg-blue-500' },
                ]
              )}

              {renderMetricCard(
                <MessageCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />,
                'Clarity',
                [
                  { label: 'High', count: data.clarity.high, color: 'text-green-600', bgColor: 'bg-green-600 dark:bg-green-500' },
                  { label: 'Medium', count: data.clarity.medium, color: 'text-blue-600', bgColor: 'bg-blue-500 dark:bg-blue-400' },
                  { label: 'Low', count: data.clarity.low, color: 'text-neutral-600', bgColor: 'bg-neutral-400 dark:bg-neutral-500' },
                ]
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
