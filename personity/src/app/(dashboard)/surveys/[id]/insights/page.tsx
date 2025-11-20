'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  FileText,
  TrendingUp,
  Users,
  MessageSquare,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Star,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AggregateAnalysis {
  id: string;
  executiveSummary: string;
  topThemes: Array<{ theme: string; percentage: number; count: number }>;
  userSegments: Array<{ segment: string; characteristics: string[]; count: number }> | null;
  responseCount: number;
  createdAt: string;
}

interface ResponseAnalysis {
  id: string;
  conversationId: string;
  summary: string;
  keyThemes: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  qualityScore: number;
  createdAt: string;
  isFlagged: boolean;
}

interface Survey {
  id: string;
  title: string;
  objective: string;
  status: string;
}

export default function InsightsPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analysis, setAnalysis] = useState<AggregateAnalysis | null>(null);
  const [responses, setResponses] = useState<ResponseAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchInsights();
      fetchResponses();
    }
  }, [surveyId]);

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/insights`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data.survey);
        setAnalysis(data.analysis);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResponses = async () => {
    setIsLoadingResponses(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`);
      if (response.ok) {
        const data = await response.json();
        setResponses(data.responses);
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}/export/pdf`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Open download URL
        window.open(data.downloadUrl, '_blank');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/surveys/${surveyId}/export/csv`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${survey?.title || 'survey'}-responses.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white border border-neutral-200 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Survey not found</p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <Smile className="w-4 h-4 text-green-600" />;
      case 'NEGATIVE':
        return <Frown className="w-4 h-4 text-red-600" />;
      default:
        return <Meh className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600 bg-green-600/10';
      case 'NEGATIVE':
        return 'text-red-600 bg-red-600/10';
      default:
        return 'text-yellow-600 bg-yellow-600/10';
    }
  };

  // Show partial insights if no aggregate analysis yet
  if (!analysis) {
    return (
      <div>
        {/* Back Button */}
        <button
          onClick={() => router.push(`/surveys/${surveyId}`)}
          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Survey
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-950 tracking-tight mb-2">
            Insights: {survey.title}
          </h1>
          <p className="text-sm text-neutral-600">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} completed
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Executive summary and top themes will be generated automatically once you have at least 5 completed responses.
          </p>
        </div>

        {/* Individual Responses */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-950 mb-6">
            Individual Responses
          </h2>

          {isLoadingResponses ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500 text-sm">No completed responses yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  onClick={() =>
                    router.push(
                      `/surveys/${surveyId}/insights/responses/${response.conversationId}`
                    )
                  }
                  className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 rounded ${getSentimentColor(
                          response.sentiment
                        )}`}
                      >
                        {getSentimentIcon(response.sentiment)}
                        <span className="text-xs font-medium capitalize">
                          {response.sentiment.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 rounded">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-neutral-700">
                          {response.qualityScore}/10
                        </span>
                      </div>
                      {response.isFlagged && (
                        <div className="px-2 py-1 bg-red-600/10 text-red-600 rounded">
                          <span className="text-xs font-medium">Flagged</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(response.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 mb-3 line-clamp-2">
                    {response.summary}
                  </p>
                  {response.keyThemes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <TrendingUp className="w-4 h-4 text-neutral-400" />
                      {response.keyThemes.slice(0, 3).map((theme, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded"
                        >
                          {theme}
                        </span>
                      ))}
                      {response.keyThemes.length > 3 && (
                        <span className="text-xs text-neutral-500">
                          +{response.keyThemes.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push(`/surveys/${surveyId}`)}
        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-950 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Survey
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-neutral-950 tracking-tight mb-2">
            Insights: {survey.title}
          </h1>
          <p className="text-sm text-neutral-600">
            Analysis of {analysis.responseCount} completed {analysis.responseCount === 1 ? 'response' : 'responses'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Executive Summary
          </h2>
        </div>
        <p className="text-neutral-700 leading-relaxed">
          {analysis.executiveSummary}
        </p>
      </div>

      {/* Top Themes */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Top Themes
          </h2>
        </div>
        <div className="space-y-4">
          {analysis.topThemes.map((theme, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-950 capitalize">
                  {theme.theme}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500">
                    {theme.count} {theme.count === 1 ? 'response' : 'responses'}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {theme.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${theme.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Segments */}
      {analysis.userSegments && analysis.userSegments.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-950">
              User Segments
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.userSegments.map((segment, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-neutral-950">
                    {segment.segment}
                  </h3>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded">
                    {segment.count} {segment.count === 1 ? 'user' : 'users'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {segment.characteristics.map((char, charIndex) => (
                    <li
                      key={charIndex}
                      className="flex items-start gap-2 text-sm text-neutral-600"
                    >
                      <span className="text-neutral-400 mt-0.5">•</span>
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Individual Responses */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Individual Responses
          </h2>
        </div>
        <p className="text-sm text-neutral-600 mb-6">
          View detailed analysis and transcripts for each response
        </p>
        <Button
          variant="default"
          onClick={() => router.push(`/surveys/${surveyId}/insights/responses`)}
        >
          View All Responses
        </Button>
      </div>
    </div>
  );
}
