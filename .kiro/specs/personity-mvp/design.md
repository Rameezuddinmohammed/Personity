# Personity MVP - Design Document

## Overview

Personity is a full-stack web application that enables AI-powered conversational research at scale. The system consists of:

1. **Frontend**: Next.js 14 application with TypeScript and Tailwind CSS
2. **Backend**: Next.js API routes with PostgreSQL database
3. **AI Engine**: Dual-provider system (OpenAI GPT-4o + Anthropic Claude Sonnet)
4. **Infrastructure**: Vercel hosting, Supabase database, AWS S3 storage
5. **Third-party Services**: Stripe payments, email delivery, monitoring

The architecture prioritizes:
- **Reliability**: AI provider fallback, retry logic, error handling
- **Performance**: Sub-5s AI responses, optimized database queries
- **Cost Control**: Token management, usage tracking, daily spend alerts
- **Security**: HTTPS, JWT auth, input validation, rate limiting
- **Scalability**: Stateless API design, efficient session management

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                        │
│  (React/Next.js Frontend + Respondent Interface)    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Edge Network                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         Next.js Application                   │  │
│  │  ┌────────────┐  ┌──────────────────────┐   │  │
│  │  │  Frontend  │  │    API Routes        │   │  │
│  │  │  (Pages)   │  │  /api/auth/*         │   │  │
│  │  │            │  │  /api/surveys/*      │   │  │
│  │  │            │  │  /api/conversations/*│   │  │
│  │  └────────────┘  └──────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
└──────────────┬──────────────┬───────────────┬──────┘
               │              │               │
               ▼              ▼               ▼
       ┌───────────┐  ┌─────────┐  ┌──────────────┐
       │PostgreSQL │  │ OpenAI  │  │   Stripe     │
       │(Supabase) │  │ Claude  │  │   Resend     │
       │           │  │         │  │   Sentry     │
       └───────────┘  └─────────┘  └──────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.x
- shadcn/ui components
- React Query (TanStack Query) for data fetching
- Zustand for client state management

**Backend:**
- Next.js API Routes
- Prisma ORM 5.x
- PostgreSQL 15+
- Node.js 20.x LTS

**AI Provider:**
- Azure AI Foundry GPT-4o (via Azure OpenAI SDK)

**Infrastructure:**
- Hosting: Vercel (Pro plan)
- Database: Supabase (Pro plan)
- File Storage: Supabase Storage (for PDF exports)
- CDN: Vercel Edge Network

**Third-Party Services:**
- Payments: ⏸️ Instamojo (delayed to Phase 2)
- Email: Resend
- Error Tracking: Sentry (optional)

## Phase 0: Project Setup and Configuration

### 0.1 Environment Setup

**Prerequisites:**
- Node.js 20.x LTS installed
- Git installed
- VS Code or preferred IDE
- Vercel CLI installed globally
- Stripe CLI for webhook testing

**Initial Project Setup:**

```bash
# Create Next.js project
npx create-next-app@latest personity --typescript --tailwind --app --src-dir

# Navigate to project
cd personity

# Install core dependencies
npm install @prisma/client prisma
npm install @tanstack/react-query zustand
npm install zod react-hook-form @hookform/resolvers
npm install bcryptjs jsonwebtoken
npm install @azure/openai
npm install @supabase/supabase-js
npm install resend
npm install axios

# Install UI dependencies
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-toast

# Install dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/node typescript
npm install -D eslint prettier eslint-config-prettier

# Initialize Prisma
npx prisma init
```

### 0.2 API Keys and Service Setup

**Required API Keys and Accounts:**

1. **Azure AI Foundry**
   - Sign up at https://ai.azure.com
   - Create project and GPT-4o deployment
   - Get API key, endpoint, and deployment name
   - Set up billing in Azure portal

2. **Supabase (Database + Storage)**
   - Sign up at https://supabase.com
   - Create new project
   - Copy connection string from Settings > Database
   - Enable Row Level Security (RLS) policies

4. **Instamojo Account**
   - Sign up at https://www.instamojo.com
   - Get API Key and Auth Token from Settings > API & Plugins
   - Create payment links for each plan (₹999, ₹6499, ₹16499, ₹41499)
   - Set up webhook URL (will configure later)

5. **Resend Email Service**
   - Sign up at https://resend.com
   - Verify domain or use resend.dev for testing
   - Create API key

6. **Sentry Error Tracking** (Optional for MVP)
   - Sign up at https://sentry.io
   - Create new project (Next.js)
   - Copy DSN

7. **Mixpanel Analytics** (Optional for MVP)
   - Sign up at https://mixpanel.com
   - Create project
   - Copy project token

### 0.3 Environment Variables Configuration

Create `.env.local` file:

```bash
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database
DATABASE_URL="postgresql://user:password@host:5432/personity?schema=public"

# AI Provider (Azure AI Foundry)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=personity-gpt4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Supabase (Database + Storage)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Authentication
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRY=24h

# Instamojo (⏸️ DELAYED - Phase 2)
# INSTAMOJO_API_KEY=... (Phase 2)
# INSTAMOJO_AUTH_TOKEN=... (Phase 2)
# INSTAMOJO_SALT=... (Phase 2)
# INSTAMOJO_WEBHOOK_SECRET=... (Phase 2)
# NEXT_PUBLIC_INSTAMOJO_ENABLED=false

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@personity.com

# Monitoring (Optional for MVP)
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# AWS S3 (for PDF storage)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=personity-exports

# Cost Monitoring
DAILY_COST_ALERT_USD=500
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Rate Limiting (Use Vercel middleware)
# No custom implementation needed for MVP
```

### 0.4 MCP Server Configuration

Personity will use MCP servers for enhanced development capabilities. Create `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "uvx",
      "args": ["mcp-server-supabase"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
      },
      "disabled": false,
      "autoApprove": ["list_tables", "execute_sql"]
    }
  }
}
```

### 0.5 Database Schema Setup

The database schema will be defined using Prisma. Key tables include:

- `users` - User accounts and subscription info
- `surveys` - Survey configurations
- `conversation_sessions` - Active/paused conversation sessions
- `conversations` - Message history
- `response_analysis` - Per-response insights
- `aggregate_analysis` - Multi-response patterns
- `api_usage` - Cost tracking

Full schema will be implemented in Phase 1.

### 0.6 Project Structure

```
personity/
├── .kiro/
│   └── settings/
│       └── mcp.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   └── surveys/
│   │   ├── (public)/
│   │   │   └── s/[shortUrl]/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── surveys/
│   │   │   ├── conversations/
│   │   │   └── stripe/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── survey/
│   │   └── conversation/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── openai.ts
│   │   │   ├── claude.ts
│   │   │   └── provider.ts
│   │   ├── auth/
│   │   ├── db/
│   │   ├── email/
│   │   └── utils/
│   ├── types/
│   └── middleware.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Components and Interfaces

### Core Domain Models

**User Model:**
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'business';
  responsesUsedThisMonth: number;
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  createdAt: Date;
  updatedAt: Date;
}
```

**Survey Model:**
```typescript
interface Survey {
  id: string;
  userId: string;
  title: string;
  objective: string;
  context?: {
    productDescription?: string;
    userInfo?: string;
    knownIssues?: string;
  };
  topics: string[];
  settings: {
    length: 'quick' | 'standard' | 'deep';
    tone: 'professional' | 'friendly' | 'casual';
    stopCondition: 'questions' | 'topics_covered';
    maxQuestions?: number;
  };
  masterPrompt: string;
  status: 'active' | 'paused' | 'completed';
  shortUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Conversation Session Model:**
```typescript
interface ConversationSession {
  id: string;
  surveyId: string;
  sessionToken: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  currentState: {
    exchangeCount: number;
    topicsCovered: string[];
    lastAIMessage?: string;
  };
  ipAddress: string;
  userAgent: string;
  countryCode?: string;
  startedAt: Date;
  lastMessageAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}
```

**Conversation Model:**
```typescript
interface Conversation {
  id: string;
  sessionId: string;
  exchanges: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  durationSeconds: number;
  tokenUsage: {
    input: number;
    output: number;
    cost: number;
  };
}
```

**Response Analysis Model:**
```typescript
interface ResponseAnalysis {
  id: string;
  conversationId: string;
  summary: string;
  keyThemes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topQuotes: Array<{
    quote: string;
    context: string;
  }>;
  painPoints: string[];
  opportunities: string[];
  qualityScore: number; // 1-10
  isFlagged: boolean;
  createdAt: Date;
}
```

### AI Service (Azure AI Foundry)

**Azure OpenAI Integration:**
```typescript
import { AzureOpenAI } from '@azure/openai';

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview',
});

export async function generateAIResponse(
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME!;
  
  const response = await client.chat.completions.create({
    model: deploymentName, // Uses your deployment name
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 200,
  });
  
  return {
    content: response.choices[0].message.content,
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    },
  };
}

// Cost tracking (same pricing as OpenAI GPT-4o)
const COST_PER_1M_TOKENS = {
  input: 2.50,
  output: 10.00,
};

export function calculateCost(usage: { inputTokens: number; outputTokens: number }) {
  return (
    (usage.inputTokens / 1_000_000) * COST_PER_1M_TOKENS.input +
    (usage.outputTokens / 1_000_000) * COST_PER_1M_TOKENS.output
  );
}
```

### Conversation Engine Interface

**Conversation Manager:**
```typescript
interface ConversationManager {
  startSession(surveyId: string, metadata: SessionMetadata): Promise<Session>;
  
  handleMessage(
    sessionToken: string,
    userMessage: string
  ): Promise<{
    aiResponse: string;
    shouldEnd: boolean;
    topicsCovered: string[];
  }>;
  
  pauseSession(sessionToken: string): Promise<{ resumeUrl: string }>;
  
  resumeSession(sessionToken: string): Promise<Session>;
  
  completeSession(
    sessionToken: string,
    confirmed: boolean
  ): Promise<void>;
  
  checkQuality(
    sessionToken: string,
    userMessage: string
  ): Promise<QualityCheck>;
}
```

### Rate Limiting (Simplified)

**Use Vercel's Built-in Rate Limiting:**

For MVP, we'll use simple middleware rate limiting instead of complex custom implementation:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  // Simple rate limiting for conversation endpoints
  if (request.nextUrl.pathname.startsWith('/api/conversations')) {
    const ip = request.ip ?? 'unknown';
    const now = Date.now();
    const limit = rateLimit.get(ip);
    
    if (limit && now < limit.resetAt) {
      if (limit.count >= 30) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );
      }
      limit.count++;
    } else {
      rateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    }
  }
  
  return NextResponse.next();
}
```

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                      String   @id @default(uuid())
  email                   String   @unique
  passwordHash            String
  name                    String
  plan                    Plan     @default(FREE)
  responsesUsedThisMonth  Int      @default(0)
  paymentProviderId       String?  @unique
  paymentLinkId           String?
  subscriptionStatus      SubscriptionStatus @default(ACTIVE)
  subscriptionRenewsAt    DateTime?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  surveys                 Survey[]
  
  @@index([email])
  @@index([plan])
}

enum Plan {
  FREE
  STARTER
  PRO
  BUSINESS
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
}

model Survey {
  id            String   @id @default(uuid())
  userId        String
  title         String
  objective     String   @db.Text
  context       Json?
  topics        Json
  settings      Json
  masterPrompt  String   @db.Text
  status        SurveyStatus @default(ACTIVE)
  shortUrl      String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions      ConversationSession[]
  aggregateAnalysis AggregateAnalysis[]
  
  @@index([userId])
  @@index([shortUrl])
  @@index([status])
}

enum SurveyStatus {
  ACTIVE
  PAUSED
  COMPLETED
}

model ConversationSession {
  id              String   @id @default(uuid())
  surveyId        String
  sessionToken    String   @unique
  status          SessionStatus @default(ACTIVE)
  currentState    Json
  ipAddress       String
  userAgent       String
  countryCode     String?
  startedAt       DateTime @default(now())
  lastMessageAt   DateTime @default(now())
  completedAt     DateTime?
  metadata        Json?
  
  survey          Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  conversation    Conversation?
  
  @@index([sessionToken])
  @@index([surveyId])
  @@index([status])
  @@index([ipAddress])
}

enum SessionStatus {
  ACTIVE
  PAUSED
  COMPLETED
  ABANDONED
}

model Conversation {
  id              String   @id @default(uuid())
  sessionId       String   @unique
  exchanges       Json
  durationSeconds Int
  tokenUsage      Json
  createdAt       DateTime @default(now())
  
  session         ConversationSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  analysis        ResponseAnalysis?
  
  @@index([sessionId])
}

model ResponseAnalysis {
  id              String   @id @default(uuid())
  conversationId  String   @unique
  summary         String   @db.Text
  keyThemes       Json
  sentiment       Sentiment
  topQuotes       Json
  painPoints      Json
  opportunities   Json
  qualityScore    Int
  isFlagged       Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([qualityScore])
}

enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

model AggregateAnalysis {
  id                String   @id @default(uuid())
  surveyId          String
  responseCount     Int
  executiveSummary  String   @db.Text
  topThemes         Json
  userSegments      Json?
  createdAt         DateTime @default(now())
  
  survey            Survey   @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  @@index([surveyId])
}

model ApiUsage {
  id              String   @id @default(uuid())
  sessionId       String
  provider        String
  model           String
  inputTokens     Int
  outputTokens    Int
  costUsd         Float
  timestamp       DateTime @default(now())
  
  @@index([sessionId])
  @@index([timestamp])
}

model BannedIp {
  id          String   @id @default(uuid())
  ipAddress   String   @unique
  reason      String
  bannedAt    DateTime @default(now())
  
  @@index([ipAddress])
}
```

## Error Handling

### Error Types

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(401, message, 'AUTH_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(429, message, 'RATE_LIMIT');
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

class AIProviderError extends AppError {
  constructor(message: string, public provider: string) {
    super(503, message, 'AI_PROVIDER_ERROR');
  }
}

class UsageLimitError extends AppError {
  constructor(message: string) {
    super(403, message, 'USAGE_LIMIT');
  }
}
```

### Global Error Handler

```typescript
// API route error handler
export function errorHandler(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode }
    );
  }
  
  // Log unexpected errors to Sentry
  console.error('Unexpected error:', error);
  Sentry.captureException(error);
  
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}
```

### Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    retryableErrors?: number[];
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableErrors = [429, 500, 502, 503, 504],
  } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries;
      const isRetryable = retryableErrors.includes(error.status);
      
      if (isLastAttempt || !isRetryable) {
        throw error;
      }
      
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1),
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry failed');
}
```

## Testing Strategy

### Unit Tests

**Test Coverage Areas:**
- AI provider abstraction and fallback logic
- Rate limiting implementation
- Token counting and history summarization
- Quality detection algorithms
- Cost calculation
- Prompt template generation
- Authentication and JWT handling

**Example Test:**
```typescript
describe('ConversationManager', () => {
  describe('handleMessage', () => {
    it('should detect low quality responses', async () => {
      const manager = new ConversationManager();
      const session = await createTestSession();
      
      // Send low-quality responses
      await manager.handleMessage(session.token, 'idk');
      await manager.handleMessage(session.token, 'idk');
      await manager.handleMessage(session.token, 'idk');
      
      const quality = await manager.checkQuality(
        session.token,
        'idk'
      );
      
      expect(quality.isLowQuality).toBe(true);
      expect(quality.recommendation).toBe('flag');
    });
    
    it('should summarize history when token limit approached', async () => {
      const manager = new ConversationManager();
      const longHistory = generateLongHistory(100000);
      
      const summarized = await manager.summarizeHistory(longHistory);
      
      expect(getTotalTokens(summarized)).toBeLessThan(100000);
      expect(summarized).toContainEqual(
        expect.objectContaining({ role: 'system' })
      );
    });
  });
});
```

### Integration Tests

**Test Coverage Areas:**
- Complete survey creation flow
- End-to-end conversation flow
- Payment and subscription flow
- Analysis pipeline
- Email notifications

**Example Test:**
```typescript
describe('Survey Flow', () => {
  it('should complete full survey lifecycle', async () => {
    // Create user
    const user = await createTestUser();
    const token = await loginUser(user);
    
    // Create survey
    const survey = await createSurvey(token, {
      title: 'Test Survey',
      objective: 'Test objective',
      topics: ['topic1', 'topic2'],
    });
    
    expect(survey.shortUrl).toBeDefined();
    
    // Start conversation
    const session = await startConversation(survey.shortUrl);
    
    // Complete conversation
    for (let i = 0; i < 10; i++) {
      const response = await sendMessage(
        session.token,
        `Response ${i}`
      );
      expect(response.aiResponse).toBeDefined();
    }
    
    await completeConversation(session.token, true);
    
    // Check analysis
    const analysis = await getAnalysis(session.id);
    expect(analysis.summary).toBeDefined();
    expect(analysis.qualityScore).toBeGreaterThan(0);
  });
});
```

### E2E Tests

**Test Coverage Areas:**
- User signup and onboarding
- Survey creation wizard
- Respondent conversation experience
- Dashboard and insights viewing
- Export functionality

## Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 24-hour expiry
- HTTP-only cookies for token storage
- CSRF protection on state-changing operations
- Email verification required for signup

### API Security

- Rate limiting on all endpoints
- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM
- XSS prevention via React's built-in escaping
- CORS restrictions to allowed origins only

### Data Security

- HTTPS enforced in production
- Sensitive environment variables never exposed to client
- Database credentials stored securely
- API keys rotated regularly
- User data encrypted at rest (database level)

### Abuse Prevention

- IP-based rate limiting
- Quality detection and flagging
- Automated IP banning for repeat offenders
- Session token validation
- Suspicious activity monitoring

## Performance Optimization

### Frontend Optimization

- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- React Query for efficient data fetching and caching
- Debounced search inputs
- Lazy loading for heavy components

### Backend Optimization

- Database query optimization with proper indexes
- Connection pooling for database
- Caching frequently accessed data (Redis optional)
- Efficient pagination for large datasets
- Background jobs for analysis (queue system optional)

### AI Response Optimization

- Streaming responses for better UX (future enhancement)
- Token limit management to prevent overflow
- Efficient prompt templates
- Caching of master prompts
- Parallel analysis processing

## Monitoring and Observability

### Error Tracking

- Sentry integration for error capture
- Error grouping and alerting
- Performance monitoring
- Release tracking

### Analytics

- Mixpanel for user behavior tracking
- Custom events for key actions:
  - Survey created
  - Conversation started
  - Conversation completed
  - Upgrade to paid plan
  - Export generated

### Cost Monitoring

- Real-time API usage tracking
- Daily spend calculations
- Alert thresholds ($500/day default)
- Per-user cost analysis
- Provider cost comparison

### Health Checks

- Database connection health
- AI provider availability
- Email service status
- Payment processor status

## Payment Integration (Instamojo)

### Instamojo Payment Flow

Instamojo uses a redirect-based payment flow, different from Stripe's embedded checkout:

1. User selects a plan
2. Backend creates a Payment Request via Instamojo API
3. User is redirected to Instamojo payment page
4. After payment, user is redirected back to success/failure URL
5. Webhook confirms payment asynchronously

### Creating Payment Request

```typescript
// lib/instamojo.ts
import axios from 'axios';
import crypto from 'crypto';

const INSTAMOJO_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.instamojo.com/v2/'
  : 'https://test.instamojo.com/v2/';

export async function createPaymentRequest(params: {
  amount: number;
  purpose: string;
  buyerName: string;
  email: string;
  phone?: string;
  redirectUrl: string;
  webhookUrl: string;
}) {
  const response = await axios.post(
    `${INSTAMOJO_API_URL}payment-requests/`,
    {
      amount: params.amount,
      purpose: params.purpose,
      buyer_name: params.buyerName,
      email: params.email,
      phone: params.phone,
      redirect_url: params.redirectUrl,
      webhook: params.webhookUrl,
      send_email: true,
      send_sms: false,
      allow_repeated_payments: false,
    },
    {
      headers: {
        'X-Api-Key': process.env.INSTAMOJO_API_KEY,
        'X-Auth-Token': process.env.INSTAMOJO_AUTH_TOKEN,
      },
    }
  );
  
  return {
    paymentRequestId: response.data.id,
    longUrl: response.data.longurl,
  };
}
```

### Webhook Verification

```typescript
// api/instamojo/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Verify webhook signature
  const mac = body.mac;
  delete body.mac;
  
  const message = Object.keys(body)
    .sort()
    .map(key => `${key}=${body[key]}`)
    .join('|');
  
  const expectedMac = crypto
    .createHmac('sha1', process.env.INSTAMOJO_SALT!)
    .update(message)
    .digest('hex');
  
  if (mac !== expectedMac) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }
  
  // Payment verified, update user subscription
  if (body.status === 'Credit') {
    const paymentId = body.payment_id;
    const amount = parseFloat(body.amount);
    const buyerEmail = body.buyer;
    
    // Determine plan based on amount
    let plan: 'starter' | 'pro' | 'business';
    if (amount >= 41499) plan = 'business';
    else if (amount >= 16499) plan = 'pro';
    else if (amount >= 6499) plan = 'starter';
    else {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    
    // Update user in database
    await prisma.user.update({
      where: { email: buyerEmail },
      data: {
        plan,
        paymentProviderId: paymentId,
        subscriptionStatus: 'ACTIVE',
        subscriptionRenewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        responsesUsedThisMonth: 0,
      },
    });
    
    // Send confirmation email
    await sendEmail({
      to: buyerEmail,
      subject: 'Payment Successful - Welcome to Personity!',
      template: 'payment_success',
      data: { plan },
    });
  }
  
  return NextResponse.json({ success: true });
}
```

### Plan Pricing Configuration

```typescript
// lib/plans.ts
export const PLANS = {
  free: {
    name: 'Free',
    priceINR: 0,
    maxResponsesTotal: 50,
    timeLimitDays: 30,
    features: {
      testMode: true,
      basicAnalysis: true,
      pdfExport: false,
      watermark: true,
    },
  },
  starter: {
    name: 'Starter',
    priceINR: 6499,
    maxResponsesMonth: 400,
    addonPriceINR: 25,
    features: {
      testMode: true,
      fullAnalysis: true,
      pdfExport: true,
      csvExport: true,
      watermark: false,
    },
  },
  pro: {
    name: 'Pro',
    priceINR: 16499,
    maxResponsesMonth: 1500,
    addonPriceINR: 17,
    features: {
      advancedAnalysis: true,
      teamAccess: 5,
      prioritySupport: true,
    },
  },
  business: {
    name: 'Business',
    priceINR: 41499,
    maxResponsesMonth: 5000,
    addonPriceINR: 12,
    features: {
      teamAccess: 15,
    },
  },
} as const;
```

### Handling Subscription Renewals

Since Instamojo doesn't have built-in recurring subscriptions for individuals, we need to handle renewals manually:

```typescript
// Cron job or scheduled task (run daily)
export async function checkExpiredSubscriptions() {
  const expiredUsers = await prisma.user.findMany({
    where: {
      plan: { not: 'FREE' },
      subscriptionRenewsAt: {
        lte: new Date(),
      },
      subscriptionStatus: 'ACTIVE',
    },
  });
  
  for (const user of expiredUsers) {
    // Send renewal reminder email
    await sendEmail({
      to: user.email,
      subject: 'Your Personity subscription needs renewal',
      template: 'renewal_reminder',
      data: {
        plan: user.plan,
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/renew`,
      },
    });
    
    // Mark as past_due after 7 days grace period
    const gracePeriodEnd = new Date(user.subscriptionRenewsAt!);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    
    if (new Date() > gracePeriodEnd) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'PAST_DUE',
        },
      });
    }
  }
}
```

## Deployment Strategy

### Development Environment

- Local development with hot reload
- Local PostgreSQL or Supabase
- Test API keys for all services
- Stripe test mode

### Staging Environment

- Vercel preview deployments
- Staging database (separate from production)
- Test API keys
- Stripe test mode

### Production Environment

- Vercel production deployment
- Production database with backups
- Production API keys
- Stripe live mode
- CDN for static assets
- Environment variable management via Vercel

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Scalability Considerations

### Database Scaling

- Connection pooling (PgBouncer)
- Read replicas for analytics queries
- Partitioning for large tables (conversations, api_usage)
- Regular vacuum and analyze operations

### Application Scaling

- Stateless API design for horizontal scaling
- Vercel serverless functions auto-scale
- Rate limiting to prevent abuse
- Queue system for background jobs (Bull/BullMQ)

### Cost Scaling

- AI provider cost optimization
- Efficient token usage
- Caching strategies
- Usage-based pricing alignment

This design provides a comprehensive foundation for building the Personity MVP with all necessary setup steps, architecture decisions, and implementation details.
