# Authentication Implementation Guide

**Current System:** Supabase Auth  
**Last Updated:** After migration from custom JWT

## Overview

Personity uses **Supabase Auth** for authentication, providing email/password and Google OAuth capabilities with built-in session management, email verification, and password reset functionality.

## Architecture

### Authentication Flow

```
User Action → Supabase Auth → Session Created → Our Database Sync
```

**Supabase manages:**
- Password hashing
- Session tokens
- Token refresh
- OAuth flows
- Email verification
- Password reset

**We manage:**
- User application data (plan, usage, etc.)
- Syncing Supabase users to our database
- Business logic

## Components

### 1. Supabase Clients

**Browser Client** (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server Client** (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Handle cookie setting
        },
      },
    }
  );
}
```

### 2. Middleware Protection

**File:** `src/middleware.ts`

```typescript
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

**Protected Routes:**
- `/dashboard/*`
- `/surveys/*`
- `/billing/*`

**Behavior:**
- Checks Supabase session
- Refreshes expired tokens automatically
- Redirects to `/login` if unauthorized
- Preserves redirect URL for post-login navigation

### 3. Authentication Pages

**Signup** (`src/app/(auth)/signup/page.tsx`)
```typescript
const supabase = createClient();

const { data, error } = await supabase.auth.signUp({
  email: data.email,
  password: data.password,
  options: {
    data: { name: data.name },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**Login** (`src/app/(auth)/login/page.tsx`)
```typescript
const supabase = createClient();

const { error } = await supabase.auth.signInWithPassword({
  email: data.email,
  password: data.password,
});
```

**Google OAuth**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

### 4. OAuth Callback Handler

**File:** `src/app/auth/callback/route.ts`

Handles OAuth redirects from Supabase:
1. Exchanges code for session
2. Creates user in our database if new
3. Redirects to dashboard

### 5. API Authentication

**Example:** `src/app/api/surveys/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Use user.id for database operations
  const survey = await prisma.survey.create({
    data: {
      userId: user.id,
      // ...
    },
  });
}
```

## Database Structure

### Supabase Auth Tables (Managed by Supabase)

**`auth.users`**
- `id` (UUID) - Primary key
- `email` - User email
- `encrypted_password` - Hashed password
- `email_confirmed_at` - Email verification timestamp
- `created_at` - Account creation
- OAuth provider data

### Application Tables (Managed by Prisma)

**`public.users`**
```prisma
model User {
  id                      String   @id @default(uuid())
  email                   String   @unique
  name                    String
  passwordHash            String   // Empty for OAuth users
  plan                    Plan     @default(FREE)
  responsesUsedThisMonth  Int      @default(0)
  subscriptionStatus      SubscriptionStatus @default(ACTIVE)
  subscriptionRenewsAt    DateTime?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  surveys                 Survey[]
}
```

**Link:** `id` field links to `auth.users.id`

## User Flow

### Email/Password Signup
1. User submits signup form
2. Supabase creates user in `auth.users`
3. Our API creates record in `public.users`
4. User is logged in automatically
5. Redirect to dashboard

### Email/Password Login
1. User submits login form
2. Supabase verifies credentials
3. Session created and stored in cookies
4. Redirect to dashboard

### Google OAuth
1. User clicks "Continue with Google"
2. Redirects to Google consent screen
3. Google redirects to Supabase
4. Supabase redirects to `/auth/callback`
5. Callback creates user in database if new
6. Redirect to dashboard

### Logout
```typescript
const supabase = createClient();
await supabase.auth.signOut();
router.push('/login');
```

## Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://byfftstfidplbwwhpcaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://...
```

**Supabase Dashboard Configuration:**
- Email provider: Enabled
- Google OAuth provider: Enabled with credentials
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## Security Features

✅ **Supabase-Managed Security**
- Industry-standard password hashing
- Secure session tokens
- Automatic token refresh
- CSRF protection
- XSS protection

✅ **Input Validation**
- Zod schemas for all inputs
- Email format validation
- Password strength requirements

✅ **Session Management**
- Automatic refresh before expiry
- Secure cookie storage
- Server-side session validation

## Testing

### Manual Testing

**Signup:**
```
1. http://localhost:3000/signup
2. Enter name, email, password
3. Click "Create account"
4. Should redirect to /dashboard
```

**Login:**
```
1. http://localhost:3000/login
2. Enter email, password
3. Click "Sign in"
4. Should redirect to /dashboard
```

**Google OAuth:**
```
1. http://localhost:3000/login
2. Click "Continue with Google"
3. Authorize
4. Should redirect to /dashboard
```

**Protected Routes:**
```
1. Incognito: http://localhost:3000/dashboard
2. Should redirect to /login
3. After login, should access dashboard
```

## Built-in Features (Available)

### Email Verification
Supabase can send verification emails automatically. Enable in Supabase Dashboard > Authentication > Email Templates.

### Password Reset
```typescript
// Request reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
});

// Update password
await supabase.auth.updateUser({
  password: newPassword,
});
```

### Update User Metadata
```typescript
await supabase.auth.updateUser({
  data: { name: 'New Name' },
});
```

## Common Operations

### Get Current User (Client)
```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Get Current User (Server)
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Check Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

## Migration Notes

**Removed from old system:**
- Custom JWT generation/verification
- bcrypt password hashing
- Custom Google OAuth integration
- Custom session management
- HTTP-only cookie management
- ~500 lines of auth code

**Benefits of Supabase Auth:**
- Less code to maintain
- Built-in email verification
- Built-in password reset
- Automatic session refresh
- Better security (battle-tested)
- Easier OAuth setup
- No Google Cloud Console issues

## Troubleshooting

### Issue: "User not found in database"
**Cause:** User exists in Supabase but not in Prisma database  
**Solution:** Check `/api/users/create` endpoint is being called

### Issue: "Unauthorized" on API routes
**Cause:** Session not being passed correctly  
**Solution:** Ensure middleware is configured correctly

### Issue: Google OAuth not working
**Cause:** Redirect URI not configured in Supabase  
**Solution:** Add redirect URI in Supabase Dashboard

### Issue: Session expires immediately
**Cause:** Cookie settings incorrect  
**Solution:** Check Supabase client configuration

## Best Practices

1. **Always use server client for API routes** - Never use browser client in API routes
2. **Check user existence** - Always verify user exists in your database
3. **Handle errors gracefully** - Supabase errors are user-friendly
4. **Use TypeScript** - Supabase has excellent TypeScript support
5. **Test auth flows** - Regularly test signup, login, OAuth
6. **Monitor sessions** - Check Supabase Dashboard for active sessions

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Integration](https://supabase.com/docs/guides/auth/server-side/nextjs)

## Conclusion

The authentication system is production-ready with Supabase Auth providing robust, secure, and feature-rich authentication with minimal code maintenance.
