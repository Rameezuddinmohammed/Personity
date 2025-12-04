/**
 * Sensitive Content Detector
 * 
 * Detects sensitive topics (mental health, trauma, medical) and generates gentle responses
 */

const SENSITIVE_TOPICS = {
  mentalHealth: [
    'depressed', 'depression', 'suicidal', 'suicide', 'self-harm', 'self harm',
    'anxiety', 'panic attack', 'mental health', 'therapy', 'therapist',
    'medication', 'antidepressant', 'bipolar', 'schizophrenia',
  ],
  trauma: [
    'abuse', 'abused', 'assault', 'assaulted', 'trauma', 'traumatic',
    'ptsd', 'rape', 'raped', 'molest', 'violence', 'violent',
  ],
  medical: [
    'cancer', 'tumor', 'disease', 'illness', 'sick', 'hospital',
    'surgery', 'operation', 'diagnosis', 'diagnosed', 'terminal',
    'dying', 'death', 'died', 'passed away',
  ],
  substance: [
    'addiction', 'addicted', 'alcoholic', 'drug abuse', 'overdose',
    'rehab', 'rehabilitation', 'withdrawal', 'sober', 'sobriety',
  ],
};

export interface SensitiveContentResult {
  isSensitive: boolean;
  category?: 'mentalHealth' | 'trauma' | 'medical' | 'substance';
  topic?: string;
  gentleResponse?: string;
}

/**
 * Detect sensitive content in user message
 */
export function detectSensitiveContent(
  userMessage: string,
  surveyObjective: string
): SensitiveContentResult {
  const messageLower = userMessage.toLowerCase();
  
  // Check each category
  for (const [category, keywords] of Object.entries(SENSITIVE_TOPICS)) {
    const matchedKeyword = keywords.find(keyword => messageLower.includes(keyword));
    
    if (matchedKeyword) {
      return {
        isSensitive: true,
        category: category as any,
        topic: matchedKeyword,
        gentleResponse: generateGentleResponse(category, surveyObjective),
      };
    }
  }
  
  return { isSensitive: false };
}

/**
 * Generate gentle acknowledgment and redirect
 */
function generateGentleResponse(
  category: string,
  surveyObjective: string
): string {
  const acknowledgments = {
    mentalHealth: [
      'I understand this is a difficult topic. For our research purposes, could you tell me about',
      'Thank you for sharing that. To keep our focus on the research, let\'s talk about',
      'I appreciate your openness. For this conversation, I\'d like to understand more about',
    ],
    trauma: [
      'I hear you, and I appreciate you sharing. For our research, could we focus on',
      'Thank you for trusting me with that. Let\'s shift our focus to',
      'I understand. For the purpose of this research, I\'d like to learn about',
    ],
    medical: [
      'I appreciate you sharing that. For our research purposes, could you tell me about',
      'Thank you for mentioning that. To stay focused on the research topic, let\'s discuss',
      'I understand. For this conversation, I\'d like to focus on',
    ],
    substance: [
      'Thank you for sharing. For our research purposes, let\'s focus on',
      'I appreciate your openness. For this conversation, could we talk about',
      'I hear you. To keep our focus on the research, let\'s discuss',
    ],
  };
  
  const templates = acknowledgments[category as keyof typeof acknowledgments] || acknowledgments.mentalHealth;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Extract main topic from objective
  const mainTopic = extractMainTopic(surveyObjective);
  
  return `${template} ${mainTopic}?`;
}

/**
 * Extract main topic from objective
 */
function extractMainTopic(objective: string): string {
  // Remove common prefixes
  let topic = objective
    .replace(/^(understand|learn about|research|explore|investigate)/i, '')
    .trim();
  
  // Take first 50 chars
  if (topic.length > 50) {
    topic = topic.substring(0, 50) + '...';
  }
  
  return topic || 'the research topic';
}

/**
 * Check if message contains crisis indicators (requires immediate intervention)
 */
export function detectCrisisIndicators(userMessage: string): {
  isCrisis: boolean;
  message?: string;
} {
  const messageLower = userMessage.toLowerCase();
  
  const crisisKeywords = [
    'want to die',
    'going to kill myself',
    'end my life',
    'suicide plan',
    'not worth living',
    'better off dead',
  ];
  
  const hasCrisisKeyword = crisisKeywords.some(keyword => messageLower.includes(keyword));
  
  if (hasCrisisKeyword) {
    return {
      isCrisis: true,
      message: `I'm concerned about what you've shared. If you're in crisis, please reach out to a crisis helpline:

International Resources:
• United States: 988 (Suicide & Crisis Lifeline) or text HOME to 741741
• United Kingdom: 116 123 (Samaritans)
• India: 9152987821 (iCall)
• Australia: 13 11 14 (Lifeline)
• Canada: 1-833-456-4566 (Crisis Services Canada)
• International: https://findahelpline.com

This research conversation isn't equipped to provide the support you need. Please take care of yourself.`,
    };
  }
  
  return { isCrisis: false };
}
