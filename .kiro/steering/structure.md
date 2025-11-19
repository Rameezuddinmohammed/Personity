# Project Structure

## Directory Organization

```
personity/
├── .kiro/                      # Kiro configuration
│   ├── settings/
│   │   └── mcp.json           # MCP server config (Supabase)
│   └── specs/                 # Project specifications
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth route group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── surveys/
│   │   │   └── billing/
│   │   ├── (public)/         # Public routes
│   │   │   └── s/[shortUrl]/ # Survey conversation page
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── surveys/      # Survey CRUD
│   │   │   ├── conversations/ # Conversation handling
│   │   │   └── instamojo/    # Payment webhooks (⏸️ Phase 2)
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── auth/             # Auth-related components
│   │   ├── survey/           # Survey creation wizard
│   │   └── conversation/     # Conversation UI
│   ├── lib/
│   │   ├── ai/               # AI provider integration
│   │   │   ├── openai.ts
│   │   │   └── provider.ts
│   │   ├── auth/             # Auth utilities (JWT, bcrypt)
│   │   ├── db/               # Prisma client
│   │   ├── email/            # Email service (Resend)
│   │   └── utils/            # Shared utilities
│   ├── types/                # TypeScript type definitions
│   └── middleware.ts         # Auth & rate limiting middleware
├── .env.local                # Environment variables (not committed)
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Key Architectural Patterns

### Route Groups
- `(auth)` - Unauthenticated pages (login, signup)
- `(dashboard)` - Protected creator pages (requires JWT)
- `(public)` - Public pages (landing, survey conversations)

### API Route Structure
- `/api/auth/*` - Authentication (signup, login, OAuth)
- `/api/surveys` - Survey CRUD operations
- `/api/surveys/[shortUrl]/start` - Start conversation session
- `/api/conversations/[token]/message` - Handle respondent messages
- `/api/conversations/[token]/pause` - Pause conversation
- `/api/conversations/[token]/complete` - Complete conversation
- `/api/instamojo/webhook` - Payment webhook handler (⏸️ Phase 2)

### Database Models (Prisma)
- `User` - User accounts with subscription info
- `Survey` - Survey configurations with master prompts
- `ConversationSession` - Active/paused conversation sessions
- `Conversation` - Message history and token usage
- `ResponseAnalysis` - Per-response insights (summary, themes, sentiment, quotes)
- `AggregateAnalysis` - Multi-response patterns
- `ApiUsage` - Cost tracking per session
- `BannedIp` - Fraud prevention

## Code Organization Principles

- **Separation of Concerns**: API routes handle business logic, components handle UI
- **Type Safety**: Zod schemas for validation, TypeScript interfaces for data models
- **Reusability**: Shared utilities in `lib/`, reusable components in `components/ui/`
- **Security**: Middleware for auth/rate limiting, input validation on all endpoints
- **Error Handling**: Custom error classes, global error handler for API routes

## Naming Conventions

- **Files**: kebab-case (`survey-wizard.tsx`)
- **Components**: PascalCase (`SurveyWizard`)
- **Functions**: camelCase (`generateAIResponse`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TOKENS`)
- **Types/Interfaces**: PascalCase (`ConversationSession`)
- **API Routes**: RESTful naming (`/api/surveys/[id]`)

## Import Order

1. External dependencies (React, Next.js, etc.)
2. Internal absolute imports (`@/components`, `@/lib`)
3. Relative imports (`./`, `../`)
4. Type imports (last)
