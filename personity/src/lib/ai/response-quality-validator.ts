/**
 * Response Quality Validator
 * 
 * Validates AI responses to ensure ListenLabs-level quality:
 * - References previous user response
 * - Advances topic depth
 * - Avoids repetition
 * - Follows mode guidance
 * - Stays brief (1-2 sentences)
 */

import { QUALITY_THRESHOLDS } from '@/lib/constants';

export interface QualityScore {
  score: number; // 1-10
  passed: boolean; // true if score >= MIN_QUALITY_SCORE
  issues: string[];
  suggestions: string[];
}

const BANNED_PHRASES = [
  'could you tell me a bit more',
  "i'd love to hear more",
  'any extra details would be helpful',
  'could you walk me through',
  "that's really interesting",
  'thanks for sharing that',
  'thanks for sharing',
  'that\'s interesting',
];

const FILLER_PHRASES = [
  'great!',
  'awesome!',
  'perfect!',
  'excellent!',
  'wonderful!',
  'fantastic!',
];

/**
 * Validate AI response quality
 */
export function validateResponseQuality(
  aiResponse: string,
  lastUserResponse: string,
  previousAIQuestions: string[],
  mode: string
): QualityScore {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 10; // Start perfect, deduct points

  const responseLower = aiResponse.toLowerCase();
  const lastUserLower = lastUserResponse.toLowerCase();

  // 1. Check for banned phrases (-3 points each)
  BANNED_PHRASES.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      score -= 3;
      issues.push(`Contains banned phrase: "${phrase}"`);
      suggestions.push('Use direct questions instead of polite filler');
    }
  });

  // 2. Check for filler phrases (-2 points each)
  FILLER_PHRASES.forEach(phrase => {
    if (responseLower.includes(phrase)) {
      score -= 2;
      issues.push(`Contains filler phrase: "${phrase}"`);
      suggestions.push('Remove enthusiasm markers, stay neutral');
    }
  });

  // 3. Check brevity (should be 1-2 sentences) (-2 points if too long)
  const sentenceCount = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  if (sentenceCount > 2) {
    score -= 2;
    issues.push(`Too long: ${sentenceCount} sentences (max 2)`);
    suggestions.push('Keep responses to 1-2 sentences maximum');
  }

  // 4. Check for memory reference (-3 points if missing)
  const hasReference = 
    responseLower.includes('you mentioned') ||
    responseLower.includes('you said') ||
    responseLower.includes('earlier you') ||
    responseLower.includes('you described') ||
    responseLower.includes('you told me') ||
    // Check if response contains words from user's last response (shows listening)
    lastUserResponse.split(' ')
      .filter(word => word.length > 5)
      .some(word => responseLower.includes(word.toLowerCase()));

  if (!hasReference && lastUserResponse.length > 20) {
    score -= 3;
    issues.push('No reference to previous user response');
    suggestions.push('Reference specific words/phrases from their last answer');
  }

  // 5. Check for repetition (-4 points if repeated)
  const isRepeat = previousAIQuestions.some(prevQ => {
    const similarity = calculateSimilarity(aiResponse, prevQ);
    return similarity > 0.7; // 70% similar = repeat
  });

  if (isRepeat) {
    score -= 4;
    issues.push('Question is too similar to previous questions');
    suggestions.push('Ask about a different aspect or move to next topic');
  }

  // 6. Check for question mark (should ask a question) (-1 point if missing)
  if (!aiResponse.includes('?') && !aiResponse.toLowerCase().includes('tell me')) {
    score -= 1;
    issues.push('Not clearly a question');
    suggestions.push('End with a clear question');
  }

  // 7. Mode-specific checks
  if (mode === 'PRODUCT_DISCOVERY') {
    const hasProbe = 
      responseLower.includes('why') ||
      responseLower.includes('how often') ||
      responseLower.includes('what impact') ||
      responseLower.includes('what problem');
    
    if (!hasProbe && lastUserResponse.length > 30) {
      score -= 2;
      issues.push('Missing product discovery probe (why/how often/impact)');
      suggestions.push('Probe for pain points, frequency, or impact');
    }
  }

  // Ensure score stays in 1-10 range
  score = Math.max(1, Math.min(10, score));

  return {
    score,
    passed: score >= QUALITY_THRESHOLDS.MIN_QUALITY_SCORE,
    issues,
    suggestions,
  };
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(w => words2.includes(w) && w.length > 3);
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

/**
 * Suggest improvement for low-quality response
 */
export function suggestImprovement(
  aiResponse: string,
  lastUserResponse: string,
  qualityScore: QualityScore
): string {
  if (qualityScore.passed) {
    return aiResponse; // No improvement needed
  }

  // Extract a specific phrase from user's response to reference
  const userWords = lastUserResponse.split(' ').filter(w => w.length > 5);
  const keyPhrase = userWords.slice(0, 3).join(' ');

  // Generate improved version
  let improved = aiResponse;

  // Add reference if missing
  if (qualityScore.issues.some(i => i.includes('No reference'))) {
    improved = `You mentioned "${keyPhrase}". ${improved}`;
  }

  // Shorten if too long
  const sentences = improved.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 2) {
    improved = sentences.slice(0, 2).join('. ') + '?';
  }

  // Remove filler phrases
  FILLER_PHRASES.forEach(phrase => {
    improved = improved.replace(new RegExp(phrase, 'gi'), '');
  });

  // Remove banned phrases
  BANNED_PHRASES.forEach(phrase => {
    improved = improved.replace(new RegExp(phrase, 'gi'), '');
  });

  return improved.trim();
}
