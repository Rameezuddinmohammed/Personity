# Technologies Used in Personity

**Complete Technology Stack Documentation**

---

## Overview

Personity is built with a modern, production-grade technology stack focused on TypeScript, serverless architecture, and AI-powered features. This document catalogs all 58 technologies used in the project.

---

## Languages (4)

1. **TypeScript 5.x** - Primary language for type-safe development (130 files)
2. **JavaScript (ESM)** - Configuration files and module scripts
3. **SQL** - Database schema definitions and migrations
4. **CSS** - Styling via Tailwind utility classes

---

## Core Frameworks (5)

### Frontend
1. **Next.js 16.0.3** - React framework with App Router
   - Server-side rendering (SSR)
   - Static site generation (SSG)
   - API routes
   - File-based routing

2. **React 19.2.0** - UI library
   - React Compiler enabled
   - Server Components
   - Client Components

3. **Tailwind CSS 4** - Utility-first CSS framework
   - Custom design system
   - 8px spacing grid
   - Responsive design

### Backend
4. **Node.js 20.x LTS** - JavaScript runtime
5. **Next.js API Routes** - Serverless backend functions

---

## UI Component Libraries (8)

1. **shadcn/ui** - Component library built on Radix UI
2. **Radix UI** - Accessible component primitives
   - `@radix-ui/react-dialog` - Modal dialogs
   - `@radix-ui/react-dropdown-menu` - Dropdown menus
   - `@radix-ui/react-label` - Form labels
   - `@radix-ui/react-select` - Select inputs
   - `@radix-ui/react-slot` - Composition utilities
   - `@radix-ui/react-toast` - Toast notifications
3. **Lucide React** - Icon library (554 icons)
4. **Framer Motion** - Animation library
5. **Recharts** - Data visualization and charts
6. **Class Variance Authority** - Component variant management
7. **Tailwind Merge** - Utility class merging
8. **clsx** - Conditional class names

---

## State Management & Data Fetching (3)

1. **Zustand** - Lightweight state management
2. **TanStack Query (React Query)** - Server state management
   - Data fetching
   - Caching
   - Synchronization
3. **React Hook Form** - Form state management
   - `@hookform/resolvers` - Schema validation integration

---

## Cloud Platforms & Hosting (3)

1. **Vercel** - Hosting and deployment
   - Edge network
   - Serverless functions
   - Automatic deployments
   - Environment variables
   - Hobby tier (free)

2. **Supabase** - Backend-as-a-Service
   - PostgreSQL database
   - Authentication
   - Storage
   - Real-time subscriptions
   - Auto-generated TypeScript types

3. **Upstash** - Serverless data platform
   - Redis for rate limiting
   - Edge-compatible
   - REST API

---

## Databases & Storage (3)

1. **PostgreSQL 15+** - Primary relational database (via Supabase)
   - ACID compliance
   - JSON support
   - Full-text search
   - Row-level security (RLS)

2. **Supabase Storage** - Object storage
   - PDF exports
   - Document uploads
   - Signed URLs

3. **Upstash Redis** - In-memory data store
   - Rate limiting
   - Session caching
   - Distributed locks

---

## AI Services & APIs (3)

1. **Azure OpenAI (GPT-4o)** - Conversational AI
   - Model: `gpt-4.1`
   - API Version: `2025-01-01-preview`
   - Endpoint: Azure Cognitive Services (East US 2)
   - Use case: Adaptive survey conversations
   - Cost: $2.50/1M input tokens, $10/1M output tokens

2. **Google Gemini** - Advanced AI model
   - Model: Latest Gemini model
   - Use case: AI-powered PDF reports
   - Cost: Variable based on model version

3. **OpenAI SDK** - AI integration library
   - Streaming responses
   - Token counting
   - Error handling

---

## Authentication & Security (5)

1. **Supabase Auth** - Authentication service
   - Email/password authentication
   - OAuth providers
   - JWT tokens
   - Session management

2. **Google OAuth** - Social login
   - `google-auth-library` - Google authentication
   - Client ID & Secret configuration

