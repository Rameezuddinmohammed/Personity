# Implementation Plan

This plan breaks down the Personity MVP into discrete, actionable coding tasks. Each task builds incrementally on previous work, ending with a fully integrated system.

## Task List

- [ ] 1. Project Setup and Configuration
- [ ] 1.1 Initialize Next.js project with TypeScript and Tailwind CSS
  - Run `npx create-next-app@latest personity --typescript --tailwind --app --src-dir`
  - Install all core dependencies (Prisma, React Query, Zod, bcryptjs, jsonwebtoken, @azure/openai, @supabase/supabase-js, Resend, axios)
  - Install UI dependencies (shadcn/ui components, Radix UI primitives, lucide-react)
  - Install Inter font: `npm install @fontsource/inter`
  - Configure TypeScript with strict mode
  - Set up ESLint and Prettier
  - _Requirements: 21.1, 21.2_

- [ ] 1.1.5 Configure UI Design System
  - Set up Tailwind config with custom color palette (N50-N950, Primary, Success, Error)
  - Configure Inter font family as default sans-serif
  - Set up 8px spacing scale
  - Configure border-radius defaults (8px, 12px, 16px)
  - Add custom box-shadow utilities (minimal shadows only)
  - Create base component styles following UI-DESIGN-SYSTEM.md
  - _Requirements: 21.1, UI Design System_

- [ ] 1.2 Configure environment variables and project structure
  - Create `.env.local` with all required variables (database, OpenAI, Instamojo, email, monitoring)
  - Create folder structure: `src/app`, `src/components`, `src/lib`, `src/types`
  - Set up route groups: `(auth)`, `(dashboard)`, `(public)`
  - Create `middleware.ts` for auth and rate limiting
  - _Requirements: 19.2, 19.6_

- [ ] 1.3 Initialize Prisma and database schema
  - Run `npx prisma init`
  - Define complete Prisma schema with all models (User, Survey, ConversationSession, Conversation, ResponseAnalysis, AggregateAnalysis, ApiUsage, BannedIp)
  - Add proper indexes for performance
  - Run initial migration
  - Generate Prisma Client
  - _Requirements: All data-related requirements_

- [ ]* 1.4 Set up MCP server for Supabase
  - Create `.kiro/settings/mcp.json` with Supabase MCP configuration
  - Add Supabase URL and service role key to environment
  - Test MCP connection with list_tables command
  - _Requirements: Development tooling_

- [ ] 2. Authentication System
- [ ] 2.1 Implement user registration with email/password
  - Create `/api/auth/signup` route
  - Implement password hashing with bcrypt (10 rounds)
  - Validate email format and password strength using Zod
  - Create user in database with FREE plan
  - Send welcome email via Resend
  - _Requirements: 1.1, 19.1_

- [ ] 2.2 Implement user login and JWT token generation
  - Create `/api/auth/login` route
  - Verify password with bcrypt
  - Generate JWT token with 24-hour expiry
  - Return token in HTTP-only cookie
  - _Requirements: 1.3, 19.5_

- [ ] 2.3 Implement Google OAuth authentication
  - Set up Google OAuth credentials
  - Create `/api/auth/google` route
  - Handle OAuth callback and user creation/linking
  - Generate JWT token for OAuth users
  - _Requirements: 1.2_

- [ ] 2.4 Create authentication middleware
  - Implement JWT verification middleware
  - Protect dashboard and API routes
  - Add user context to requests
  - Handle token expiry and refresh
  - _Requirements: 19.5_

