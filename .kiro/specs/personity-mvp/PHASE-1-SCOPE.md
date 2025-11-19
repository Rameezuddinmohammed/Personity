# Personity MVP - Phase 1 Scope

## Overview

Phase 1 focuses on building the core conversational research platform without payment integration. This allows us to validate the core value proposition (70%+ completion rates, actionable insights) before adding billing complexity.

## ✅ Phase 1 - Core Features (Current)

### Authentication & User Management
- ✅ Email/password signup and login
- ✅ Google OAuth authentication
- ✅ JWT-based session management
- ✅ User profiles

### Survey Creation
- ✅ 5-step guided wizard
- ✅ AI-powered context detection
- ✅ Master prompt generation
- ✅ Test mode simulation
- ✅ Survey publishing with short URLs

### Conversation Experience
- ✅ AI-powered adaptive conversations (GPT-4o)
- ✅ Pause/resume capability
- ✅ Progress indicators
- ✅ Mobile-responsive interface
- ✅ Quality detection and fraud prevention
- ✅ Rate limiting

### Analysis & Insights
- ✅ Per-response analysis (summary, themes, sentiment, quotes)
- ✅ Aggregate analysis (patterns across responses)
- ✅ Insights dashboard
- ✅ Individual response viewing
- ✅ PDF/CSV export

### Infrastructure
- ✅ Next.js 14 with TypeScript
- ✅ PostgreSQL via Supabase
- ✅ Azure AI Foundry (GPT-4o) integration
- ✅ Email notifications (Resend)
- ✅ File storage (Supabase Storage)
- ✅ Error tracking (Sentry - optional)
- ✅ Vercel hosting

### Viral Growth
- ✅ "Powered by Personity" branding
- ✅ End-screen CTA for respondents

## ⏸️ Phase 2 - Billing & Monetization (Delayed)

### Payment Integration
- ⏸️ Instamojo integration
- ⏸️ Plan selection UI (Free, Starter, Pro, Business)
- ⏸️ Payment webhook handling
- ⏸️ Usage limit enforcement
- ⏸️ Subscription renewal reminders
- ⏸️ Upgrade prompts

### Why Delayed?
1. **Focus on Core Value**: Validate that AI conversations achieve 70%+ completion rates first
2. **Faster MVP**: Get to market quicker without payment complexity
3. **User Feedback**: Gather insights on pricing and features before implementing billing
4. **Technical Simplicity**: Reduce initial development complexity

## 🎯 Phase 1 Success Metrics

Before moving to Phase 2, we need to validate:
- ✅ 70%+ conversation completion rate
- ✅ Sub-5 minute survey creation time
- ✅ Sub-5 second AI response time (p95)
- ✅ Quality score 7+ for completed conversations
- ✅ Positive user feedback on insights quality

## 🚀 Phase 1 User Experience

### For Creators (Free Access)
- Unlimited surveys
- Unlimited responses
- Full analysis features
- PDF/CSV export
- No time limits
- No payment required

### For Respondents
- Same experience as planned
- "Powered by Personity" branding
- Viral CTA at end

## 📋 Phase 1 Environment Variables

**Required**:
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# AI (Azure AI Foundry)
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

# Auth
JWT_SECRET=...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=...
```

**Not Needed (Phase 2)**:
```bash
# INSTAMOJO_API_KEY=... (Phase 2)
# INSTAMOJO_AUTH_TOKEN=... (Phase 2)
# INSTAMOJO_SALT=... (Phase 2)
```

## 🔄 Transition to Phase 2

When ready to add billing:
1. Set up Instamojo account
2. Implement payment service (`lib/instamojo.ts`)
3. Add billing UI and webhook handler
4. Implement usage limits
5. Migrate existing users to appropriate plans
6. Enable payment features

## 💰 Phase 1 Costs

**Monthly Infrastructure** (no revenue):
- Azure AI Foundry: ~$70 (1000 conversations with GPT-4o)
- Supabase: $25 (Pro plan - database + storage)
- Vercel: $20 (Pro plan)
- Resend: $20 (Pro plan)

**Total**: ~$135/month

This is acceptable for MVP validation phase (4-8 weeks).

## 📝 Database Schema Changes

The database schema remains the same, but these fields won't be used in Phase 1:
- `User.paymentProviderId` - NULL for all users
- `User.paymentLinkId` - NULL for all users
- `User.plan` - Always 'FREE' in Phase 1
- `User.responsesUsedThisMonth` - Not enforced in Phase 1
- `User.subscriptionStatus` - Always 'ACTIVE' in Phase 1

## ✅ Phase 1 Checklist

Before starting development:
- [x] Instamojo marked as delayed in all docs
- [x] Setup checklist updated
- [x] Tasks marked as optional/delayed
- [x] Steering rules updated
- [x] Phase 1 scope documented

Ready to build! 🚀
