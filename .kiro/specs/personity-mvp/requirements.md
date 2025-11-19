# Personity MVP - Requirements Document

## Introduction

Personity is an AI-powered conversational research platform that conducts adaptive interviews at scale. The system enables product teams and founders to gather interview-depth insights through dynamic AI conversations, achieving higher completion rates than traditional surveys while maintaining survey-level cost efficiency.

The MVP validates the core hypothesis: AI conversations can achieve 70%+ completion rates and provide actionable insights that customers will pay $79-199/month for.

## Glossary

- **System**: The Personity platform (web application, API, and AI conversation engine)
- **Creator**: A user who creates and manages surveys on the platform
- **Respondent**: An end-user who participates in a survey conversation
- **Survey**: A configured AI conversation template with objectives, topics, and settings
- **Session**: A single respondent's conversation instance with pause/resume capability
- **Conversation**: The complete message exchange history between AI and respondent
- **Master Prompt**: The system-level instruction template that guides AI conversation behavior
- **Analysis**: Automated insight extraction from completed conversations
- **Exchange**: A single AI question and respondent answer pair
- **Quality Score**: A 1-10 rating of conversation depth and respondent engagement

## Requirements

### Requirement 1: User Authentication and Account Management

**User Story:** As a creator, I want to create an account and log in securely, so that I can access my surveys and data.

#### Acceptance Criteria

1. WHEN a creator submits valid registration details (email, password, name), THE System SHALL create a new user account with bcrypt-hashed password
2. WHEN a creator clicks the Google OAuth button, THE System SHALL authenticate via Google and create or link an account
3. WHEN a creator submits valid login credentials, THE System SHALL issue a JWT token with 24-hour expiry
4. WHEN a creator requests password reset, THE System SHALL send a secure reset link via email within 2 minutes
5. THE System SHALL enforce HTTPS for all authentication endpoints

### Requirement 2: Survey Creation Workflow

**User Story:** As a creator, I want to create a survey in under 5 minutes, so that I can quickly start gathering insights.

#### Acceptance Criteria

1. WHEN a creator initiates survey creation, THE System SHALL present a 5-step guided workflow
2. WHEN a creator enters an objective in Step 1, THE System SHALL use AI to detect if additional context is needed
3. IF context is needed, THEN THE System SHALL present Step 2 with fields for product description, user information, and known issues
4. WHEN a creator enters key topics in Step 3, THE System SHALL accept a bullet list of 2-10 topics
5. WHEN a creator configures settings in Step 4, THE System SHALL accept length (Quick/Standard/Deep), tone (Professional/Friendly/Casual), and stop condition parameters
6. WHEN a creator completes all required steps, THE System SHALL generate a unique short URL (6-character alphanumeric) for the survey
7. THE System SHALL generate a master prompt template from the survey configuration within 3 seconds

### Requirement 3: Test Mode Simulation

**User Story:** As a creator, I want to test my survey before publishing, so that I can verify the conversation quality.

#### Acceptance Criteria

1. WHERE test mode is enabled, THE System SHALL allow creators to simulate respondent conversations
2. WHEN a creator sends messages in test mode, THE System SHALL respond using the configured AI provider without incrementing usage counters
3. WHEN a creator completes a test conversation, THE System SHALL display the conversation transcript without saving to production database
4. THE System SHALL clearly indicate test mode status with visual markers throughout the interface

### Requirement 4: Respondent Conversation Experience

**User Story:** As a respondent, I want to have a natural conversation that adapts to my responses, so that I feel heard and engaged.

#### Acceptance Criteria

1. WHEN a respondent clicks a survey link, THE System SHALL create a new conversation session with unique session token
2. WHEN a respondent submits a message, THE System SHALL generate an AI response within 5 seconds (p95)
3. WHILE a conversation is active, THE System SHALL display a progress indicator showing topics covered
4. WHEN a respondent's message is received, THE System SHALL validate message length (minimum 1 character, maximum 2000 characters)
5. IF a respondent provides low-quality responses (1-2 words) for 3 consecutive exchanges, THEN THE System SHALL attempt re-engagement once
6. WHEN the AI determines conversation objectives are met, THE System SHALL present a summary for respondent confirmation
7. THE System SHALL support mobile devices with responsive design (viewport width 320px to 2560px)

