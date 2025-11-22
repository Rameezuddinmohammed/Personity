import { posthog } from './provider';

// User Events
export const trackUserSignup = (userId: string, email: string, method: 'email' | 'google') => {
  posthog.identify(userId, { email });
  posthog.capture('user_signed_up', {
    method,
    email,
  });
};

export const trackUserLogin = (userId: string, method: 'email' | 'google') => {
  posthog.identify(userId);
  posthog.capture('user_logged_in', {
    method,
  });
};

// Survey Events
export const trackSurveyCreated = (surveyId: string, mode: string, topicCount: number) => {
  posthog.capture('survey_created', {
    survey_id: surveyId,
    mode,
    topic_count: topicCount,
  });
};

export const trackSurveyPublished = (surveyId: string, shortUrl: string) => {
  posthog.capture('survey_published', {
    survey_id: surveyId,
    short_url: shortUrl,
  });
};

// Conversation Events
export const trackConversationStarted = (sessionId: string, surveyId: string) => {
  posthog.capture('conversation_started', {
    session_id: sessionId,
    survey_id: surveyId,
  });
};

export const trackConversationMessage = (sessionId: string, messageCount: number) => {
  posthog.capture('conversation_message_sent', {
    session_id: sessionId,
    message_count: messageCount,
  });
};

export const trackConversationPaused = (sessionId: string, messageCount: number) => {
  posthog.capture('conversation_paused', {
    session_id: sessionId,
    message_count: messageCount,
  });
};

export const trackConversationResumed = (sessionId: string) => {
  posthog.capture('conversation_resumed', {
    session_id: sessionId,
  });
};

export const trackConversationCompleted = (sessionId: string, messageCount: number, duration: number) => {
  posthog.capture('conversation_completed', {
    session_id: sessionId,
    message_count: messageCount,
    duration_seconds: duration,
  });
};

// Subscription Events (for Phase 2)
export const trackSubscriptionStarted = (userId: string, plan: string, amount: number) => {
  posthog.capture('subscription_started', {
    plan,
    amount,
  });
};

export const trackSubscriptionCancelled = (userId: string, plan: string) => {
  posthog.capture('subscription_cancelled', {
    plan,
  });
};

// Export Events
export const trackPdfExported = (surveyId: string, responseCount: number) => {
  posthog.capture('pdf_exported', {
    survey_id: surveyId,
    response_count: responseCount,
  });
};

export const trackCsvExported = (surveyId: string, responseCount: number) => {
  posthog.capture('csv_exported', {
    survey_id: surveyId,
    response_count: responseCount,
  });
};
