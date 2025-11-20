/**
 * Aggregate Analysis Module
 * 
 * Generates insights across multiple responses for a survey
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { generateAIResponse, AIMessage } from './azure-openai';
import { createClient } from '@/lib/supabase/server';
import { getAnalysesForSurvey } from './response-analysis';

export interface AggregateAnalysisResult {
  executiveSummary: string;
  topThemes: Array<{ theme: string; percentage: number; count: number }>;
  userSegments: Array<{ segment: string; characteristics: string[]; count: number }> | null;
  responseCount: number;
}

/**
 * Generate aggregate analysis for a survey
 * 
 * @param surveyId - The survey ID
 * @param surveyObjective - The survey objective for context
 * @returns Aggregate analysis results
 */
export async function generateAggregateAnalysis(
  surveyId: string,
  surveyObjective: string
): Promise<AggregateAnalysisResult | null> {
  // Fetch all response analyses for this survey
  const analyses = await getAnalysesForSurvey(surveyId);
  
  if (analyses.length === 0) {
    return null;
  }
  
  const responseCount = analyses.length;
  
  // Compile all summaries and themes
  const allSummaries = analyses.map(a => a.summary).join('\n\n');
  const allThemes = analyses.flatMap(a => (a.keyThemes as string[]) || []);
  const allSentiments = analyses.map(a => a.sentiment);
  
  // Count theme frequencies
  const themeFrequency = new Map<string, number>();
  allThemes.forEach(theme => {
    const normalized = theme.toLowerCase().trim();
    themeFrequency.set(normalized, (themeFrequency.get(normalized) || 0) + 1);
  });
  
  // Sort themes by frequency
  const sortedThemes = Array.from(themeFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([theme, count]) => ({
      theme,
      count,
      percentage: Math.round((count / responseCount) * 100),
    }));
  
  // Create aggregate analysis prompt
  const analysisPrompt = `You are analyzing ${responseCount} research conversations to generate aggregate insights.

Survey Objective: ${surveyObjective}

Individual Response Summaries:
${allSummaries}

Top Themes (by frequency):
${sortedThemes.map(t => `- ${t.theme} (${t.percentage}% of responses)`).join('\n')}

Sentiment Distribution:
- Positive: ${allSentiments.filter(s => s === 'POSITIVE').length}
- Neutral: ${allSentiments.filter(s => s === 'NEUTRAL').length}
- Negative: ${allSentiments.filter(s => s === 'NEGATIVE').length}

Generate an aggregate analysis in the following JSON format:

{
  "executiveSummary": "3-5 sentence executive summary of key findings across all responses",
  "topThemes": [
    {"theme": "refined theme name", "percentage": 45, "count": 9},
    {"theme": "another theme", "percentage": 30, "count": 6}
  ],
  "userSegments": ${responseCount >= 15 ? '[{"segment": "segment name", "characteristics": ["trait1", "trait2"], "count": 5}]' : 'null'}
}

Guidelines:
- Executive Summary: Synthesize the most important insights across all responses (3-5 sentences)
- Top Themes: Refine and consolidate the themes, keeping the top 5-8 most significant
- User Segments: ${responseCount >= 15 ? 'Identify 2-4 distinct user segments based on patterns in responses' : 'Set to null (not enough responses for segmentation)'}

Respond with ONLY the JSON object, no additional text.`;

  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a research analyst synthesizing insights from multiple conversations. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ];
    
    const response = await generateAIResponse(messages, {
      temperature: 0.5,
      maxTokens: 1000,
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response
    return {
      executiveSummary: analysis.executiveSummary || 'No executive summary available',
      topThemes: Array.isArray(analysis.topThemes) 
        ? analysis.topThemes.slice(0, 8).map((t: any) => ({
            theme: t.theme || '',
            percentage: typeof t.percentage === 'number' ? t.percentage : 0,
            count: typeof t.count === 'number' ? t.count : 0,
          }))
        : sortedThemes.slice(0, 8),
      userSegments: responseCount >= 15 && Array.isArray(analysis.userSegments)
        ? analysis.userSegments.slice(0, 4).map((s: any) => ({
            segment: s.segment || '',
            characteristics: Array.isArray(s.characteristics) ? s.characteristics : [],
            count: typeof s.count === 'number' ? s.count : 0,
          }))
        : null,
      responseCount,
    };
  } catch (error) {
    console.error('Error generating aggregate analysis:', error);
    
    // Return fallback analysis with basic theme aggregation
    return {
      executiveSummary: `Analysis of ${responseCount} responses. Top themes identified: ${sortedThemes.slice(0, 3).map(t => t.theme).join(', ')}.`,
      topThemes: sortedThemes.slice(0, 8),
      userSegments: null,
      responseCount,
    };
  }
}

/**
 * Save aggregate analysis to the database
 * 
 * @param surveyId - The survey ID
 * @param analysis - The aggregate analysis results
 * @returns The created analysis record ID
 */
export async function saveAggregateAnalysis(
  surveyId: string,
  analysis: AggregateAnalysisResult
): Promise<string | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('AggregateAnalysis')
      .insert({
        surveyId,
        executiveSummary: analysis.executiveSummary,
        topThemes: analysis.topThemes,
        userSegments: analysis.userSegments,
        responseCount: analysis.responseCount,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving aggregate analysis:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error saving aggregate analysis:', error);
    return null;
  }
}

/**
 * Get the latest aggregate analysis for a survey
 * 
 * @param surveyId - The survey ID
 * @returns The latest aggregate analysis or null
 */
export async function getLatestAggregateAnalysis(surveyId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('AggregateAnalysis')
    .select('*')
    .eq('surveyId', surveyId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching aggregate analysis:', error);
    return null;
  }
  
  return data;
}

/**
 * Check if aggregate analysis should be triggered
 * 
 * @param surveyId - The survey ID
 * @returns True if analysis should be triggered
 */
export async function shouldTriggerAggregateAnalysis(surveyId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Get completed response count
  const { count, error } = await supabase
    .from('ConversationSession')
    .select('id', { count: 'exact', head: true })
    .eq('surveyId', surveyId)
    .eq('status', 'COMPLETED');
  
  if (error) {
    console.error('Error checking response count:', error);
    return false;
  }
  
  const completedCount = count || 0;
  
  // Get latest aggregate analysis
  const latestAnalysis = await getLatestAggregateAnalysis(surveyId);
  
  if (!latestAnalysis) {
    // No analysis yet - trigger if we have 5+ responses
    return completedCount >= 5;
  }
  
  // Trigger if we have 5+ new responses since last analysis
  const newResponses = completedCount - latestAnalysis.responseCount;
  return newResponses >= 5;
}

/**
 * Trigger aggregate analysis if conditions are met
 * 
 * @param surveyId - The survey ID
 * @param surveyObjective - The survey objective
 * @returns True if analysis was triggered and completed
 */
export async function triggerAggregateAnalysisIfNeeded(
  surveyId: string,
  surveyObjective: string
): Promise<boolean> {
  const shouldTrigger = await shouldTriggerAggregateAnalysis(surveyId);
  
  if (!shouldTrigger) {
    return false;
  }
  
  try {
    const analysis = await generateAggregateAnalysis(surveyId, surveyObjective);
    
    if (analysis) {
      await saveAggregateAnalysis(surveyId, analysis);
      console.log(`Aggregate analysis generated for survey ${surveyId} (${analysis.responseCount} responses)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error triggering aggregate analysis:', error);
    return false;
  }
}
