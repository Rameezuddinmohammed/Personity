'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Quote,
  AlertCircle,
  Lightbulb,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResponseDetail {
  id: string;
  conversationId: string;
  summary: string;
  keyThemes: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  topQuotes: Array<{ quote: string; context: string }>;
  painPoints: string[];
  opportunities: string[];
  qualityScore: number;
  isFlagged: boolean;
  createdAt: string;
  conversation: {
    exchanges: Array<{ role: string; content: string; timestamp: string }>;
    durationSeconds: number;
  };
}

interface Survey {
  id: string;
  title: string;
}

interface NavigationInfo {
  prevId: string | null;
  nextId: string | null;
  currentIndex: number;
  totalCount: number;
}

export default function ResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;
  const conversationId = params.conversationId as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [navigation, setNavigation] = useState<NavigationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  useEffect(() => {
    if (surveyId && conversationId) {
      fetchResponseDetail();
    }
  }, [surveyId, conversationId]);

  const fetchResponseDetail = async () => {
    try {
      const res = await fetch(
        `/api/surveys/${surveyId}/responses/${conversationId}`
      );
      if (res.ok) {
        const data = await res.json();
        setSurvey(data.survey);
        setResponse(data.response);
        setNavigation(data.navigation);
      } else if (res.status === 404) {
        router.push(`/surveys/${surveyId}/insights/responses`);
      }
    } catch (error) {
      console.error('Failed to fetch response detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <Smile className="w-5 h-5 text-green-600" />;
      case 'NEGATIVE':
        return <Frown className="w-5 h-5 text-red-600" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-600" />;
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const navigateToResponse = (conversationId: string) => {
    router.push(`/surveys/${surveyId}/insights/responses/${conversationId}`);
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

  if (!survey || !response) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">Response not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => router.push(`/surveys/${surveyId}/insights/responses`)}
        className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Responses
      </button>

      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-2">
            Response Detail
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {survey.title}
            {navigation && (
              <span className="ml-2">
                • Response {navigation.currentIndex} of {navigation.totalCount}
              </span>
            )}
          </p>
        </div>

        {/* Navigation Buttons */}
        {navigation && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigation.prevId && navigateToResponse(navigation.prevId)}
              disabled={!navigation.prevId}
              className="px-3"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigation.nextId && navigateToResponse(navigation.nextId)}
              disabled={!navigation.nextId}
              className="px-3"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Sentiment */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Sentiment</p>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getSentimentColor(response.sentiment)}`}>
            {getSentimentIcon(response.sentiment)}
            <span className="text-sm font-medium capitalize">
              {response.sentiment.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Duration</p>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
              {formatDuration(response.conversation.durationSeconds)}
            </span>
          </div>
        </div>

        {/* Exchanges */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Exchanges</p>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
              {response.conversation.exchanges.filter(e => e.role === 'user').length}
            </span>
          </div>
        </div>
      </div>

      {/* Flagged Warning */}
      {response.isFlagged && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 mb-1">
              Quality Issue Detected
            </p>
            <p className="text-sm text-red-700">
              This response was flagged for potential quality issues (low engagement, spam, or suspicious patterns).
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-3">Summary</h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{response.summary}</p>
      </div>

      {/* Key Themes */}
      {response.keyThemes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Key Themes</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {response.keyThemes.map((theme, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-sm rounded-lg"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Quotes */}
      {response.topQuotes.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Quote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Top Quotes</h2>
          </div>
          <div className="space-y-4">
            {response.topQuotes.map((quote, index) => (
              <div key={index} className="border-l-4 border-blue-600 dark:border-blue-400 pl-4">
                <p className="text-neutral-700 dark:text-neutral-300 italic mb-2">"{quote.quote}"</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{quote.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pain Points */}
        {response.painPoints.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Pain Points</h2>
            </div>
            <ul className="space-y-2">
              {response.painPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {response.opportunities.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Opportunities</h2>
            </div>
            <ul className="space-y-2">
              {response.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Conversation Transcript */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6">
        <button
          onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
            Full Transcript
          </h2>
          {isTranscriptExpanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>
        
        {isTranscriptExpanded && (
          <div className="space-y-4 mt-4">
            {response.conversation.exchanges.map((exchange, index) => (
              <div
                key={index}
                className={`flex ${exchange.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    exchange.role === 'user'
                      ? 'bg-blue-600/10 text-neutral-950 dark:text-neutral-50'
                      : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-950 dark:text-neutral-50'
                  }`}
                >
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                    {exchange.role === 'user' ? 'Respondent' : 'AI'}
                  </p>
                  <p className="text-sm leading-relaxed">{exchange.content}</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                    {new Date(exchange.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