### Requirement 5: Pause and Resume Capability

**User Story:** As a respondent, I want to pause my conversation and return later, so that I can complete it at my convenience.

#### Acceptance Criteria

1. WHILE a conversation is active, THE System SHALL provide a pause button accessible at all times
2. WHEN a respondent clicks pause, THE System SHALL save the current conversation state and generate a resume link
3. WHEN a respondent clicks a resume link, THE System SHALL restore the conversation session with full message history
4. IF a paused session is inactive for 7 days, THEN THE System SHALL mark it as abandoned
5. THE System SHALL allow only one active session per session token

### Requirement 6: AI Conversation Engine

**User Story:** As the system, I want to conduct intelligent conversations that probe deeper based on responses, so that I gather meaningful insights.

#### Acceptance Criteria

1. WHEN generating a response, THE System SHALL use the master prompt template with survey-specific variables
2. WHEN calling OpenAI GPT-4o, THE System SHALL set temperature to 0.7 and max tokens to 200 for response generation
3. IF OpenAI returns an error, THEN THE System SHALL return a user-friendly error message and log the issue
4. WHEN conversation history exceeds 100,000 tokens, THE System SHALL summarize early exchanges while preserving recent context
5. THE System SHALL track topics covered and avoid repeating questions on the same topic
6. WHEN generating responses, THE System SHALL limit AI responses to 2-3 sentences

### Requirement 7: Quality Detection and Fraud Prevention

**User Story:** As a creator, I want to receive only high-quality responses, so that my insights are actionable.

#### Acceptance Criteria

1. WHEN a conversation reaches 3 exchanges, THE System SHALL analyze response quality using defined criteria
2. IF a respondent provides identical responses 3 times, THEN THE System SHALL flag the session as spam
3. IF an IP address generates more than 10 low-quality sessions within 24 hours, THEN THE System SHALL ban the IP address
4. IF a session completes with average exchange time under 5 seconds, THEN THE System SHALL flag as suspicious speed
5. WHEN a session is flagged, THE System SHALL exclude it from aggregate analysis and notify the creator

### Requirement 8: Rate Limiting

**User Story:** As the system, I want to prevent abuse through rate limiting, so that I maintain service quality and control costs.

#### Acceptance Criteria

1. THE System SHALL limit conversation API endpoints to 30 requests per minute per IP address
2. IF a rate limit is exceeded, THEN THE System SHALL return a 429 status code with error message
3. THE System SHALL reset rate limit counters after 60 seconds

### Requirement 9: Per-Response Analysis

**User Story:** As a creator, I want automatic analysis of each conversation, so that I can quickly understand individual respondent insights.

#### Acceptance Criteria

1. WHEN a conversation is marked complete, THE System SHALL trigger automated analysis within 30 seconds
2. WHEN analyzing a conversation, THE System SHALL generate a 2-3 sentence summary
3. WHEN analyzing a conversation, THE System SHALL extract 2-5 key themes
4. WHEN analyzing a conversation, THE System SHALL determine sentiment (positive, neutral, or negative)
5. WHEN analyzing a conversation, THE System SHALL extract 1-3 top quotes with context
6. WHEN analyzing a conversation, THE System SHALL assign a quality score from 1 to 10
7. THE System SHALL store all analysis results in the response_analysis table

### Requirement 10: Aggregate Analysis

**User Story:** As a creator, I want to see patterns across multiple responses, so that I can identify common themes and insights.

#### Acceptance Criteria

1. WHEN a survey reaches 5 completed responses, THE System SHALL generate initial aggregate analysis
2. WHEN a survey receives additional responses in multiples of 5, THE System SHALL regenerate aggregate analysis
3. WHEN generating aggregate analysis, THE System SHALL create an executive summary (3-5 sentences)
4. WHEN generating aggregate analysis, THE System SHALL identify top themes with frequency percentages
5. IF a survey has 15 or more responses, THEN THE System SHALL identify user segments based on response patterns
6. THE System SHALL store aggregate analysis results in the aggregate_analysis table