- [ ] 2.5 Build login and signup UI pages
  - Create `/app/(auth)/login/page.tsx` with centered 440px card
  - Create `/app/(auth)/signup/page.tsx` with same layout
  - Implement form with Input components (12px 16px padding, N300 borders)
  - Add Primary button (12px 24px padding, #2563EB background)
  - Add Google OAuth Secondary button with icon
  - Implement form validation with react-hook-form and Zod
  - Add error states (Error color borders, 2px ring)
  - Add loading states (disabled button, N300 background)
  - Follow UI-COMPONENT-SPECS.md for exact measurements
  - _Requirements: 1.1, 1.2, 1.3, UI Design System_

- [ ] 3. Survey Creation Workflow
- [ ] 3.1 Create survey creation wizard UI
  - Build centered card (800px max-width, 48px padding, 16px border-radius)
  - Create horizontal progress indicator (5 steps, 40px circles)
  - Implement step navigation with Primary/Secondary buttons
  - Style active step (Primary background), completed (Success), upcoming (N200)
  - Add 2px connector line between steps (N200 background, Primary progress)
  - Create form state management with Zustand
  - Follow UI-COMPONENT-SPECS.md wizard specifications
  - _Requirements: 2.1, UI Design System_

- [ ] 3.2 Implement Step 1: Objective input with AI context detection
  - Create objective input field
  - Call OpenAI to detect if context is needed based on objective
  - Conditionally show/hide Step 2 based on AI response
  - _Requirements: 2.2, 2.3_

- [ ] 3.3 Implement Step 2: Context collection (conditional)
  - Create fields for product description, user info, known issues
  - Make all fields optional
  - Store context as JSON
  - _Requirements: 2.3_

- [ ] 3.4 Implement Step 3: Key topics input
  - Create bullet list input for 2-10 topics
  - Add/remove topic functionality
  - Validate minimum 2 topics
  - _Requirements: 2.4_

- [ ] 3.5 Implement Step 4: Settings configuration
  - Create dropdowns for length (Quick/Standard/Deep)
  - Create dropdown for tone (Professional/Friendly/Casual)
  - Create radio buttons for stop condition
  - Add optional max questions input
  - _Requirements: 2.4_

- [ ] 3.6 Create survey API endpoint and master prompt generation
  - Create `/api/surveys` POST route
  - Generate unique 6-character short URL
  - Create master prompt template from survey config
  - Save survey to database
  - Return survey with short URL
  - _Requirements: 2.6, 2.7_

- [ ] 3.7 Implement test mode simulation
  - Create test mode toggle in survey settings
  - Build test conversation UI
  - Call OpenAI without saving to database
  - Display conversation transcript
  - Add reset functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Dashboard and Survey Management
- [ ] 4.1 Create dashboard layout and navigation
  - Build top navigation bar (64px height, white background, N200 bottom border)
  - Create fixed sidebar (240px width, white background, N200 right border)
  - Add logo (24px height) and nav links (14px, 500 weight, 8px 16px padding)
  - Implement user menu with avatar (32px circle, N200 background)
  - Style active nav items (N200 background, N950 text)
  - Add hover states (N100 background on all interactive elements)
  - Implement mobile responsive navigation (hamburger < 768px)
  - Follow UI-COMPONENT-SPECS.md dashboard layout specifications
  - _Requirements: 17.1, UI Design System_

- [ ] 4.2 Build surveys list view
  - Create `/app/(dashboard)/dashboard/page.tsx`
  - Fetch user's surveys from API
  - Display surveys in grid/list with status, response count, completion rate
  - Add create survey button
  - Implement empty state with example survey option
  - _Requirements: 17.1, 17.2, 17.3_

- [ ] 4.3 Implement survey detail view and management
  - Create survey detail page
  - Display survey configuration
  - Show real-time response count
  - Add pause/resume functionality
  - Add delete functionality (soft delete)
  - _Requirements: 17.3, 17.4, 17.5_

- [ ] 4.4 Create usage tracking display
  - Show current plan and limits
  - Display responses used this month
  - Add progress bar for usage
  - Show days remaining for free plan
  - _Requirements: 14.2_

- [ ] 5. Respondent Conversation Experience
- [ ] 5.1 Create survey landing page
  - Build `/app/(public)/s/[shortUrl]/page.tsx`
  - Fetch survey by short URL
  - Display survey title and objective
  - Add "Start Conversation" button
  - Show "Powered by Personity" branding
  - _Requirements: 4.1, 20.1_

- [ ] 5.2 Implement conversation session creation
  - Create `/api/surveys/[shortUrl]/start` route
  - Generate unique session token
  - Create ConversationSession in database
  - Capture IP address, user agent, country code
  - Return session token and initial AI greeting
  - _Requirements: 4.2_

- [ ] 5.3 Build conversation UI with message exchange
  - Create centered container (800px max-width, N50 background)
  - Build white chat card (16px border-radius, 32px padding)
  - Style AI messages (left-aligned, N100 background, 12px 16px padding, 12px border-radius)
  - Style user messages (right-aligned, Primary/10 background, 12px 16px padding)
  - Add typing indicator (3 dots, 8px circles, N400, bounce animation)
  - Create sticky input area (white background, N200 top border, 24px padding)
  - Add auto-grow textarea (12px 16px padding, max 120px height)
  - Add send button (48px square, Primary background, white icon)
  - Show progress bar (4px height, N200 background, Primary fill)
  - Make mobile-responsive (full width < 640px)
  - Follow UI-COMPONENT-SPECS.md conversation interface specifications
  - _Requirements: 4.3, 4.4, 4.7, UI Design System_

- [ ] 5.4 Implement message handling API
  - Create `/api/conversations/[token]/message` POST route
  - Validate session token and status
  - Check rate limits (30 req/min per IP)
  - Append user message to conversation history
  - Call OpenAI with master prompt and history
  - Track token usage and costs
  - Return AI response
  - _Requirements: 4.3, 6.1, 6.2, 6.7, 8.1, 8.2_

- [ ] 5.5 Implement conversation history management
  - Load conversation history from database
  - Implement token counting function
  - Add history summarization when exceeding 100k tokens
  - Preserve first 2 and last 6 exchanges
  - _Requirements: 6.5_

- [ ] 5.6 Add pause and resume functionality
  - Create pause button in conversation UI
  - Implement `/api/conversations/[token]/pause` route
  - Save current state to database
  - Generate and return resume URL
  - Create `/api/conversations/[token]/resume` route
  - Restore conversation with full history
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.7 Implement conversation completion flow
  - Detect when AI determines conversation is complete
  - Generate summary of understanding
  - Display summary to respondent for confirmation
  - Create `/api/conversations/[token]/complete` route
  - Mark session as completed
  - Increment creator's response counter
  - Show thank you screen with viral CTA
  - _Requirements: 4.6, 20.2, 20.3, 20.4_

- [ ] 6. AI Conversation Engine
- [ ] 6.1 Create OpenAI service wrapper
  - Build `lib/ai/openai.ts` with direct SDK usage
  - Implement `generateAIResponse` function
  - Set model to gpt-4o, temperature 0.7, max_tokens 200
  - Return content and token usage
  - _Requirements: 6.2_

- [ ] 6.2 Implement master prompt template system
  - Create prompt template with variable placeholders
  - Build function to replace variables (objective, context, topics, settings)
  - Format context and topics properly
  - Store generated prompts in database
  - _Requirements: 6.1_

- [ ] 6.3 Add topic tracking logic
  - Parse AI responses to identify topics discussed
  - Update currentState.topicsCovered in session
  - Prevent repeating questions on covered topics
  - _Requirements: 6.6_

- [ ] 6.4 Implement conversation ending detection
  - Analyze conversation state (exchange count, topics covered)
  - Check stop condition from survey settings
  - Determine when to end conversation
  - Generate final summary
  - _Requirements: 4.6_

- [ ] 7. Quality Detection and Fraud Prevention
- [ ] 7.1 Implement low-quality response detection
  - Create quality check function using GPT-4o-mini
  - Detect 1-2 word responses, "idk", generic answers
  - Flag sessions after 3 low-quality responses
  - Attempt re-engagement once
  - _Requirements: 4.5, 7.1_

- [ ] 7.2 Add spam and abuse detection
  - Detect identical responses (3+ times)
  - Track sessions per IP in 24-hour window
  - Calculate average exchange time
  - Flag suspicious patterns
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 7.3 Implement IP banning system
  - Create BannedIp table operations
  - Ban IPs with 10+ low-quality sessions in 24 hours
  - Check banned IPs before allowing new sessions
  - Add manual ban/unban functionality
  - _Requirements: 7.2_

- [ ] 8. Rate Limiting
- [ ] 8.1 Implement middleware rate limiting
  - Create rate limiting logic in `middleware.ts`
  - Track requests per IP with in-memory Map
  - Limit to 30 requests per minute
  - Return 429 status when exceeded
  - Reset counters after 60 seconds
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 9. Analysis Pipeline
- [ ] 9.1 Implement per-response analysis
  - Create analysis function using GPT-4o
  - Generate 2-3 sentence summary
  - Extract 2-5 key themes
  - Determine sentiment (positive/neutral/negative)
  - Extract 1-3 top quotes with context
  - Identify pain points and opportunities
  - Assign quality score (1-10)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 9.2 Trigger analysis on conversation completion
  - Call analysis function when conversation completes
  - Save results to ResponseAnalysis table
  - Handle analysis errors gracefully
  - _Requirements: 9.1_

- [ ] 9.3 Implement aggregate analysis generation
  - Create aggregate analysis function
  - Fetch all response analyses for survey
  - Generate executive summary (3-5 sentences)
  - Identify top themes with percentages
  - Detect user segments (if 15+ responses)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9.4 Trigger aggregate analysis at milestones
  - Run aggregate analysis when survey reaches 5 responses
  - Re-run every 5 additional responses
  - Store results in AggregateAnalysis table
  - _Requirements: 10.1, 10.2_

- [ ] 10. Insights Dashboard
- [ ] 10.1 Create insights overview page
  - Build `/app/(dashboard)/surveys/[id]/insights/page.tsx`
  - Display executive summary prominently
  - Show top themes with visual indicators
  - Display user segments if available
  - Add export buttons (PDF, CSV)
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 10.2 Build individual responses view with pagination
  - Create responses list component
  - Implement pagination (20 per page)
  - Add search functionality
  - Show summary and quality score for each
  - _Requirements: 11.4, 11.5_

- [ ] 10.3 Create response detail view
  - Build modal or page for full transcript
  - Display complete conversation history
  - Show analysis results (themes, sentiment, quotes)
  - Add navigation between responses
  - _Requirements: 11.6_

- [ ] 11. Export Functionality
- [ ] 11.1 Implement PDF export
  - Install PDF generation library (jsPDF or similar)
  - Create PDF template with branding
  - Include executive summary, themes, response summaries
  - Add watermark for free plan users
  - Upload to AWS S3
  - Return download URL
  - _Requirements: 12.1, 12.2, 12.3, 12.6_

- [ ] 11.2 Implement CSV export
  - Generate CSV with all response data
  - Include columns: timestamp, summary, themes, sentiment, quality score
  - Return as downloadable file
  - _Requirements: 12.4, 12.5_

- [ ] 12. Billing and Subscription Management (⏸️ DELAYED TO PHASE 2)

**Note**: Payment integration is postponed to focus on core features. All users will have access to all features during Phase 1 development.

- [ ]* 12.1 Create Instamojo payment service (DELAYED)
  - Build `lib/instamojo.ts` with API wrapper
  - Implement `createPaymentRequest` function
  - Handle redirect URLs
  - _Requirements: 13.4_

- [ ]* 12.2 Build plan selection UI (DELAYED)
  - Create `/app/(dashboard)/billing/page.tsx`
  - Display all plans with features and pricing
  - Add "Upgrade" buttons
  - Show current plan and usage
  - _Requirements: 13.1, 13.4_

- [ ]* 12.3 Implement payment initiation flow (DELAYED)
  - Create `/api/billing/create-payment` route
  - Call Instamojo API to create payment request
  - Store payment link ID in user record
  - Redirect user to Instamojo payment page
  - _Requirements: 13.4_

- [ ]* 12.4 Implement Instamojo webhook handler (DELAYED)
  - Create `/api/instamojo/webhook` route
  - Verify webhook signature using SALT
  - Parse payment status
  - Update user plan and subscription status
  - Reset response counters
  - Send confirmation email
  - _Requirements: 13.5_

- [ ]* 12.5 Add usage limit enforcement (DELAYED)
  - Create `canCreateResponse` function
  - Check free plan time limit (30 days)
  - Check free plan response limit (50 total)
  - Check paid plan monthly limits
  - Return upgrade prompts when limits reached
  - _Requirements: 13.2, 13.3, 13.6, 14.1, 14.3, 14.4, 14.5_

- [ ]* 12.6 Implement subscription renewal reminders (DELAYED)
  - Create cron job or scheduled task
  - Check for expired subscriptions daily
  - Send renewal reminder emails
  - Mark as PAST_DUE after 7-day grace period
  - _Requirements: 13.7_

- [ ] 13. Cost Monitoring and Tracking
- [ ] 13.1 Implement API usage tracking
  - Create `trackAPIUsage` function
  - Calculate costs based on token usage
  - Save to ApiUsage table with provider, model, tokens, cost
  - _Requirements: 15.1, 15.4_

- [ ] 13.2 Add daily cost monitoring
  - Create function to calculate daily spend
  - Send Slack alert when exceeding $500
  - Track costs per user and per survey
  - _Requirements: 15.2, 15.3_

- [ ] 14. Email Notifications
- [ ] 14.1 Set up Resend email service
  - Configure Resend API key
  - Create email templates (welcome, new_response, payment_success, renewal_reminder)
  - Build email sending wrapper function
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 14.2 Implement notification triggers
  - Send welcome email on signup
  - Send notification on new response completion
  - Send payment confirmation
  - Send usage limit warnings (80%, 100%)
  - Send renewal reminders
  - _Requirements: 16.1, 16.2, 16.3, 14.3, 14.4_

- [ ] 15. Error Handling and Monitoring
- [ ] 15.1 Create custom error classes
  - Define AppError, AuthenticationError, RateLimitError, ValidationError, AIProviderError, UsageLimitError
  - Implement error hierarchy
  - _Requirements: 18.1_

- [ ] 15.2 Implement global error handler
  - Create error handler middleware for API routes
  - Return appropriate status codes and messages
  - Log errors to console
  - _Requirements: 18.2, 18.3_

- [ ]* 15.3 Set up Sentry error tracking (optional)
  - Install and configure Sentry
  - Capture unhandled errors
  - Add error context and user info
  - _Requirements: 18.1_

- [ ] 16. Landing Page and Public Pages
- [ ] 16.1 Create landing page
  - Build `/app/page.tsx` with hero section
  - Add features section
  - Add pricing section
  - Add CTA buttons (Sign Up, Demo)
  - Make mobile-responsive
  - _Requirements: 21.1_

- [ ] 16.2 Create legal pages
  - Build `/app/privacy/page.tsx` with privacy policy
  - Build `/app/terms/page.tsx` with terms of service
  - Add links in footer
  - _Requirements: 19.4_

- [ ] 17. Testing and Quality Assurance
- [ ]* 17.1 Write unit tests for core functions
  - Test AI response generation
  - Test token counting and summarization
  - Test quality detection
  - Test cost calculation
  - Test authentication helpers
  - _Requirements: All functional requirements_

- [ ]* 17.2 Write integration tests for API routes
  - Test complete survey creation flow
  - Test conversation flow end-to-end
  - Test payment webhook handling
  - Test analysis pipeline
  - _Requirements: All API requirements_

- [ ] 18. Deployment and Launch Preparation
- [ ] 18.1 Configure production environment
  - Set up Vercel project
  - Configure production environment variables
  - Set up production database
  - Configure custom domain
  - _Requirements: 21.1, 21.2_

- [ ] 18.2 Run database migrations in production
  - Apply Prisma migrations to production database
  - Verify all tables and indexes created
  - Test database connectivity
  - _Requirements: All data requirements_

- [ ] 18.3 Perform end-to-end testing in staging
  - Test complete user journey (signup → create survey → collect responses → view insights)
  - Test payment flow with test mode
  - Verify email delivery
  - Test mobile responsiveness
  - _Requirements: All requirements_

- [ ] 18.4 Set up monitoring and alerts
  - Configure Sentry for production
  - Set up cost alert webhooks
  - Test error reporting
  - Verify email notifications working
  - _Requirements: 15.1, 15.2, 18.1_

- [ ] 18.5 Deploy to production
  - Deploy to Vercel production
  - Verify all environment variables
  - Test production deployment
  - Monitor for errors
  - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task should be completed and tested before moving to the next
- All tasks reference specific requirements from the requirements document
- The implementation follows a bottom-up approach: infrastructure → core features → UI → polish
