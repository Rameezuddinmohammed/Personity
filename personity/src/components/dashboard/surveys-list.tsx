'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, BarChart3, Pause, Play, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Survey {
  id: string;
  title: string;
  objective: string;
  status: 'active' | 'paused' | 'completed';
  shortUrl: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  completedCount: number;
  completionRate: number;
}

export function SurveysList() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/surveys/list');
      if (response.ok) {
        const data = await response.json();
        setSurveys(data.surveys);
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndicator = (status: string) => {
    const config = {
      ACTIVE: { color: 'bg-green-600', text: 'Active' },
      PAUSED: { color: 'bg-yellow-600', text: 'Paused' },
      COMPLETED: { color: 'bg-neutral-400', text: 'Completed' },
    };

    const statusConfig = config[status as keyof typeof config] || config.ACTIVE;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
        <span className="text-sm font-medium text-neutral-700">{statusConfig.text}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="bg-[hsl(var(--color-card))] border rounded-2xl p-16 text-center shadow-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--color-primary))]/10 to-[hsl(var(--color-primary))]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-[hsl(var(--color-primary))]" />
        </div>
        <h3 className="text-xl font-bold text-[hsl(var(--color-foreground))] mb-3">
          No surveys yet
        </h3>
        <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-8 max-w-md mx-auto leading-relaxed">
          Create your first survey to start gathering insights through AI-powered conversations.
        </p>
        <Button
          onClick={() => router.push('/surveys/create')}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="bg-[hsl(var(--color-card))] border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[hsl(var(--color-primary))]/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          onClick={() => router.push(`/surveys/${survey.id}`)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[hsl(var(--color-foreground))] mb-1">
                {survey.title}
              </h3>
              {getStatusIndicator(survey.status)}
              <p className="text-sm text-[hsl(var(--color-muted-foreground))] line-clamp-2">
                {survey.objective}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-neutral-500 mb-1">Total Responses</p>
              <p className="text-2xl font-semibold text-neutral-950">
                {survey.responseCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-green-600">
                {survey.completedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Completion Rate</p>
              <p className="text-2xl font-semibold text-blue-600">
                {survey.completionRate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1">Created</p>
              <p className="text-sm font-medium text-neutral-700">
                {formatDate(survey.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span>Survey Link:</span>
              <code className="px-2 py-1 bg-neutral-100 rounded text-neutral-700">
                {window.location.origin}/s/{survey.shortUrl}
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/s/${survey.shortUrl}`
                  );
                }}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/surveys/${survey.id}/insights`);
                }}
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Insights
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