### Requirement 11: Insights Dashboard

**User Story:** As a creator, I want to view all insights in one place, so that I can make informed decisions quickly.

#### Acceptance Criteria

1. WHEN a creator views survey insights, THE System SHALL display the executive summary prominently
2. WHEN a creator views survey insights, THE System SHALL display top themes with visual indicators
3. WHERE user segments exist, THE System SHALL display segment breakdowns with characteristics
4. WHEN a creator views individual responses, THE System SHALL paginate results with 20 responses per page
5. WHEN a creator searches responses, THE System SHALL filter results by text match in real-time
6. WHEN a creator clicks a response, THE System SHALL display the full transcript and analysis

### Requirement 12: Export Functionality

**User Story:** As a creator, I want to export insights as PDF or CSV, so that I can share findings with my team.

#### Acceptance Criteria

1. WHERE a creator has a paid plan, THE System SHALL enable PDF export functionality
2. WHEN a creator requests PDF export, THE System SHALL generate a formatted document within 15 seconds
3. WHEN generating PDF export, THE System SHALL include executive summary, themes, and individual response summaries
4. WHERE a creator has a paid plan, THE System SHALL enable CSV export functionality
5. WHEN a creator requests CSV export, THE System SHALL generate a file with all response data within 10 seconds
6. WHERE a creator has a free plan, THE System SHALL display a watermark on all exported content

### Requirement 13: Subscription Plans and Billing

**User Story:** As a creator, I want to choose a plan that fits my needs, so that I can access appropriate features and response limits.

#### Acceptance Criteria

1. WHEN a new user signs up, THE System SHALL assign the free plan with 50 total responses and 30-day time limit
2. WHEN a free plan user reaches 50 responses, THE System SHALL prevent new response collection and prompt upgrade
3. WHEN a free plan user exceeds 30 days since signup, THE System SHALL prevent new response collection and prompt upgrade
4. WHEN a creator selects a paid plan, THE System SHALL redirect to Instamojo payment page with INR pricing (₹999, ₹6499, ₹16499, or ₹41499)
5. WHEN a payment succeeds via Instamojo webhook, THE System SHALL activate the subscription and update user plan within 60 seconds
6. WHEN a paid plan user reaches monthly response limit, THE System SHALL offer addon purchase at plan-specific pricing
7. THE System SHALL reset monthly response counters on the subscription renewal date

### Requirement 14: Usage Tracking and Limits

**User Story:** As a creator, I want to see my current usage, so that I can manage my plan effectively.

#### Acceptance Criteria

1. WHEN a conversation completes, THE System SHALL increment the creator's responses_used_this_month counter
2. WHEN a creator views their dashboard, THE System SHALL display current usage and plan limits
3. WHEN a creator approaches 80% of plan limit, THE System SHALL send an email notification
4. WHEN a creator reaches 100% of plan limit, THE System SHALL send an email notification with upgrade options
5. THE System SHALL enforce plan limits before allowing new conversation sessions to start

### Requirement 15: Cost Monitoring and Alerts

**User Story:** As the system administrator, I want to monitor AI API costs, so that I can prevent unexpected expenses.

#### Acceptance Criteria

1. WHEN an AI API call completes, THE System SHALL calculate and log the cost based on token usage
2. WHEN daily spending exceeds $500, THE System SHALL send an alert to the configured Slack webhook
3. THE System SHALL track costs per session, per survey, and per user
4. WHEN a user's sessions generate unusually high costs, THE System SHALL flag the account for review

### Requirement 16: Email Notifications

**User Story:** As a creator, I want to receive notifications about new responses, so that I can stay informed.

#### Acceptance Criteria

1. WHEN a conversation completes, THE System SHALL send an email notification to the survey creator within 5 minutes
2. WHEN a creator signs up, THE System SHALL send a welcome email with onboarding resources
3. WHEN a payment fails, THE System SHALL send dunning emails at 3, 7, and 14 days
4. THE System SHALL include unsubscribe links in all notification emails

