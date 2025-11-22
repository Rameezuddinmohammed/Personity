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

  const renderBar = (label: string, count: number, color: string) => {
    const percentage = getPercentage(count);
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-n-600 w-20 text-right">{label}</span>
        <div className="flex-1 h-6 bg-n-100 rounded-lg overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-n-700 w-12">{percentage}%</span>
        <span className="text-xs text-n-500 w-8">({count})</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-n-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-n-950">Persona Insights</h2>
      </div>

      <div className="space-y-8">
        {/* Pain Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-n-600" />
            <h3 className="text-sm font-medium text-n-700">Pain Level</h3>
          </div>
          <div className="space-y-2">
            {renderBar('Low', data.painLevel.low, 'bg-green-500')}
            {renderBar('Medium', data.painLevel.medium, 'bg-yellow-500')}
            {renderBar('High', data.painLevel.high, 'bg-red-500')}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-n-600" />
            <h3 className="text-sm font-medium text-n-700">Experience Level</h3>
          </div>
          <div className="space-y-2">
            {renderBar('Novice', data.experience.novice, 'bg-blue-300')}
            {renderBar('Intermediate', data.experience.intermediate, 'bg-blue-500')}
            {renderBar('Expert', data.experience.expert, 'bg-blue-700')}
          </div>
        </div>

        {/* Decision Readiness */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-n-600" />
            <h3 className="text-sm font-medium text-n-700">Decision Readiness</h3>
          </div>
          <div className="space-y-2">
            {renderBar('Cold', data.readiness.cold, 'bg-gray-400')}
            {renderBar('Warm', data.readiness.warm, 'bg-orange-400')}
            {renderBar('Hot', data.readiness.hot, 'bg-red-600')}
          </div>
          <p className="text-xs text-n-500 mt-3">
            {getPercentage(data.readiness.hot)}% are ready to make a decision
          </p>
        </div>

        {/* Clarity */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-n-600" />
            <h3 className="text-sm font-medium text-n-700">Response Clarity</h3>
          </div>
          <div className="space-y-2">
            {renderBar('Low', data.clarity.low, 'bg-n-300')}
            {renderBar('Medium', data.clarity.medium, 'bg-n-500')}
            {renderBar('High', data.clarity.high, 'bg-n-700')}
          </div>
        </div>
      </div>
    </div>
  );
}