3. **JWT (jsonwebtoken)** - Token-based authentication
   - 24-hour expiry
   - Secure token generation
   - Middleware validation

4. **bcryptjs** - Password hashing
   - Salt rounds: 10
   - Secure password storage

5. **@upstash/ratelimit** - Rate limiting
   - 10 requests/minute (conversations)
   - 5 requests/15 minutes (auth)
   - 10 surveys/hour (creation)
   - Sliding window algorithm

---

## Payment Gateway (1)

1. **Razorpay** - Payment processing (Phase 2)
   - Indian payment gateway
   - Multiple payment methods
   - Webhook integration
   - Subscription management

---

## Analytics & Monitoring (1)

1. **PostHog** - Product analytics
   - Event tracking
   - Session recordings
   - Feature flags
   - Funnel analysis
   - Ad blocker bypass (API proxy)
   - 1M events/month (free tier)

---

## Email Service (1)

1. **Resend** - Transactional email
   - Email delivery
   - Template support
   - 100 emails/day (free tier)
   - Webhook events

---

## Validation & Type Safety (2)

1. **Zod** - Schema validation
   - Runtime type checking
   - API input validation
   - Form validation
   - Type inference

2. **TypeScript** - Static type checking
   - Strict mode enabled
   - No implicit any
   - Path aliases (@/)

---

## Document Processing (3)

1. **pdf-parse** - PDF text extraction
   - Parse uploaded PDFs
   - Extract text content
   - Context extraction

2. **mammoth** - Word document parsing
   - .docx file support
   - HTML conversion
   - Text extraction

3. **jsPDF** - PDF generation
   - Export insights to PDF
   - Custom formatting
   - Charts and tables

---

## Development Tools (8)

1. **TypeScript 5.x** - Type checking
   - Strict mode
   - Path mapping
   - Declaration files

2. **ESLint 9** - Code linting
   - Next.js config
   - Prettier integration
   - Custom rules

3. **Prettier 3.6** - Code formatting
   - Consistent style
   - Auto-formatting
   - Pre-commit hooks

4. **Autoprefixer** - CSS vendor prefixes
   - Browser compatibility
   - Automatic prefixing

5. **tsx** - TypeScript execution
   - Development scripts
   - Build tools

6. **Babel React Compiler** - React optimization
   - Automatic memoization
   - Performance improvements

7. **MCP (Model Context Protocol)** - Supabase integration
   - Database operations
   - Migration management
   - SQL execution

8. **Kiro AI** - AI-assisted development
   - Code generation
   - Bug fixing
   - Documentation

---

## HTTP & Networking (2)

1. **axios** - HTTP client
   - API requests
   - Interceptors
   - Error handling

2. **Next.js Fetch** - Native fetch API
   - Server-side requests
   - Caching strategies
   - Revalidation

---

## Utilities & Helpers (5)

1. **nanoid** - Unique ID generation
   - Short URLs
   - Session tokens
   - Secure random IDs

2. **clsx** - Conditional class names
   - Dynamic styling
   - Class merging

3. **dotenv** - Environment variables
   - Local development
   - Configuration management

4. **google-auth-library** - Google authentication
   - OAuth token validation
   - User info retrieval

5. **@fontsource/inter** - Web font
   - Inter font family
   - Self-hosted fonts

---

## External APIs & Integrations (7)

1. **Azure OpenAI API** - AI conversations
   - Endpoint: `https://ramee-mh6a1nnm-eastus2.cognitiveservices.azure.com/`
   - Deployment: `gpt-4.1`

2. **Google Gemini API** - AI reports
   - Model: `gemini-3-pro-preview`

3. **Supabase API** - Database & auth
   - REST API
   - Real-time subscriptions
   - Storage API

4. **Razorpay API** - Payments (Phase 2)
   - Order creation
   - Payment verification
   - Webhooks

5. **Resend API** - Email delivery
   - Send transactional emails
   - Email templates

6. **PostHog API** - Analytics
   - Event capture
   - Feature flags
   - Session recordings

7. **Google OAuth API** - Social login
   - User authentication
   - Profile information

---

## Internal APIs (20+ Endpoints)

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth callback

