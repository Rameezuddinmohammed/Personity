# Personity MVP - Final Tech Stack Summary

## ✅ Confirmed Services (Phase 1)

### 1. Azure AI Foundry (AI Provider)
- **What**: GPT-4o via Azure OpenAI SDK
- **Why**: Enterprise-grade AI with same OpenAI models
- **Cost**: ~$70/month (1000 conversations)
- **Setup**: Create deployment at https://ai.azure.com

### 2. Supabase (Database + Storage)
- **What**: PostgreSQL database + file storage
- **Why**: All-in-one solution, no need for separate AWS S3
- **Cost**: $25/month (Pro plan)
- **Setup**: Create project at https://supabase.com

### 3. Resend (Email)
- **What**: Transactional email service
- **Why**: Simple API, good deliverability
- **Cost**: $20/month (Pro plan)
- **Setup**: Get API key at https://resend.com

### 4. Vercel (Hosting)
- **What**: Next.js hosting platform
- **Why**: Seamless Next.js deployment
- **Cost**: $20/month (Pro plan)
- **Setup**: Connect GitHub at https://vercel.com

### 5. Sentry (Error Tracking) - OPTIONAL
- **What**: Error monitoring and tracking
- **Why**: Catch production issues early
- **Cost**: Free tier or $29/month
- **Setup**: Create project at https://sentry.io

**Total Monthly Cost**: ~$135/month (required services only)

---

## ⏸️ Delayed to Phase 2

### Instamojo (Payments)
- Postponed to focus on core features first
- Will implement after validating 70%+ completion rates

### Mixpanel (Analytics)
- Removed from MVP scope
- Can add later if needed for detailed analytics

---

## 🔑 Required Environment Variables

```bash
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres

# Azure AI Foundry
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

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev

# Monitoring (Optional)
# SENTRY_DSN=https://... (optional)
# NEXT_PUBLIC_SENTRY_DSN=https://... (optional)

# Cost Monitoring
DAILY_COST_ALERT_USD=500
```

---

## 📦 NPM Dependencies

### Core Dependencies
```bash
npm install @prisma/client prisma
npm install @tanstack/react-query zustand
npm install zod react-hook-form @hookform/resolvers
npm install bcryptjs jsonwebtoken
npm install @azure/openai
npm install @supabase/supabase-js
npm install resend
npm install axios
```

### UI Dependencies
```bash
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-toast
```

### Dev Dependencies
```bash
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/node typescript
npm install -D eslint prettier eslint-config-prettier
```

---

## 🎯 Key Changes from Original Plan

### ✅ Simplified
1. **Azure AI Foundry** instead of OpenAI directly
   - Same models, enterprise features
   - Better for production deployments

2. **Supabase Storage** instead of AWS S3
   - One less service to manage
   - Integrated with existing Supabase setup
   - Simpler authentication

3. **No Analytics** (Mixpanel removed)
   - Focus on core features first
   - Can add later if needed

4. **Sentry Optional**
   - Can start without it
   - Add when moving to production

### ⏸️ Delayed
1. **Instamojo** (all payment features)
   - Focus on validating core value first
   - Add billing after proving 70%+ completion rates

---

## 🚀 Setup Order

1. **Azure AI Foundry** - Create GPT-4o deployment
2. **Supabase** - Create project, database, and storage bucket
3. **Resend** - Get API key
4. **Vercel** - Connect GitHub repo
5. **Generate JWT Secret** - Use openssl
6. **Create .env.local** - Add all variables
7. **Install Dependencies** - Run npm install commands
8. **Initialize Prisma** - Set up database schema

---

## 📊 Cost Breakdown

| Service | Monthly Cost | Purpose |
|---------|-------------|---------|
| Azure AI Foundry | ~$70 | AI conversations (1000/month) |
| Supabase Pro | $25 | Database + file storage |
| Vercel Pro | $20 | Hosting |
| Resend Pro | $20 | Email delivery |
| **Total** | **~$135** | **Phase 1 infrastructure** |

**Optional**:
- Sentry: $29/month (error tracking)

**Phase 2** (when adding billing):
- Instamojo: 2% per transaction

---

## ✅ Ready to Build Checklist

- [ ] Azure AI Foundry deployment created
- [ ] Supabase project created (database + storage bucket)
- [ ] Resend API key obtained
- [ ] Vercel account connected
- [ ] JWT secret generated
- [ ] UV/UVX installed (for MCP server)
- [ ] `.env.local` file created with all variables
- [ ] All npm dependencies installed
- [ ] Prisma initialized

**Once complete, you're ready to start Task 1.1!** 🚀
