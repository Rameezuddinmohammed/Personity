# Technical Stack

## Core Technologies

- **Framework**: Next.js 14 (App Router) with TypeScript 5.x
- **Styling**: Tailwind CSS 3.x with shadcn/ui components
- **Database**: PostgreSQL 15+ via Prisma ORM 5.x
- **AI Provider**: Azure AI Foundry (GPT-4o via Azure OpenAI SDK)
- **Hosting**: Vercel (Pro plan)
- **Node**: 20.x LTS

## Key Libraries

- **State Management**: Zustand (client), React Query (TanStack Query) for data fetching
- **Validation**: Zod with react-hook-form
- **Authentication**: bcryptjs, jsonwebtoken (JWT with 24h expiry)
- **UI Components**: Radix UI primitives, lucide-react icons
- **Email**: Resend
- **Payments**: ⏸️ Instamojo (delayed to Phase 2)
- **Monitoring**: Sentry (error tracking - optional)

## Database Provider Options

- Supabase (Pro plan) - recommended
- PlanetScale - alternative

## File Storage

- Supabase Storage for PDF exports

## Common Commands

```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build              # Build for production
npm run start              # Start production server

# Database
npx prisma migrate dev     # Create and apply migration
npx prisma generate        # Generate Prisma Client
npx prisma studio          # Open database GUI

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
- `DATABASE_URL` - PostgreSQL connection string
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT_NAME` - Azure AI Foundry
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase (database + storage)
- `JWT_SECRET` - JWT signing secret
- ~~`INSTAMOJO_API_KEY`, `INSTAMOJO_AUTH_TOKEN`, `INSTAMOJO_SALT`~~ - Payment provider (⏸️ Phase 2)
- `RESEND_API_KEY` - Email service
- `NEXT_PUBLIC_APP_URL` - Application URL

## AI Configuration

- Model: `gpt-4o`
- Temperature: `0.7`
- Max tokens: `200` (responses), `150` (analysis)
- Token limit: `100,000` (triggers history summarization)
- Cost tracking: $2.50/1M input tokens, $10.00/1M output tokens

## Performance Targets

- Landing page: <2s load (p95)
- Dashboard: <3s load (p95)
- AI responses: <5s (p95)
- PDF export: <15s
- Database queries: <500ms (p95)
