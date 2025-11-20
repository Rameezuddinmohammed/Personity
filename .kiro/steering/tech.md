# Technical Stack

## Core Technologies

- **Framework**: Next.js 14 (App Router) with TypeScript 5.x
- **Styling**: Tailwind CSS 3.x with shadcn/ui components
- **Database**: PostgreSQL 15+ via Supabase (with TypeScript types)
- **AI Provider**: Azure AI Foundry (GPT-4o via Azure OpenAI SDK) + Google Gemini 3 Pro (for AI-powered PDF reports)
- **Hosting**: Vercel (Hobby/Free tier)
- **Node**: 20.x LTS

## Key Libraries

- **State Management**: Zustand (client), React Query (TanStack Query) for data fetching
- **Validation**: Zod with react-hook-form
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **UI Components**: Radix UI primitives, lucide-react icons
- **Email**: Resend
- **Payments**: ⏸️ Instamojo (delayed to Phase 2)
- **Monitoring**: Sentry (error tracking - optional)

## Database Provider

- **Supabase** - PostgreSQL database with built-in auth, storage, and realtime features
- Direct SQL access via Supabase client
- TypeScript types auto-generated from schema

## File Storage

- Supabase Storage for PDF exports

## Common Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build              # Build for production
npm run start              # Start production server

# Database (Supabase)
# Migrations are managed via Supabase Dashboard or MCP tools
# TypeScript types are auto-generated from schema

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript type checking
npm test                   # Run tests

# Deployment
vercel                     # Deploy to Vercel preview
vercel --prod              # Deploy to production
```

## Environment Variables

Required in `.env.local`:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase (database + auth + storage)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase client configuration
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME` - Azure AI Foundry (conversations)
- `GEMINI_API_KEY` - Google Gemini 3 Pro (AI-powered PDF reports)
- ~~`INSTAMOJO_API_KEY`, `INSTAMOJO_AUTH_TOKEN`, `INSTAMOJO_SALT`~~ - Payment provider (⏸️ Phase 2)
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_APP_URL` - Application URL

## AI Configuration

### Azure OpenAI (Conversations)
- Model: `gpt-4o`
- Temperature: `0.7`
- Max tokens: `200` (responses), `150` (analysis)
- Token limit: `100,000` (triggers history summarization)
- Cost tracking: $2.50/1M input tokens, $10.00/1M output tokens

### Google Gemini 3 Pro (PDF Reports)
- Model: `gemini-3-pro-preview`
- Thinking level: `high` (deep reasoning)
- Temperature: `1.0` (Gemini 3 optimized default)
- Max tokens: `8000` (comprehensive reports)
- Cost: $2-4/1M input, $12-18/1M output (~$0.10-0.30 per report)

## Performance Targets

- Landing page: <2s load (p95)
- Dashboard: <3s load (p95)
- AI responses: <5s (p95)
- PDF export: <15s
- Database queries: <500ms (p95)
