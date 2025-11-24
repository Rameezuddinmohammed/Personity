/**
 * Topic Detector
 * 
 * Detects when user responses are off-topic and generates redirect messages
 */

const OFF_TOPIC_INDICATORS = [
  // Questions to the AI
  'what do you think',
  'what\'s your opinion',
  'do you like',
  'what about you',
  'can you help',
  'can you tell me',
  
  // Completely unrelated topics
  'favorite color',
  'favorite food',
  'weather',
  'sports',
  'politics',
  'religion',
  'celebrity',
  'movie',
  'tv show',
  'video game',
  
  // Meta questions
  'how long will this take',
  'how many questions',
  'when will this end',
  'who are you',
  'who made you',
];

export interface TopicCheckResult {
  isOffTopic: boolean;
  reason?: string;
  redirectMessage?: string;
}

/**
 * Check if user message is off-topic
 */
export function isOffTopic(
  userMessage: string,
  surveyObjective: string,
  topics: string[],
  lastAIQuestion?: string
): TopicCheckResult {
  const messageLower = userMessage.toLowerCase();
  
  // Skip check for very short responses (might be low quality, handled separately)
  if (userMessage.length < 10) {
    return { isOffTopic: false };
  }
  
  // Check for explicit off-topic indicators
  const offTopicMatch = OFF_TOPIC_INDICATORS.find(indicator => 
    messageLower.includes(indicator)
  );
  
  if (offTopicMatch) {
    return {
      isOffTopic: true,
      reason: `Contains off-topic phrase: "${offTopicMatch}"`,
      redirectMessage: generateRedirectMessage(surveyObjective, lastAIQuestion),
    };
  }
  
  // Check if message relates to objective or topics
  const objectiveWords = surveyObjective.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const topicWords = topics.flatMap(t => t.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  const allRelevantWords = [...new Set([...objectiveWords, ...topicWords])];
  
  // Count how many relevant words appear in the message
  const messageWords = messageLower.split(/\s+/);
  const relevantWordCount = messageWords.filter(word => 
    allRelevantWords.some(relevant => word.includes(relevant) || relevant.includes(word))
  ).length;
  
  // If message has 0 relevant words and is longer than 30 chars, likely off-topic
  if (relevantWordCount === 0 && userMessage.length > 30) {
    return {
      isOffTopic: true,
      reason: 'No relevant keywords found in response',
      redirectMessage: generateRedirectMessage(surveyObjective, lastAIQuestion),
    };
  }
  
  return { isOffTopic: false };
}

/**
 * Generate redirect message to bring user back on topic
 */
function generateRedirectMessage(
  surveyObjective: string,
  lastAIQuestion?: string
): string {
  const mainTopic = extractMainTopic(surveyObjective);
  const fallbackQuestion = lastAIQuestion || 'Could you share your thoughts on that?';
  
  const templates = [
    `I'm here to learn about ${mainTopic}. ${fallbackQuestion}`,
    `Let's focus on ${mainTopic}. ${lastAIQuestion || 'What\'s your experience with that?'}`,
    `Going back to ${mainTopic} - ${lastAIQuestion || 'how do you currently handle that?'}`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
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
 * Check if user is asking the AI a question
 */
export function isAskingAIQuestion(userMessage: string): boolean {
  const messageLower = userMessage.toLowerCase();
  
  const questionIndicators = [
    'what do you',
    'what\'s your',
    'do you think',
    'can you',
    'could you',
    'would you',
    'should i',
    'what about you',
  ];
  
  return questionIndicators.some(indicator => messageLower.includes(indicator));
}

/**
 * Generate response when user asks AI a question
 */
export function generateAIQuestionResponse(lastAIQuestion?: string): string {
  const fallback1 = lastAIQuestion || 'Tell me about your experience.';
  const fallback2 = lastAIQuestion || 'What\'s your take on this?';
  const fallback3 = lastAIQuestion || 'Share your thoughts with me.';
  
  const templates = [
    `I'm here to learn from you, not the other way around. ${fallback1}`,
    `I'd rather hear your perspective. ${fallback2}`,
    `Let's keep the focus on you. ${fallback3}`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}
