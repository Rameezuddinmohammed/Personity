/**
 * Follow-Up Logic (Human-Like Researcher)
 * 
 * Detects patterns in user responses and suggests intelligent follow-ups
 * Makes AI feel like a real 1:1 interview
 */

export interface FollowUpSuggestion {
  shouldFollowUp: boolean;
  suggestedProbe: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const EMOTION_WORDS = [
  'frustrated', 'annoyed', 'angry', 'upset', 'disappointed',
  'excited', 'happy', 'thrilled', 'love', 'hate',
  'worried', 'concerned', 'anxious', 'stressed',
  'satisfied', 'pleased', 'delighted',
];

const WORKAROUND_PHRASES = [
  'i use', 'i do', 'i try', 'i work around',
  'my process', 'my approach', 'my method',
  'i handle', 'i manage', 'i deal with',
];

const UNCLEAR_INDICATORS = [
  'kind of', 'sort of', 'maybe', 'i guess',
  'not sure', 'i think', 'probably',
  'it depends', 'sometimes', 'occasionally',
];

const PAIN_INDICATORS = [
  'problem', 'issue', 'challenge', 'difficult',
  'hard', 'struggle', 'pain', 'frustrating',
  'annoying', 'waste', 'slow', 'broken',
];

/**
 * Analyze user response and suggest intelligent follow-up
 */
export function suggestFollowUp(
  userResponse: string,
  conversationContext: {
    currentTopic?: string;
    topicDepth: number; // 1, 2, or 3
    previousFollowUps: number; // How many follow-ups on this topic
  }
): FollowUpSuggestion {
  const responseLower = userResponse.toLowerCase();

  // Don't follow up if already asked 3+ follow-ups on this topic
  if (conversationContext.previousFollowUps >= 3) {
    return {
      shouldFollowUp: false,
      suggestedProbe: '',
      reason: 'Max follow-ups reached for this topic',
      priority: 'low',
    };
  }

  // Priority 1: Emotion detected (HIGH priority)
  const emotionDetected = EMOTION_WORDS.find(word => responseLower.includes(word));
  if (emotionDetected) {
    return {
      shouldFollowUp: true,
      suggestedProbe: `You mentioned feeling ${emotionDetected}. What makes you feel that way?`,
      reason: `Emotion detected: "${emotionDetected}"`,
      priority: 'high',
    };
  }

  // Priority 2: Pain point mentioned (HIGH priority)
  const painDetected = PAIN_INDICATORS.find(word => responseLower.includes(word));
  if (painDetected && conversationContext.topicDepth < 3) {
    return {
      shouldFollowUp: true,
      suggestedProbe: `You mentioned a ${painDetected}. How often does that happen?`,
      reason: `Pain point detected: "${painDetected}"`,
      priority: 'high',
    };
  }

  // Priority 3: Workaround mentioned (MEDIUM priority)
  const workaroundDetected = WORKAROUND_PHRASES.find(phrase => responseLower.includes(phrase));
  if (workaroundDetected && conversationContext.topicDepth < 3) {
    // Extract what they do (simple heuristic)
    const sentences = userResponse.split(/[.!?]+/);
    const workaroundSentence = sentences.find(s => 
      WORKAROUND_PHRASES.some(p => s.toLowerCase().includes(p))
    );
    
    return {
      shouldFollowUp: true,
      suggestedProbe: `How well does that work for you?`,
      reason: `Workaround detected: "${workaroundSentence?.substring(0, 50)}..."`,
      priority: 'medium',
    };
  }

  // Priority 4: Unclear/vague response (MEDIUM priority)
  const unclearDetected = UNCLEAR_INDICATORS.find(phrase => responseLower.includes(phrase));
  if (unclearDetected && userResponse.length > 30) {
    return {
      shouldFollowUp: true,
      suggestedProbe: `What do you mean by that?`,
      reason: `Unclear indicator: "${unclearDetected}"`,
      priority: 'medium',
    };
  }

  // Priority 5: Rich response with specific details (LOW priority)
  if (userResponse.length > 100 && conversationContext.topicDepth < 3) {
    // Extract a specific phrase to probe deeper
    const words = userResponse.split(' ').filter(w => w.length > 5);
    const keyPhrase = words.slice(0, 3).join(' ');
    
    return {
      shouldFollowUp: true,
      suggestedProbe: `Tell me more about "${keyPhrase}".`,
      reason: 'Rich response with details',
      priority: 'low',
    };
  }

  // No follow-up needed - move to next topic
  return {
    shouldFollowUp: false,
    suggestedProbe: '',
    reason: 'No strong follow-up signal detected',
    priority: 'low',
  };
}

/**
 * Generate follow-up instruction for AI prompt
 */
export function generateFollowUpInstruction(
  followUp: FollowUpSuggestion,
  currentTopic?: string
): string {
  if (!followUp.shouldFollowUp) {
    return `No strong follow-up signal. Move to next topic or advance depth.`;
  }

  return `
FOLLOW-UP DETECTED (${followUp.priority.toUpperCase()} PRIORITY):
Reason: ${followUp.reason}

Suggested probe: "${followUp.suggestedProbe}"

Use this as guidance, but adapt to fit the conversation naturally.
Keep it brief (1 sentence) and reference their specific words.
`;
}

/**
 * Track follow-up count per topic
 */
export function updateFollowUpCount(
  state: { followUpCounts?: Record<string, number> },
  currentTopic?: string
): { followUpCounts: Record<string, number> } {
  const followUpCounts = state.followUpCounts || {};
  
  if (currentTopic) {
    followUpCounts[currentTopic] = (followUpCounts[currentTopic] || 0) + 1;
  }
  
  return { followUpCounts };
}