### Requirement 17: Dashboard and Survey Management

**User Story:** As a creator, I want to manage all my surveys from one dashboard, so that I can stay organized.

#### Acceptance Criteria

1. WHEN a creator logs in, THE System SHALL display a dashboard with all surveys sorted by creation date
2. WHEN a creator has no surveys, THE System SHALL display an empty state with example survey option
3. WHEN a creator views a survey, THE System SHALL display status (active, paused, completed), response count, and completion rate
4. WHEN a creator pauses a survey, THE System SHALL prevent new respondents from starting conversations
5. WHEN a creator deletes a survey, THE System SHALL soft-delete the record and retain all associated data for 30 days

### Requirement 18: Error Handling and Monitoring

**User Story:** As the system administrator, I want to track all errors, so that I can maintain system reliability.

#### Acceptance Criteria

1. WHEN an unhandled error occurs, THE System SHALL log the error to Sentry with full context
2. WHEN an AI provider returns a 429 rate limit error, THE System SHALL wait and retry according to retry-after header
3. WHEN a database query fails, THE System SHALL return a user-friendly error message without exposing technical details
4. THE System SHALL maintain 99% uptime for all API endpoints
5. WHEN critical errors occur, THE System SHALL send alerts to the configured monitoring channel

### Requirement 19: Security and Data Protection

**User Story:** As a user, I want my data to be secure, so that I can trust the platform with sensitive research.

#### Acceptance Criteria

1. THE System SHALL hash all passwords using bcrypt with 10 rounds
2. THE System SHALL enforce HTTPS for all connections
3. THE System SHALL validate and sanitize all user inputs to prevent injection attacks
4. THE System SHALL implement CORS restrictions to allow only authorized domains
5. THE System SHALL expire JWT tokens after 24 hours
6. THE System SHALL store sensitive environment variables securely and never expose them in client code

### Requirement 20: Viral Growth Mechanism

**User Story:** As a respondent, I want to know what platform powered this conversation, so that I can create my own surveys.

#### Acceptance Criteria

1. WHILE a respondent is in a conversation, THE System SHALL display "Powered by Personity" branding in the interface footer
2. WHEN a respondent completes a conversation, THE System SHALL display a thank you screen with viral call-to-action
3. WHEN displaying the viral call-to-action, THE System SHALL show the message "Like how we interact? Build your own for free with Personity" with a clickable link
4. WHEN a respondent clicks the viral link, THE System SHALL redirect to the signup page with a referral tracking parameter
5. WHERE a creator has a paid plan, THE System SHALL allow removal of "Powered by Personity" branding as an optional feature

### Requirement 21: UI/UX Design Standards

**User Story:** As a user, I want a sophisticated, professional interface, so that I trust the platform with my research data.

#### Acceptance Criteria

1. THE System SHALL use the defined neutral color scale (N50-N950) for 90% of the interface
2. THE System SHALL use accent colors (Primary #2563EB) for CTAs and focus states only
3. THE System SHALL use Inter font family with 600 weight for headings and 400 weight for body text
4. THE System SHALL follow 8px grid spacing system for all layout and component spacing
5. THE System SHALL provide visible focus states (2px ring, 4px offset) on all interactive elements
6. THE System SHALL provide hover states on all interactive elements
7. THE System SHALL use border-radius of 8px (components), 12px (cards), or 16px (modals)
8. THE System SHALL maintain minimum 4.5:1 color contrast ratio for text
9. THE System SHALL support responsive layouts from 375px (mobile) to 2560px (desktop)
10. THE System SHALL use minimal shadows (max 2px blur) following flat design principles

### Requirement 22: Performance Requirements

**User Story:** As a user, I want fast page loads and responses, so that I have a smooth experience.

#### Acceptance Criteria

1. THE System SHALL load the landing page in under 2 seconds (p95)
2. THE System SHALL load the dashboard in under 3 seconds (p95)
3. THE System SHALL generate AI responses in under 5 seconds (p95)
4. THE System SHALL generate PDF exports in under 15 seconds (p95)
5. THE System SHALL optimize database queries to execute in under 500ms (p95)
