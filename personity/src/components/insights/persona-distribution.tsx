'use client';

import { Users, TrendingUp, Zap, Target, MessageCircle } from 'lucide-react';

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

  // Check if there's any data
  const hasData = totalResponses > 0;

  const renderBar = (label: string, count: number, intensity: 'light' | 'medium' | 'dark') => {
    const percentage = getPercentage(count);
    const barColor = intensity === 'dark' ? 'bg-neutral-950' : intensity === 'medium' ? 'bg-neutral-600' : 'bg-neutral-300';
    
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-700 w-24 font-medium">{label}</span>
        <div className="flex-1 h-8 bg-neutral-100 rounded overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 flex items-center justify-end pr-3`}
            style={{ width: `${percentage}%` }}
          >
            {percentage > 10 && (
              <span className="text-xs font-semibold text-white">{percentage}%</span>
            )}
          </div>
        </div>
        {percentage <= 10 && (
          <span className="text-xs font-medium text-neutral-600 w-12">{percentage}%</span>
        )}
        <span className="text-xs text-neutral-500 w-10 text-right">({count})</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-neutral-600" />
        <h2 className="text-lg font-semibold text-neutral-950">Persona Insights</h2>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-500">No persona data available yet. Complete more responses to see insights.</p>
        </div>
      ) : (
        <div className="space-y-8">
        {/* Pain Level */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-semibold text-neutral-950">Pain Level</h3>
          </div>
          <div className="space-y-3">
            {renderBar('Low', data.painLevel.low, 'light')}
            {renderBar('Medium', data.painLevel.medium, 'medium')}
            {renderBar('High', data.painLevel.high, 'dark')}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-semibold text-neutral-950">Experience Level</h3>
          </div>
          <div className="space-y-3">
            {renderBar('Novice', data.experience.novice, 'light')}
            {renderBar('Intermediate', data.experience.intermediate, 'medium')}
            {renderBar('Expert', data.experience.expert, 'dark')}
          </div>
        </div>

        {/* Decision Readiness */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-semibold text-neutral-950">Decision Readiness</h3>
          </div>
          <div className="space-y-3">
            {renderBar('Cold', data.readiness.cold, 'light')}
            {renderBar('Warm', data.readiness.warm, 'medium')}
            {renderBar('Hot', data.readiness.hot, 'dark')}
          </div>
          <p className="text-xs text-neutral-500 mt-4 pl-28">
            {getPercentage(data.readiness.hot)}% are ready to make a decision
          </p>
        </div>

        {/* Clarity */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-neutral-600" />
            <h3 className="text-sm font-semibold text-neutral-950">Response Clarity</h3>
          </div>
          <div className="space-y-3">
            {renderBar('Low', data.clarity.low, 'light')}
            {renderBar('Medium', data.clarity.medium, 'medium')}
            {renderBar('High', data.clarity.high, 'dark')}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
