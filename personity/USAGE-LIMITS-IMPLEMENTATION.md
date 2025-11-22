# Usage Limits Implementation

## Overview

Implemented usage limit enforcement to prevent API cost overruns by blocking users when they reach their monthly response limits.

## What Was Implemented

### 1. Usage Limit Check System (`src/lib/usage/limits.ts`)

Created a comprehensive usage checking system that:
- Checks user's current plan (FREE, STARTER, PRO, ENTERPRISE)
- Validates subscription status for paid plans
- Compares current usage against plan limits
- Returns detailed usage information

**Key Functions:**
- `checkUsageLimit(userId)` - Validates if user can create new responses
- `incrementUsage(userId)` - Increments the response counter (uses DB function)

### 2. Database Function

Created PostgreSQL function `increment_responses_used`:
- Safely increments `responsesUsedThisMonth` counter
- Uses `SECURITY DEFINER` for proper permissions
- Handles null values with `COALESCE`

### 3. API Endpoint Protection

Updated `/api/public/surveys/[shortUrl]/start/route.ts`:
- Checks usage limit BEFORE creating conversation session
- Returns 403 error with usage details if limit exceeded
- Prevents new conversations when user is over limit

**Error Response Format:**
```json
{
  "error": "You've reached your monthly limit of 50 responses. Upgrade to continue.",
  "usageLimit": {
    "currentUsage": 50,
    "limit": 50,
    "plan": "FREE"
  }
}
```

### 4. Usage Display in Billing Page

Added real-time usage display at top of billing page:
- Shows current usage vs limit
- Visual progress bar with color coding:
  - Blue: < 80% usage
  - Yellow: 80-99% usage
  - Red: 100% usage (limit reached)
- Warning messages at 80% and 100%
- Displays current plan name

## How It Works

### Flow for New Conversation:

1. User visits survey link (`/s/[shortUrl]`)
2. Frontend calls `/api/public/surveys/[shortUrl]/start`
3. API checks survey creator's usage limit
4. If limit exceeded → Return 403 error
5. If allowed → Create conversation session
6. When conversation completes → Increment usage counter

### Monthly Reset:

Usage counters are reset monthly (implementation in existing cron job or manual reset).

## Plan Limits

| Plan       | Monthly Responses |
|------------|-------------------|
| FREE       | 50                |
| STARTER    | 500               |
| PRO        | 2,000             |
| ENTERPRISE | 10,000            |

## Testing

To test the implementation:

1. **Check current usage:**
   - Go to `/billing` page
   - View usage display at top

2. **Test limit enforcement:**
   - Create conversations until limit reached
   - Try to start new conversation
   - Should receive 403 error with usage details

3. **Test upgrade flow:**
   - When limit reached, upgrade plan
   - Should be able to create new conversations

## Environment Variables

All Razorpay keys have been added to Vercel:
- `RAZORPAY_KEY_ID` (server-side)
- `RAZORPAY_KEY_SECRET` (server-side)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (client-side)

## Security Considerations

- Usage checks happen server-side (cannot be bypassed)
- Database function uses `SECURITY DEFINER` for proper permissions
- Subscription status validated for paid plans
- IP banning still in place for fraud prevention

## Next Steps

1. Add email notifications when users reach 80% and 100% of limit
2. Implement monthly usage reset cron job
3. Add usage analytics to admin dashboard
4. Consider grace period for users who just exceeded limit

## Files Modified

- `src/lib/usage/limits.ts` (created)
- `src/app/api/public/surveys/[shortUrl]/start/route.ts` (updated)
- `src/app/(dashboard)/billing/page.tsx` (updated)
- Database: Added `increment_responses_used` function

## Status

✅ Usage limit enforcement - COMPLETE
✅ Database function - COMPLETE
✅ API protection - COMPLETE
✅ Usage display - COMPLETE
✅ Razorpay keys deployed - COMPLETE
✅ TypeScript types regenerated - COMPLETE
✅ Build verification - COMPLETE

## Deployment Checklist

- [x] Razorpay keys added to Vercel (Production, Preview, Development)
- [x] Database function created (`increment_responses_used`)
- [x] TypeScript types regenerated
- [x] Build passes without errors
- [ ] Deploy to Vercel
- [ ] Test usage limit enforcement in production
- [ ] Monitor for any errors in Sentry/logs
