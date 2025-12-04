/**
 * Application Constants
 * 
 * Centralized configuration values to avoid magic numbers
 */

// Quality Detection Thresholds
export const QUALITY_THRESHOLDS = {
  /** Number of low-quality responses before flagging session */
  LOW_QUALITY_COUNT_LIMIT: 3,
  /** Minimum quality score to pass validation (1-10) */
  MIN_QUALITY_SCORE: 7,
  /** Minimum response length for quality check */
  MIN_RESPONSE_LENGTH: 20,
  /** Minimum word count for quality check */
  MIN_WORD_COUNT: 3,
  /** Maximum word count for short response check */
  SHORT_RESPONSE_WORD_COUNT: 5,
} as const;

// Fraud Prevention Thresholds
export const FRAUD_THRESHOLDS = {
  /** Maximum sessions per IP in 24 hours */
  IP_SESSION_LIMIT_24H: 20,
  /** Number of flagged sessions before auto-ban */
  FLAGGED_SESSION_BAN_THRESHOLD: 10,
  /** Minimum average response time (seconds) before flagging as bot */
  MIN_AVG_RESPONSE_TIME_SECONDS: 5,
  /** Number of identical responses before flagging */
  IDENTICAL_RESPONSE_LIMIT: 2,
  /** Default ban duration in days */
  DEFAULT_BAN_DURATION_DAYS: 7,
} as const;

// Conversation Thresholds
export const CONVERSATION_THRESHOLDS = {
  /** Number of exchanges before compression triggers */
  COMPRESSION_THRESHOLD: 20,
  /** Number of recent exchanges to keep after compression */
  COMPRESSION_KEEP_RECENT: 6,
  /** Token limit before summarization */
  TOKEN_LIMIT_FOR_SUMMARIZATION: 100000,
  /** Minimum exchanges before allowing end */
  MIN_EXCHANGES_BEFORE_END: 6,
} as const;

// AI Configuration
export const AI_CONFIG = {
  /** Default temperature for conversation */
  DEFAULT_TEMPERATURE: 0.7,
  /** Temperature for analysis/extraction */
  ANALYSIS_TEMPERATURE: 0.3,
  /** Max tokens for conversation response */
  MAX_TOKENS_CONVERSATION: 300,
  /** Max tokens for analysis */
  MAX_TOKENS_ANALYSIS: 800,
  /** Max retries for AI calls */
  MAX_RETRIES: 3,
} as const;

// Topic Depth Levels
export const TOPIC_DEPTH = {
  /** L1 - Awareness: User recognizes topic exists */
  AWARENESS: 1,
  /** L2 - Experience: User has actual experience */
  EXPERIENCE: 2,
  /** L3 - Impact: Topic matters to user */
  IMPACT: 3,
  /** Minimum depth to consider topic "covered" */
  MIN_COVERED_DEPTH: 2,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  /** Conversation messages per minute per IP */
  CONVERSATION_PER_MINUTE: 10,
  /** Auth attempts per 15 minutes per IP */
  AUTH_PER_15_MINUTES: 5,
  /** Survey creations per hour per user */
  SURVEY_PER_HOUR: 10,
} as const;

// Key Insights Configuration
export const KEY_INSIGHTS_CONFIG = {
  /** Minimum character length for insight */
  MIN_LENGTH: 50,
  /** Maximum character length for insight */
  MAX_LENGTH: 200,
  /** Minimum word count for insight */
  MIN_WORDS: 8,
  /** Maximum insights to keep */
  MAX_INSIGHTS: 3,
} as const;

// Crisis Helplines (International)
export const CRISIS_HELPLINES = {
  US: {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    text: 'Text HOME to 741741',
  },
  UK: {
    name: 'Samaritans',
    number: '116 123',
    text: null,
  },
  INDIA: {
    name: 'iCall',
    number: '9152987821',
    text: null,
  },
  INTERNATIONAL: {
    name: 'International Association for Suicide Prevention',
    url: 'https://www.iasp.info/resources/Crisis_Centres/',
  },
} as const;

// Export type for crisis helplines
export type CrisisHelplineRegion = keyof typeof CRISIS_HELPLINES;
