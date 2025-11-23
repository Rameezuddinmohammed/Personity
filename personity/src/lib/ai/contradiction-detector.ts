/**
 * Contradiction Detector
 * 
 * Detects when user contradicts previous statements
 * Automatically generates clarifying questions
 */

export interface Contradiction {
  detected: boolean;
  statement1: string;
  statement2: string;
  clarifyingQuestion: string;
}

/**
 * Detect contradictions in user responses
 */
export function detectContradiction(
  currentResponse: string,
  previousResponses: string[]
): Contradiction {
  const currentLower = currentResponse.toLowerCase();
  
  // Common contradiction patterns
  const contradictionPatterns = [
    // Positive vs Negative
    { positive: ['yes', 'definitely', 'absolutely', 'always', 'love', 'great'], negative: ['no', 'never', 'hate', 'terrible', 'awful'] },
    // Frequency contradictions
    { high: ['always', 'constantly', 'every day', 'all the time'], low: ['rarely', 'never', 'sometimes', 'occasionally'] },
    // Experience contradictions
    { experienced: ['expert', 'professional', 'years of experience', 'very familiar'], novice: ['new to', 'just started', 'beginner', 'not familiar'] },
    // Usage contradictions
    { uses: ['i use', 'i have', 'i do'], doesntUse: ["i don't use", "i don't have", "i don't do", 'never used'] },
  ];

  for (let i = 0; i < previousResponses.length; i++) {
    const prevResponse = previousResponses[i];
    const prevLower = prevResponse.toLowerCase();

    // Check each contradiction pattern
    for (const pattern of contradictionPatterns) {
      const keys = Object.keys(pattern);
      if (keys.length !== 2) continue;

      const [key1, key2] = keys;
      const group1 = pattern[key1 as keyof typeof pattern] as string[];
      const group2 = pattern[key2 as keyof typeof pattern] as string[];

      // Check if previous response has group1 and current has group2 (or vice versa)
      const prevHasGroup1 = group1.some(phrase => prevLower.includes(phrase));
      const prevHasGroup2 = group2.some(phrase => prevLower.includes(phrase));
      const currentHasGroup1 = group1.some(phrase => currentLower.includes(phrase));
      const currentHasGroup2 = group2.some(phrase => currentLower.includes(phrase));

      if ((prevHasGroup1 && currentHasGroup2) || (prevHasGroup2 && currentHasGroup1)) {
        // Contradiction detected!
        return {
          detected: true,
          statement1: prevResponse,
          statement2: currentResponse,
          clarifyingQuestion: generateClarifyingQuestion(prevResponse, currentResponse),
        };
      }
    }

    // Check for direct negation patterns
    if (detectDirectNegation(prevLower, currentLower)) {
      return {
        detected: true,
        statement1: prevResponse,
        statement2: currentResponse,
        clarifyingQuestion: generateClarifyingQuestion(prevResponse, currentResponse),
      };
    }
  }

  return {
    detected: false,
    statement1: '',
    statement2: '',
    clarifyingQuestion: '',
  };
}

/**
 * Detect direct negation (e.g., "I do X" vs "I don't do X")
 */
function detectDirectNegation(prev: string, current: string): boolean {
  // Extract main verbs/actions
  const prevWords = prev.split(' ').filter(w => w.length > 3);
  const currentWords = current.split(' ').filter(w => w.length > 3);

  // Check if current response negates previous
  const hasNegation = current.includes("don't") || current.includes("doesn't") || 
                      current.includes("not") || current.includes("never");
  const hasAffirmation = prev.includes("do") || prev.includes("does") || 
                         prev.includes("always") || prev.includes("yes");

  // Check for overlapping content words
  const overlap = prevWords.filter(w => currentWords.includes(w));

  return hasNegation && hasAffirmation && overlap.length >= 2;
}

/**
 * Generate clarifying question for contradiction
 */
function generateClarifyingQuestion(statement1: string, statement2: string): string {
  // Extract key phrases from both statements
  const extract = (text: string) => {
    const words = text.split(' ').filter(w => w.length > 4);
    return words.slice(0, 5).join(' ');
  };

  const phrase1 = extract(statement1);
  const phrase2 = extract(statement2);

  // Generate clarifying question
  const templates = [
    `Earlier you mentioned "${phrase1}", but now you're saying "${phrase2}". Can you clarify?`,
    `I want to make sure I understand - you said "${phrase1}" before, but "${phrase2}" now. Which is more accurate?`,
    `Help me understand: "${phrase1}" vs "${phrase2}" - how do these fit together?`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Check if clarifying question should be asked
 * (Don't ask if contradiction is minor or user is clearly correcting themselves)
 */
export function shouldAskClarification(contradiction: Contradiction, currentResponse: string): boolean {
  if (!contradiction.detected) return false;

  const currentLower = currentResponse.toLowerCase();

  // Don't ask if user is explicitly correcting themselves
  const isSelfCorrection = 
    currentLower.includes('actually') ||
    currentLower.includes('i meant') ||
    currentLower.includes('correction') ||
    currentLower.includes('sorry') ||
    currentLower.includes('i mean');

  if (isSelfCorrection) return false;

  // Don't ask if responses are very short (likely low quality anyway)
  if (currentResponse.length < 30 || contradiction.statement1.length < 30) {
    return false;
  }

  return true;
}
