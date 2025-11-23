/**
 * Response Analysis Module
 * 
 * Analyzes completed conversations to extract insights
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7
 */

import { generateAIResponse, AIMessage } from './azure-openai';
import { createClient } from '@/lib/supabase/server';

export interface ResponseAnalysisResult {
  summary: string;
  keyThemes: string[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  topQuotes: Array<{ quote: string; context: string }>;
  painPoints: string[];
  opportunities: string[];
  qualityScore: number;
}

/**
 * Analyze a completed conversation to extract insights
 * 
 * @param conversationId - The conversation ID to analyze
 * @param exchanges - The conversation exchanges
 * @param surveyObjective - The survey objective for context
 * @returns Analysis results
 */
export async function analyzeConversation(
  conversationId: string,
  exchanges: Array<{ role: string; content: string; timestamp: string }>,
  surveyObjective: string
): Promise<ResponseAnalysisResult> {
  // Build conversation text for analysis
  const conversationText = exchanges
    .map(ex => `${ex.role === 'user' ? 'Respondent' : 'AI'}: ${ex.content}`)
    .join('\n\n');
  
  // Create analysis prompt
  const analysisPrompt = `You are analyzing a research conversation to extract key insights.

Survey Objective: ${surveyObjective}

Conversation:
${conversationText}

Analyze this conversation and provide a structured response in the following JSON format:

{
  "summary": "2-3 sentence summary of the key points discussed",
  "keyThemes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "topQuotes": [
    {"quote": "exact quote from respondent", "context": "why this quote is significant"},
    {"quote": "another quote", "context": "significance"}
  ],
  "painPoints": ["pain point 1", "pain point 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "qualityScore": 8
}

Guidelines:
- Summary: Capture the essence of what the respondent shared (2-3 sentences)
- Key Themes: Extract 2-5 main themes or topics discussed
- Sentiment: Overall tone (POSITIVE if enthusiastic/satisfied, NEGATIVE if frustrated/dissatisfied, NEUTRAL otherwise)
- Top Quotes: Select 1-3 most insightful or representative quotes with context
- Pain Points: Identify problems, frustrations, or challenges mentioned
- Opportunities: Identify potential improvements, desires, or unmet needs
- Quality Score: Rate 1-10 based on:
  * 1-3: Spam, trolling, nonsense, one-word answers, or completely off-topic
  * 4-5: Low effort, vague, or minimal engagement
  * 6-7: Adequate responses with some useful information
  * 8-9: Thoughtful, detailed, and on-topic responses
  * 10: Exceptional depth, specificity, and actionable insights

RED FLAGS for low scores (1-4):
- Gibberish, random characters, or nonsensical text
- Obvious trolling or joke responses
- Repeated one-word answers or "I don't know"
- Completely off-topic or irrelevant responses
- Copy-pasted text or spam
- Hostile, abusive, or inappropriate content

Respond with ONLY the JSON object, no additional text.`;

  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a research analyst extracting insights from conversations. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ];
    
    const response = await generateAIResponse(messages, {
      temperature: 0.5,
      maxTokens: 800,
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the response
    return {
      summary: analysis.summary || 'No summary available',
      keyThemes: Array.isArray(analysis.keyThemes) ? analysis.keyThemes.slice(0, 5) : [],
      sentiment: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(analysis.sentiment) 
        ? analysis.sentiment 
        : 'NEUTRAL',
      topQuotes: Array.isArray(analysis.topQuotes) 
        ? analysis.topQuotes.slice(0, 3).map((q: any) => ({
            quote: q.quote || '',
            context: q.context || '',
          }))
        : [],
      painPoints: Array.isArray(analysis.painPoints) ? analysis.painPoints : [],
      opportunities: Array.isArray(analysis.opportunities) ? analysis.opportunities : [],
      qualityScore: typeof analysis.qualityScore === 'number' 
        ? Math.max(1, Math.min(10, analysis.qualityScore))
        : 5,
    };
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    
    // Return fallback analysis
    return {
      summary: 'Analysis failed - conversation completed but insights could not be extracted.',
      keyThemes: [],
      sentiment: 'NEUTRAL',
      topQuotes: [],
      painPoints: [],
      opportunities: [],
      qualityScore: 5,
    };
  }
}

/**
 * Save analysis results to the database
 * 
 * @param conversationId - The conversation ID
 * @param analysis - The analysis results
 * @param isFlagged - Whether the conversation was flagged for quality issues
 * @param personaInsights - Optional persona insights from the conversation
 * @returns The created analysis record ID
 */
export async function saveAnalysis(
  conversationId: string,
  analysis: ResponseAnalysisResult,
  isFlagged: boolean = false,
  personaInsights?: any
): Promise<string | null> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('ResponseAnalysis')
      .insert({
        conversationId,
        summary: analysis.summary,
        keyThemes: analysis.keyThemes,
        sentiment: analysis.sentiment,
        topQuotes: analysis.topQuotes,
        painPoints: analysis.painPoints,
        opportunities: analysis.opportunities,
        qualityScore: analysis.qualityScore,
        isFlagged,
        personaInsights: personaInsights || null,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving analysis:', error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return null;
  }
}

/**
 * Get analysis for a conversation
 * 
 * @param conversationId - The conversation ID
 * @returns The analysis record or null
 */
export async function getAnalysis(conversationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('ResponseAnalysis')
    .select('*')
    .eq('conversationId', conversationId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching analysis:', error);
    return null;
  }
  
  return data;
}

/**
 * Get all analyses for a survey
 * 
 * @param surveyId - The survey ID
 * @returns Array of analysis records
 */
export async function getAnalysesForSurvey(surveyId: string) {
  const supabase = await createClient();
  
  // Get all conversations for this survey
  const { data: sessions, error: sessionsError } = await supabase
    .from('ConversationSession')
    .select('id')
    .eq('surveyId', surveyId)
    .eq('status', 'COMPLETED');
  
  if (sessionsError || !sessions) {
    console.error('Error fetching sessions:', sessionsError);
    return [];
  }
  
  const sessionIds = sessions.map(s => s.id);
  
  if (sessionIds.length === 0) {
    return [];
  }
  
  // Get conversations for these sessions
  const { data: conversations, error: conversationsError } = await supabase
    .from('Conversation')
    .select('id')
    .in('sessionId', sessionIds);
  
  if (conversationsError || !conversations) {
    console.error('Error fetching conversations:', conversationsError);
    return [];
  }
  
  const conversationIds = conversations.map(c => c.id);
  
  if (conversationIds.length === 0) {
    return [];
  }
  
  // Get analyses for these conversations
  // ONLY include quality responses (score >= 6 and not flagged)
  const { data: analyses, error: analysesError } = await supabase
    .from('ResponseAnalysis')
    .select('*')
    .in('conversationId', conversationIds)
    .gte('qualityScore', 6)
    .eq('isFlagged', false)
    .order('createdAt', { ascending: false });
  
  if (analysesError) {
    console.error('Error fetching analyses:', analysesError);
    return [];
  }
  
  return analyses || [];
}
