Check if the accomplished task does not have any bugs, works well with all the previous tasks and the whole codebase is in its intended state for that task.---
inclusion: always
---
---
inclusion: always
---

# Development Behavior Guidelines

## Code Quality Standards

- **Type Safety First**: Use TypeScript strictly - no `any` types without explicit justification
- **Validation**: All API inputs must be validated with Zod schemas before processing
- **Error Handling**: Use try-catch blocks in API routes, return structured error responses with appropriate HTTP status codes
- **Async/Await**: Prefer async/await over promise chains for readability

## Security Practices

- **Authentication**: All dashboard routes require JWT validation via middleware
- **Input Sanitization**: Validate and sanitize all user inputs, especially in AI prompts
- **Environment Variables**: Never hardcode secrets - use environment variables exclusively
- **Rate Limiting**: Apply rate limits to public endpoints (conversation API, auth endpoints)
- **SQL Injection**: Use Supabase's parameterized queries - never concatenate SQL strings

## API Route Conventions

- Return consistent JSON structure: `{ success: boolean, data?: any, error?: string }`
- Use appropriate HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (unauthorized), 404 (not found), 500 (server error)
- Handle Supabase errors gracefully - check error responses from database operations
- Log errors with context but never expose internal details to clients

## Component Development

- **Server vs Client**: Default to Server Components unless interactivity is needed
- **Client Components**: Mark with `'use client'` only when using hooks, event handlers, or browser APIs
- **Props**: Define explicit TypeScript interfaces for all component props
- **Accessibility**: Include ARIA labels, keyboard navigation, and focus management
- **Styling**: Use Tailwind utility classes - avoid inline styles or CSS modules

## Database Operations

- **Transactions**: Use Supabase RPC functions for multi-step operations that must succeed/fail together
- **Migrations**: Create migrations via Supabase Dashboard or MCP tools
- **Queries**: Select only needed fields to minimize data transfer
- **Relations**: Use Supabase's foreign key relationships and joins for efficient data loading
- **Type Safety**: Always use the generated TypeScript types from `src/types/supabase.ts`

## AI Integration

- **Token Management**: Track token usage per conversation, trigger summarization at 100k tokens
- **Error Recovery**: Implement retry logic (max 3 attempts) for AI API failures
- **Prompt Engineering**: Keep system prompts concise, use user context from master prompt
- **Cost Tracking**: Log all AI API calls with token counts to `ApiUsage` table

## Testing Approach

- Test API routes manually via Postman/Thunder Client before integration
- Validate form inputs with realistic edge cases (empty strings, special characters, SQL injection attempts)
- Test authentication flows end-to-end (signup → login → protected route access)
- Verify AI responses with various conversation scenarios

## Performance Optimization

- Use Next.js Image component for all images
- Implement loading states for async operations
- Debounce user inputs in forms (300ms)
- Cache static data with appropriate revalidation periods
- Lazy load heavy components (PDF export, charts)

## Git Workflow

- Commit messages: Use conventional commits format (`feat:`, `fix:`, `refactor:`, `docs:`)
- Branch naming: `feature/description`, `fix/description`, `refactor/description`
- Small, focused commits over large monolithic changes
- Never commit `.env.local` or sensitive credentials

## Common Pitfalls to Avoid

- ❌ Using client-side state for sensitive data (tokens, API keys)
- ❌ Exposing database IDs in public URLs (use shortUrl instead)
- ❌ Forgetting to regenerate TypeScript types after schema changes
- ❌ Missing error boundaries in client components
- ❌ Hardcoding URLs instead of using `NEXT_PUBLIC_APP_URL`
- ❌ Ignoring TypeScript errors - fix them, don't suppress them
- ❌ Using service role key on client side - only use anon key

## Development Workflow

1. **Schema Changes**: Create migration via Supabase Dashboard or MCP → Regenerate types with MCP tool → Update `src/types/supabase.ts`
2. **New API Route**: Create route file → Define Zod schema → Implement handler → Test with curl/Postman
3. **New Component**: Create component file → Define props interface → Implement with Tailwind → Test in browser
4. **Environment Variables**: Add to `.env.local` → Add to `.env.example` → Document in tech.md

## When in Doubt

- Check existing patterns in the codebase before introducing new approaches
- Refer to Next.js 14 App Router documentation for routing questions
- Consult Supabase docs for complex query patterns
- Review shadcn/ui source for component customization examples