'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Pause,
  Play,
  Trash2,
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Survey {
  id: string;
  title: string;
  objective: string;
  context: any;
  topics: string[];
  settings: any;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  shortUrl: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalResponses: number;
    completedResponses: number;
    activeResponses: number;
    pausedResponses: number;
    completionRate: number;
  };
}

export default function SurveyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurvey();
    }
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data.survey);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch survey:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!survey) return;

    setIsUpdating(true);
    try {
      const newStatus = survey.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setSurvey({ ...survey, status: data.survey.status });
      }
    } catch (error) {
      console.error('Failed to update survey:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!survey) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete survey:', error);
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSurveyUrl = () => {
    if (typeof window !== 'undefined' && survey) {
      return `${window.location.origin}/s/${survey.shortUrl}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-neutral-200 dark:bg-zinc-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">Survey not found</p>
      </div>
    );
  }



  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-2">
            {survey.title}
          </h1>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  survey.status === 'ACTIVE'
                    ? 'bg-green-600'
                    : survey.status === 'PAUSED'
                    ? 'bg-yellow-600'
                    : 'bg-neutral-400 dark:bg-neutral-500'
                }`}
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {survey.status === 'ACTIVE'
                  ? 'Active'
                  : survey.status === 'PAUSED'
                  ? 'Paused'
                  : 'Completed'}
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {survey.objective}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleToggleStatus}
            disabled={isUpdating}
          >
            {survey.status === 'ACTIVE' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isUpdating}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Engaged</p>
          </div>
          <p className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {survey.stats.totalResponses}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
          </div>
          <p className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {survey.stats.completedResponses}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Active</p>
          </div>
          <p className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {survey.stats.activeResponses}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Completion Rate</p>
          </div>
          <p className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
            {survey.stats.completionRate}%
          </p>
        </div>
      </div>

      {/* View Insights CTA */}
      {survey.stats.completedResponses > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-950 dark:text-neutral-50 mb-1">
                {survey.stats.completedResponses} {survey.stats.completedResponses === 1 ? 'response' : 'responses'} analyzed
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                View insights, themes, and sentiment analysis
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/surveys/${surveyId}/insights`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Insights
          </Button>
        </div>
      )}

      {/* Survey Link */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
          Survey Link
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <code className="text-sm text-neutral-700">{getSurveyUrl()}</code>
          </div>
          <Button
            variant="secondary"
            onClick={() => copyToClipboard(getSurveyUrl())}
            className="relative"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <a
            href={getSurveyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </a>
        </div>
      </div>

      {/* Survey Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-neutral-950 mb-4">
            Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Length</p>
              <p className="text-sm text-neutral-950 capitalize">
                {survey.settings.length}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Tone</p>
              <p className="text-sm text-neutral-950 capitalize">
                {survey.settings.tone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 mb-1">Stop Condition</p>
              <p className="text-sm text-neutral-950 capitalize">
                {survey.settings.stopCondition.replace('_', ' ')}
              </p>
            </div>
            {survey.settings.maxQuestions && (
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">Max Questions</p>
                <p className="text-sm text-neutral-950">
                  {survey.settings.maxQuestions}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-neutral-950 mb-4">
            Key Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {survey.topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-lg"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 max-w-md w-full z-50">
            <h3 className="text-lg font-semibold text-neutral-950 mb-2">
              Delete Survey?
            </h3>
            <p className="text-sm text-neutral-600 mb-6">
              This will permanently delete this survey and all associated responses. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isUpdating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Survey
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
