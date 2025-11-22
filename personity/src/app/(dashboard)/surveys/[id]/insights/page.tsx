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
  Hammer,
  ThumbsUp,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SentimentChart, ThemeChart, QualityGauge } from '@/components/insights/charts';
import { PainPointsHeatmap } from '@/components/dashboard/pain-points-heatmap';
import { ModeSummary } from '@/components/insights/mode-summary';
import { PersonaDistribution } from '@/components/insights/persona-distribution';

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
  painPoints?: string[];
  topQuotes?: Array<{ quote: string; context: string }>;
}

type SurveyMode = 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';

interface Survey {
  id: string;
  title: string;
  objective: string;
  status: string;
  mode?: SurveyMode; // Optional for backward compatibility
}

export default function InsightsPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analysis, setAnalysis] = useState<AggregateAnalysis | null>(null);
  const [responses, setResponses] = useState<ResponseAnalysis[]>([]);
  const [personaData, setPersonaData] = useState<any>(null);
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
        setPersonaData(data.personaData);
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
      const response = await fetch(`/api/surveys/${surveyId}/export/pdf`);
      
      if (response.ok) {
        const data = await response.json();
        // Open download URL
        window.open(data.downloadUrl, '_blank');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Export failed. Please try again.');
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
        a.download = `${survey?.title || 'survey'}-responses-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Export failed. Please try again.');
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

  // Determine which widgets to show based on mode
  const shouldShowWidget = (widget: string) => {
    if (!survey) return true; // Show all if mode not loaded yet
    
    // Default to EXPLORATORY_GENERAL for surveys created before mode feature
    const mode = survey.mode || 'EXPLORATORY_GENERAL';
    
    switch (widget) {
      case 'painPoints':
        return mode === 'PRODUCT_DISCOVERY' || mode === 'FEEDBACK_SATISFACTION';
      case 'themes':
        return true; // All modes show themes
      case 'sentiment':
        return mode === 'FEEDBACK_SATISFACTION'; // Only show for satisfaction surveys
      case 'userSegments':
        return mode === 'PRODUCT_DISCOVERY' || mode === 'EXPLORATORY_GENERAL';
      default:
        return true;
    }
  };

  // Get mode-specific title
  const getDashboardTitle = () => {
    if (!survey) return 'Insights';
    
    const mode = survey.mode || 'EXPLORATORY_GENERAL';
    switch (mode) {
      case 'PRODUCT_DISCOVERY':
        return 'Product Discovery Insights';
      case 'FEEDBACK_SATISFACTION':
        return 'Satisfaction & Feedback Analysis';
      case 'EXPLORATORY_GENERAL':
        return 'Research Insights';
      default:
        return 'Insights';
    }
  };

  // Get mode badge
  const getModeBadge = () => {
    if (!survey) return null;
    
    const mode = survey.mode || 'EXPLORATORY_GENERAL';
    
    const badges = {
      PRODUCT_DISCOVERY: { 
        Icon: Hammer, 
        label: 'Product Discovery', 
        color: 'bg-neutral-100 text-neutral-700 border-neutral-200' 
      },
      FEEDBACK_SATISFACTION: { 
        Icon: ThumbsUp, 
        label: 'Feedback & Satisfaction', 
        color: 'bg-neutral-100 text-neutral-700 border-neutral-200' 
      },
      EXPLORATORY_GENERAL: { 
        Icon: Search, 
        label: 'Exploratory Research', 
        color: 'bg-neutral-100 text-neutral-700 border-neutral-200' 
      },
    };
    
    const badge = badges[mode];
    const Icon = badge.Icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
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
            {responses.length} completed
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Executive summary and top themes will be generated automatically once you have at least 5 completed conversations.
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
              <p className="text-neutral-500 text-sm">No completed conversations yet</p>
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-neutral-950 tracking-tight">
              {getDashboardTitle()}
            </h1>
            {getModeBadge()}
          </div>
          <p className="text-sm text-neutral-600">
            {survey.title} • Analysis of {analysis.responseCount} completed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Download a visual report with charts, themes, and key quotes"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            disabled={isExporting}
            title="Download raw data with all response details for analysis"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Mode-Specific Summary */}
      <ModeSummary mode={survey.mode || 'EXPLORATORY_GENERAL'} responses={responses} />

      {/* Executive Summary */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neutral-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Executive Summary
          </h2>
        </div>
        <p className="text-neutral-700 leading-relaxed">
          {analysis.executiveSummary}
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-neutral-600" />
            <span className="text-sm text-neutral-600">Total Responses</span>
          </div>
          <div className="text-3xl font-semibold text-neutral-950">{analysis.responseCount}</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-neutral-600" />
            <span className="text-sm text-neutral-600">Avg Depth</span>
          </div>
          <div className="text-3xl font-semibold text-neutral-950">
            {(responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length).toFixed(1)}
          </div>
        </div>

        {/* Mode-specific third stat */}
        {(() => {
          const mode = survey.mode || 'EXPLORATORY_GENERAL';
          
          if (mode === 'FEEDBACK_SATISFACTION') {
            // Show satisfaction percentage
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Smile className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm text-neutral-600">Satisfied</span>
                </div>
                <div className="text-3xl font-semibold text-neutral-950">
                  {Math.round((responses.filter(r => r.sentiment === 'POSITIVE').length / responses.length) * 100)}%
                </div>
              </div>
            );
          } else if (mode === 'PRODUCT_DISCOVERY') {
            // Show pain points count
            const painPointsCount = responses.reduce((sum, r) => {
              return sum + (r.painPoints?.length || 0);
            }, 0);
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Frown className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm text-neutral-600">Pain Points</span>
                </div>
                <div className="text-3xl font-semibold text-neutral-950">
                  {painPointsCount}
                </div>
              </div>
            );
          } else {
            // Exploratory: Show unique perspectives (key themes from responses)
            const uniqueThemes = new Set(responses.flatMap(r => r.keyThemes)).size;
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm text-neutral-600">Perspectives</span>
                </div>
                <div className="text-3xl font-semibold text-neutral-950">
                  {uniqueThemes}
                </div>
              </div>
            );
          }
        })()}

        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-neutral-600" />
            <span className="text-sm text-neutral-600">Top Themes</span>
          </div>
          <div className="text-3xl font-semibold text-neutral-950">{analysis.topThemes.length}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mode-specific first chart */}
        {(() => {
          const mode = survey.mode || 'EXPLORATORY_GENERAL';
          
          if (mode === 'FEEDBACK_SATISFACTION') {
            // Show sentiment distribution for feedback surveys
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-neutral-950 mb-4">
                  Sentiment Distribution
                </h3>
                <SentimentChart
                  data={[
                    { sentiment: 'POSITIVE', count: responses.filter(r => r.sentiment === 'POSITIVE').length },
                    { sentiment: 'NEUTRAL', count: responses.filter(r => r.sentiment === 'NEUTRAL').length },
                    { sentiment: 'NEGATIVE', count: responses.filter(r => r.sentiment === 'NEGATIVE').length },
                  ].filter(d => d.count > 0)}
                />
              </div>
            );
          } else if (mode === 'PRODUCT_DISCOVERY') {
            // Show pain points frequency for product discovery
            const allPainPoints = responses.flatMap(r => r.painPoints || []);
            const painPointCounts = allPainPoints.reduce((acc, pp) => {
              acc[pp] = (acc[pp] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const topPainPoints = Object.entries(painPointCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([painPoint, count]) => ({ painPoint, count }));
            
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-neutral-950 mb-4">
                  Top Pain Points
                </h3>
                <div className="space-y-3">
                  {topPainPoints.length > 0 ? (
                    topPainPoints.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="text-sm text-neutral-700 mb-1">{item.painPoint}</div>
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neutral-950 rounded-full"
                              style={{ width: `${(item.count / responses.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-neutral-600">{item.count}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 text-center py-4">No pain points identified yet</p>
                  )}
                </div>
              </div>
            );
          } else {
            // Show theme distribution for exploratory
            return (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-neutral-950 mb-4">
                  Key Themes Distribution
                </h3>
                <div className="space-y-3">
                  {analysis.topThemes.slice(0, 5).map((theme, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm text-neutral-700 mb-1">{theme.theme}</div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-950 rounded-full"
                            style={{ width: `${theme.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium text-neutral-600">{theme.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        })()}

        {/* Quality Gauge */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h3 className="text-base font-semibold text-neutral-950 mb-4">
            Response Quality
          </h3>
          <QualityGauge
            score={responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length}
            context={
              responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length >= 7
                ? 'Most responses are detailed and insightful'
                : responses.reduce((sum, r) => sum + r.qualityScore, 0) / responses.length >= 5
                ? 'Responses have moderate depth'
                : 'Responses could be more detailed'
            }
          />
        </div>
      </div>

      {/* Persona Insights */}
      {personaData && (
        <div className="mb-6">
          <PersonaDistribution 
            data={personaData} 
            totalResponses={analysis.responseCount} 
          />
        </div>
      )}

      {/* Pain Points Heatmap - Product Discovery & Feedback modes */}
      {shouldShowWidget('painPoints') && <PainPointsHeatmap responses={responses} />}

      {/* Top Themes - All modes */}
      {shouldShowWidget('themes') && (
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Discussion Topics
            </h2>
            <p className="text-xs text-neutral-500">
              Main themes that emerged across conversations
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {analysis.topThemes.slice(0, 8).map((theme, index) => (
            <div
              key={index}
              className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <span className="text-sm font-medium text-green-800">
                {theme.theme}
              </span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {theme.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Key Quotes with Sentiment Tags */}
      <div className="bg-white border border-neutral-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-600/10 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-950">
            Key Quotes
          </h2>
        </div>
        <div className="space-y-4">
          {responses
            .filter(r => r.topQuotes && r.topQuotes.length > 0)
            .slice(0, 8)
            .map((response, index) => (
              <div key={index} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0 ${getSentimentColor(
                      response.sentiment
                    )}`}
                  >
                    {getSentimentIcon(response.sentiment)}
                    <span className="text-xs font-medium capitalize">
                      {response.sentiment.toLowerCase()}
                    </span>
                  </div>
                  <p className="text-neutral-700 italic flex-1">
                    "{response.topQuotes?.[0]?.quote || response.summary}"
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date(response.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* User Segments - Product Discovery & Exploratory modes */}
      {shouldShowWidget('userSegments') && analysis.userSegments && analysis.userSegments.length > 0 && (
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