### Surveys
- `GET /api/surveys` - List surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/[id]` - Get survey details
- `PATCH /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey
- `POST /api/surveys/generate-title` - AI title generation

### Conversations
- `POST /api/surveys/[shortUrl]/start` - Start conversation
- `POST /api/conversations/[token]/message` - Send message
- `POST /api/conversations/[token]/pause` - Pause conversation
- `POST /api/conversations/[token]/complete` - Complete conversation

### Insights
- `GET /api/surveys/[id]/insights` - Get insights
- `GET /api/surveys/[id]/responses` - List responses
- `GET /api/surveys/[id]/responses/[conversationId]` - Get response details

### Documents
- `POST /api/documents/parse` - Parse uploaded documents

### Billing (Phase 2)
- `POST /api/billing/create-order` - Create payment order
- `POST /api/billing/verify-payment` - Verify payment

### Support
- `POST /api/support/contact` - Contact form submission

### Analytics
- `ALL /api/posthog/[...path]` - PostHog proxy (ad blocker bypass)

---

## Architecture Patterns

### Design Patterns
- **Server Components** - Default rendering strategy
- **Client Components** - Interactive UI elements
- **API Routes** - RESTful backend
- **Middleware** - Authentication & rate limiting
- **Route Groups** - Organized routing structure

### Security Patterns
- **JWT Authentication** - Token-based auth
- **Rate Limiting** - DDoS protection
- **Input Validation** - Zod schemas
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - React escaping
- **CSRF Protection** - SameSite cookies

### Performance Patterns
- **Edge Functions** - Low latency
- **Caching** - React Query + Redis
- **Code Splitting** - Dynamic imports
- **Image Optimization** - Next.js Image
- **Lazy Loading** - Component-level

---

## Development Workflow

### Version Control
- **Git** - Source control
- **GitHub** - Repository hosting

### CI/CD
- **Vercel** - Automatic deployments
- **GitHub Actions** - CI/CD pipelines (optional)

### Package Management
- **npm** - Dependency management
- **package-lock.json** - Lock file

---

## Cost Breakdown (Free Tier)

| Service | Plan | Monthly Cost | Limits |
|---------|------|--------------|--------|
| Vercel | Hobby | $0 | 100GB bandwidth |
| Supabase | Free | $0 | 500MB database, 1GB storage |
| Azure OpenAI | Credits | $0 | $200 credits (~2000 conversations) |
| Upstash Redis | Free | $0 | 10k commands/day |
| PostHog | Free | $0 | 1M events/month |
| Resend | Free | $0 | 100 emails/day |
| **Total** | | **$0/month** | For first 100 users |

---

## Technology Decisions

### Why Next.js?
- Full-stack framework (frontend + backend)
- Excellent TypeScript support
- Built-in API routes
- Edge-ready
- Vercel deployment optimization

### Why Supabase?
- PostgreSQL (production-grade database)
- Built-in authentication
- Real-time capabilities
- Auto-generated TypeScript types
- Generous free tier

### Why Azure OpenAI over OpenAI?
- Enterprise-grade reliability
- Better rate limits
- Regional deployment options
- $200 free credits

### Why Tailwind CSS?
- Utility-first approach
- Consistent design system
- Small bundle size
- Excellent DX

### Why Zustand over Redux?
- Minimal boilerplate
- TypeScript-first
- Small bundle size (1KB)
- Simple API

---

## Summary Statistics

- **Total Technologies**: 58
- **Languages**: 4
- **Frameworks**: 15
- **Cloud Services**: 3
- **Databases**: 3
- **AI Services**: 3
- **External APIs**: 7
- **Internal APIs**: 20+
- **Development Tools**: 8
- **UI Libraries**: 8

---

## Future Additions (Phase 2)

- **Sentry** - Error monitoring
- **Stripe** - Alternative payment gateway
- **SendGrid** - Email service alternative
- **Vercel Cron** - Scheduled jobs
- **Jest** - Testing framework
- **Playwright** - E2E testing

---

**Last Updated**: January 2025  
**Project Status**: Production-ready (95% complete)  
**Built with**: Kiro AI + Human collaboration
