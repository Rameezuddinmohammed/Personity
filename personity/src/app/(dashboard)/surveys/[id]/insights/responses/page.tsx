'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const ITEMS_PER_PAGE = 20;

export default function ResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<ResponseAnalysis[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<ResponseAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (surveyId) {
      fetchResponses();
    }
  }, [surveyId]);

  useEffect(() => {
    // Client-side search filtering only
    if (searchQuery.trim() === '') {
      setFilteredResponses(responses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = responses.filter(
        (response) =>
          response.summary.toLowerCase().includes(query) ||
          response.keyThemes.some((theme) =>
            theme.toLowerCase().includes(query)
          )
      );
      setFilteredResponses(filtered);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, responses]);

  const fetchResponses = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/responses`);
      if (response.ok) {
        const data = await response.json();
        setSurvey(data.survey);
        setResponses(data.responses);
        setFilteredResponses(data.responses);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResponses = filteredResponses.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
        onClick={() => router.push(`/surveys/${surveyId}/insights`)}
        className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Insights
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-2">
          Individual Responses
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {survey.title} • {filteredResponses.length} {filteredResponses.length === 1 ? 'response' : 'responses'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search all responses by summary or themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg text-sm text-neutral-950 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
          />
        </div>
        
        {/* Info Note */}
        {responses.some(r => r.qualityScore < 6 || r.isFlagged) && (
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-zinc-700">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              💡 Low-quality responses are tagged but shown here for transparency. They're automatically excluded from insights analysis.
            </p>
          </div>
        )}
      </div>

      {/* Responses List */}
      {currentResponses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            {searchQuery ? 'No Matching Responses' : 'No Responses Yet'}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Responses will appear here once conversations are completed'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {currentResponses.map((response) => (
              <div
                key={response.id}
                onClick={() =>
                  router.push(
                    `/surveys/${surveyId}/insights/responses/${response.conversationId}`
                  )
                }
                className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Sentiment Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getSentimentColor(
                        response.sentiment
                      )}`}
                    >
                      {getSentimentIcon(response.sentiment)}
                      <span className="text-xs font-medium capitalize">
                        {response.sentiment.toLowerCase()}
                      </span>
                    </div>

                    {/* Quality Score Badge */}
                    <div className={`px-2.5 py-1 rounded-lg ${
                      response.qualityScore >= 8 
                        ? 'bg-green-600/10 text-green-600'
                        : response.qualityScore >= 6
                        ? 'bg-blue-600/10 text-blue-600'
                        : 'bg-orange-600/10 text-orange-600'
                    }`}>
                      <span className="text-xs font-medium">Score: {response.qualityScore}/10</span>
                    </div>

                    {/* Flagged Badge */}
                    {response.isFlagged && (
                      <div className="px-2.5 py-1 bg-red-600/10 text-red-600 rounded-lg">
                        <span className="text-xs font-medium">Low Quality</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(response.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-2">
                  {response.summary}
                </p>

                {/* Key Themes */}
                {response.keyThemes.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <TrendingUp className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    {response.keyThemes.slice(0, 3).map((theme, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 text-xs rounded"
                      >
                        {theme}
                      </span>
                    ))}
                    {response.keyThemes.length > 3 && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        +{response.keyThemes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredResponses.length)} of{' '}
                {filteredResponses.length}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
