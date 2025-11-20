'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SurveysList } from '@/components/dashboard/surveys-list';

interface Survey {
  id: string;
  title: string;
  objective: string;
  status: string;
  shortUrl: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  completedCount: number;
  completionRate: number;
}

export default function SurveysPage() {
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
        setSurveys(data.surveys || []);
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 tracking-tight mb-1">
            Surveys
          </h1>
          <p className="text-sm text-neutral-600">
            Manage and view your conversational surveys
          </p>
        </div>
        <Button onClick={() => router.push('/surveys/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Surveys List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse"
            >
              <div className="h-5 bg-neutral-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">
              No surveys yet
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              Create your first conversational survey to start gathering insights
            </p>
            <Button onClick={() => router.push('/surveys/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Survey
            </Button>
          </div>
        </div>
      ) : (
        <SurveysList surveys={surveys} />
      )}
    </div>
  );
}
