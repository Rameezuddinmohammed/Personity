# Supabase Auth Migration Plan

## Overview
Migrating from custom JWT authentication to Supabase Auth.

## Phase 1: Setup Supabase Auth (You need to do this)

### Step 1: Enable Auth in Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `byfftstfidplbwwhpcaj`
3. Go to **Authentication** > **Providers**
4. Enable **Email** provider (should already be enabled)
5. Enable **Google** provider:
   - Add your Google Client ID: `297187017928-mvb4l9qr8at98j6r9g4idt558bvfvsc6.apps.googleusercontent.com`
   - Add your Google Client Secret: `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`
   - Authorized redirect URL will be: `https://byfftstfidplbwwhpcaj.supabase.co/auth/v1/callback`

### Step 2: Configure Google Cloud Console
1. Go to Google Cloud Console
2. Add this redirect URI to your OAuth client:
   ```
   https://byfftstfidplbwwhpcaj.supabase.co/auth/v1/callback
   ```

### Step 3: Configure Site URL
1. In Supabase Dashboard > Authentication > URL Configuration
2. Set **Site URL**: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

## Phase 2: Code Migration (I'll do this)

### Files to Delete
- `src/lib/auth/jwt.ts`
- `src/lib/auth/password.ts`
- `src/lib/auth/google.ts`
- `src/lib/auth/middleware.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/google/callback/route.ts`

### Files to Create
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/app/auth/callback/route.ts` - OAuth callback handler

### Files to Update
- `src/app/(auth)/signup/page.tsx` - Use Supabase signup
- `src/app/(auth)/login/page.tsx` - Use Supabase login
- `src/middleware.ts` - Use Supabase session check
- `src/app/api/surveys/route.ts` - Use Supabase user
- All other API routes that check auth

### Database Changes
- Keep existing `User` table in Prisma
- Link to Supabase `auth.users` via `id` field
- User flow:
  1. User signs up via Supabase Auth
  2. Supabase creates user in `auth.users`
  3. We create corresponding record in `public.users` (Prisma)

## Phase 3: Testing
- Test email/password signup
- Test email/password login
- Test Google OAuth
- Test protected routes
- Test logout
- Test survey creation (needs auth)

## Rollback Plan
If something breaks:
1. Git revert to current commit
2. Restart dev server
3. JWT auth will work again

## Estimated Time
- Your setup: 10 minutes
- My migration: 30-45 minutes
- Testing: 15 minutes
- **Total: ~1 hour**

## Ready?
Once you complete Phase 1 (Supabase Dashboard setup), let me know and I'll start the code migration.
