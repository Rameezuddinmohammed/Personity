/**
 * Conversation Types
 * 
 * Proper TypeScript interfaces for conversation state and related data
 */

// Persona attributes detected during conversation
export interface PersonaInsights {
  painLevel?: 'low' | 'medium' | 'high';
  experience?: 'novice' | 'intermediate' | 'expert';
  sentiment?: 'positive' | 'neutral' | 'negative';
  readiness?: 'cold' | 'warm' | 'hot';
  clarity?: 'low' | 'medium' | 'high';
}

// Ending phase of the 3-step protocol
export type EndingPhase = 'none' | 'reflection_asked' | 'summary_shown' | 'confirmed';

// Session state stored in ConversationSession.currentState
export interface SessionState {
  exchangeCount: number;
  topicsCovered: string[];
  lowQualityCount: number;
  hasReEngaged: boolean;
  isFlagged: boolean;
  flagReason?: string;
  flaggedAt?: string;
  endingPhase: EndingPhase;
  persona?: PersonaInsights;
  keyInsights?: string[];
  topicDepth?: Record<string, number>;
}

// Conversation state used for dynamic prompt generation
export interface ConversationState {
  exchangeCount: number;
  coveredTopics: string[];
  topicDepth: Record<string, number>;
  persona: PersonaInsights;
  keyInsights: string[];
  lastUserResponse?: string;
  isFlagged?: boolean;
  endingPhase?: EndingPhase;
}

// Exchange in conversation history
export interface Exchange {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Token usage tracking
export interface TokenUsage {
  input: number;
  output: number;
  cost: number;
}

// Structured AI response
export interface StructuredAIResponse {
  message: string;
  shouldEnd: boolean;
  reason?: 'completed' | 'disqualified' | 'low_quality' | 'max_questions';
  summary?: string;
  persona?: PersonaInsights;
  messages?: Array<{
    message: string;
    shouldEnd: boolean;
  }>;
}

// Quality check result
export interface QualityCheckResult {
  isLowQuality: boolean;
  reason?: string;
  shouldReEngage: boolean;
}

// Quality score from validator
export interface QualityScore {
  score: number;
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

// Spam check result
export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
  shouldBan: boolean;
}

// Sensitive content detection result
export interface SensitiveContentResult {
  isSensitive: boolean;
  category?: 'mentalHealth' | 'trauma' | 'medical' | 'substance';
  topic?: string;
  gentleResponse?: string;
}

// Crisis detection result
export interface CrisisDetectionResult {
  isCrisis: boolean;
  message?: string;
}

// Topic check result
export interface TopicCheckResult {
  isOffTopic: boolean;
  reason?: string;
  redirectMessage?: string;
}

// Follow-up suggestion
export interface FollowUpSuggestion {
  shouldFollowUp: boolean;
  suggestedProbe: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// Contradiction detection result
export interface ContradictionResult {
  detected: boolean;
  statement1: string;
  statement2: string;
  clarifyingQuestion: string;
}

// Compression result
export interface CompressionResult {
  summary: string;
  keyInsights: string[];
  personaSnapshot: Partial<PersonaInsights>;
  topicsCovered: string[];
}

// Survey configuration for prompt generation
export interface SurveyConfig {
  objective: string;
  context?: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  documentContext?: string;
  topics: string[];
  settings: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
    stopCondition: 'questions' | 'topics_covered';
    maxQuestions?: number;
  };
  mode?: SurveyMode;
}

// Survey mode
export type SurveyMode = 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';

// Mode configuration
export interface ModeConfig {
  roleDescription: string;
  conversationGuidance: string;
  questionExamples: string;
  summaryFormat: string;
}

// API response wrapper
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

// Message API response data
export interface MessageResponseData {
  aiResponse: string;
  progress: number;
  shouldEnd: boolean;
  summary?: string;
  reason?: string;
  persona?: PersonaInsights;
  topicsCovered?: string[];
  isReEngagement?: boolean;
  isOffTopic?: boolean;
  isRedirect?: boolean;
  isSensitive?: boolean;
  isCrisis?: boolean;
  contentFiltered?: boolean;
}
