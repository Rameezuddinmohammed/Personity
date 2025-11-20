/**
 * Survey Mode Detection
 * 
 * Analyzes survey objectives to determine the appropriate research mode
 */

import { generateAIResponse, AIMessage } from './azure-openai';

export type SurveyMode = 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';

export interface ModeDetectionResult {
  mode: SurveyMode;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  suggestedContextQuestions: string[];
}

/**
 * Detect the appropriate research mode based on survey objective
 */
export async function detectSurveyMode(objective: string): Promise<ModeDetectionResult> {
  const detectionPrompt = `You are analyzing a research survey objective to determine its primary intent.

Survey Objective: "${objective}"

Analyze this objective and classify it into one of three research modes:

1. PRODUCT_DISCOVERY - Validating ideas, finding pain points, testing features, understanding product-market fit
   Examples: "test if people would use my app", "find pain points in lead management", "validate my SaaS idea"

2. FEEDBACK_SATISFACTION - Measuring satisfaction, understanding churn, evaluating experiences, NPS/CSAT
   Examples: "why customers are cancelling", "how was the event", "employee satisfaction", "service quality"

3. EXPLORATORY_GENERAL - Open-ended learning, understanding behaviors, general curiosity, market research
   Examples: "how people think about money", "understand shopping habits", "explore attitudes toward AI"

Respond with ONLY a JSON object in this exact format:
{
  "mode": "PRODUCT_DISCOVERY" | "FEEDBACK_SATISFACTION" | "EXPLORATORY_GENERAL",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "Brief explanation of why this mode was chosen",
  "suggestedContextQuestions": ["question 1", "question 2", "question 3"]
}

The suggestedContextQuestions should be 2-4 specific questions that would help gather relevant context for this type of research.`;

  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a research methodology expert. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: detectionPrompt,
      },
    ];

    const response = await generateAIResponse(messages, {
      temperature: 0.3,
      maxTokens: 300,
    });

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate mode
    const validModes: SurveyMode[] = ['PRODUCT_DISCOVERY', 'FEEDBACK_SATISFACTION', 'EXPLORATORY_GENERAL'];
    if (!validModes.includes(result.mode)) {
      throw new Error('Invalid mode detected');
    }

    return {
      mode: result.mode,
      confidence: result.confidence || 'MEDIUM',
      reasoning: result.reasoning || 'Mode detected based on objective analysis',
      suggestedContextQuestions: Array.isArray(result.suggestedContextQuestions) 
        ? result.suggestedContextQuestions.slice(0, 4)
        : [],
    };
  } catch (error) {
    console.error('Error detecting survey mode:', error);
    
    // Fallback to simple keyword matching
    const objectiveLower = objective.toLowerCase();
    
    if (
      objectiveLower.includes('product') ||
      objectiveLower.includes('feature') ||
      objectiveLower.includes('pain point') ||
      objectiveLower.includes('validate') ||
      objectiveLower.includes('test') ||
      objectiveLower.includes('build') ||
      objectiveLower.includes('app') ||
      objectiveLower.includes('tool')
    ) {
      return {
        mode: 'PRODUCT_DISCOVERY',
        confidence: 'MEDIUM',
        reasoning: 'Detected product-related keywords',
        suggestedContextQuestions: [
          'What is the product or idea you\'re validating?',
          'Who is your target user?',
          'What problem does this solve?',
        ],
      };
    }
    
    if (
      objectiveLower.includes('satisfaction') ||
      objectiveLower.includes('feedback') ||
      objectiveLower.includes('churn') ||
      objectiveLower.includes('cancel') ||
      objectiveLower.includes('experience') ||
      objectiveLower.includes('event') ||
      objectiveLower.includes('service') ||
      objectiveLower.includes('employee')
    ) {
      return {
        mode: 'FEEDBACK_SATISFACTION',
        confidence: 'MEDIUM',
        reasoning: 'Detected feedback/satisfaction keywords',
        suggestedContextQuestions: [
          'What specific experience are they evaluating?',
          'Are there known issues or concerns?',
          'What is the current satisfaction baseline?',
        ],
      };
    }
    
    // Default to exploratory
    return {
      mode: 'EXPLORATORY_GENERAL',
      confidence: 'LOW',
      reasoning: 'General research objective detected',
      suggestedContextQuestions: [
        'What are the main themes you want to explore?',
        'Who is your target audience?',
        'What insights are you hoping to gain?',
      ],
    };
  }
}

/**
 * Get mode-specific dashboard configuration
 */
export function getModeDashboardConfig(mode: SurveyMode) {
  switch (mode) {
    case 'PRODUCT_DISCOVERY':
      return {
        title: 'Product Discovery Insights',
        widgets: ['painPoints', 'opportunities', 'userSegments', 'quotes'],
        primaryMetric: 'Pain Points Identified',
        hideWidgets: [],
      };
    
    case 'FEEDBACK_SATISFACTION':
      return {
        title: 'Satisfaction & Feedback Analysis',
        widgets: ['sentiment', 'atRisk', 'praise', 'complaints', 'quotes'],
        primaryMetric: 'Satisfaction Score',
        hideWidgets: ['opportunities'],
      };
    
    case 'EXPLORATORY_GENERAL':
      return {
        title: 'Research Insights',
        widgets: ['themes', 'sentiment', 'quotes', 'segments'],
        primaryMetric: 'Key Themes',
        hideWidgets: ['painPoints', 'opportunities'],
      };
  }
}

/**
 * Get mode display information
 */
export function getModeDisplayInfo(mode: SurveyMode) {
  switch (mode) {
    case 'PRODUCT_DISCOVERY':
      return {
        label: 'Product Discovery',
        icon: '🔨',
        color: 'blue',
        description: 'Validating ideas and finding pain points',
      };
    
    case 'FEEDBACK_SATISFACTION':
      return {
        label: 'Feedback & Satisfaction',
        icon: '⭐',
        color: 'green',
        description: 'Measuring satisfaction and gathering feedback',
      };
    
    case 'EXPLORATORY_GENERAL':
      return {
        label: 'Exploratory Research',
        icon: '🔍',
        color: 'purple',
        description: 'Open-ended learning and discovery',
      };
  }
}
