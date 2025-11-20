'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseAnalysis {
  painPoints?: string[];
}

interface PainPointsHeatmapProps {
  responses: ResponseAnalysis[];
}

export function PainPointsHeatmap({ responses }: PainPointsHeatmapProps) {
  // 1. Aggregate and Count Pain Points
  const aggregatedPoints = useMemo(() => {
    const counts = new Map<string, number>();

    responses.forEach((r) => {
      if (Array.isArray(r.painPoints)) {
        r.painPoints.forEach((point) => {
          // Normalize slightly to catch duplicates (case insensitive)
          const normalized = point.trim();
          counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
      }
    });

    // Convert to array and sort by count (highest first)
    return Array.from(counts.entries())
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 only to prevent clutter
  }, [responses]);

  if (aggregatedPoints.length === 0) return null;

  // Calculate max count for scaling intensity
  const maxCount = Math.max(...aggregatedPoints.map((p) => p.count));

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <Flame className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Friction Heatmap
          </h2>
          <p className="text-xs text-neutral-500">
            Frequency of pain points mentioned across {responses.length}{' '}
            responses
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {aggregatedPoints.map((point, index) => {
          // 2. Determine Intensity Level (1-4)
          // If maxCount is 1 (early survey), everything is level 1.
          const intensity =
            maxCount > 1 ? Math.ceil((point.count / maxCount) * 4) : 1;

          return (
            <div
              key={index}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-default group',
                // 3. Dynamic Styling based on Intensity
                intensity === 1 &&
                  'bg-neutral-50 text-neutral-600 border border-neutral-200', // Cold
                intensity === 2 &&
                  'bg-red-50 text-red-700 border border-red-100', // Warm
                intensity === 3 &&
                  'bg-red-100 text-red-800 border border-red-200', // Hot
                intensity === 4 &&
                  'bg-red-600 text-white shadow-md shadow-red-200 border border-red-700' // Burning
              )}
            >
              <span>{point.text}</span>
              {point.count > 1 && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full',
                    intensity === 4
                      ? 'bg-white/20 text-white'
                      : 'bg-black/5 text-current'
                  )}
                >
                  {point.count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
