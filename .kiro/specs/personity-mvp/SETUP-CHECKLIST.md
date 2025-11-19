# Personity MVP - Complete Setup Checklist

This document lists everything you need to gather before we start building. Check off each item as you complete it.

---

## 🔑 API Keys & Service Accounts

### 1. Azure AI Foundry (REQUIRED - Core AI)
**What it's for**: Powers all AI conversations and analysis using GPT-4o

**Steps to get it**:
1. Go to https://ai.azure.com
2. Sign in with Microsoft account (or create one)
3. Create a new project or select existing
4. Go to "Deployments" → "Create new deployment"
5. Select model: `gpt-4o` (or `gpt-4o-mini` for testing)
6. Name your deployment (e.g., `personity-gpt4o`)
7. Go to project settings → "Keys and Endpoint"
8. Copy:
   - API Key
   - Endpoint URL (e.g., `https://your-resource.openai.azure.com/`)
   - Deployment name

**What to save**:
```
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=personity-gpt4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Cost estimate**: ~$0.07 per conversation (15 exchanges)
- Input: $2.50/1M tokens
- Output: $10.00/1M tokens

**Note**: Azure AI Foundry provides the same OpenAI models with enterprise security and compliance

---

### 2. Supabase (REQUIRED - Database & File Storage)
**What it's for**: PostgreSQL database hosting + file storage for PDF exports

**Steps to get it**:
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Click "New Project"
4. Choose organization (create one if needed)
5. Project name: `personity-mvp`
6. Database password: Generate a strong one (save it!)
7. Region: Choose closest to your users (e.g., Mumbai for India)
8. Click "Create new project" (takes ~2 minutes)
9. Once ready, go to Settings → Database
10. Copy the "Connection string" (URI format)
11. Replace `[YOUR-PASSWORD]` with your database password
12. Go to Settings → API
13. Copy the "anon" key (public) and "service_role" key
14. Go to Storage → Create bucket → Name: `exports` → Public: OFF
15. Set up RLS policies for the exports bucket (we'll do this in code)

**What to save**:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ... (public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (private key, for MCP server)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Cost**: Free tier (500MB database, 1GB storage, 2GB bandwidth) or Pro ($25/month)

---

### 3. Instamojo (⏸️ DELAYED - Payments)
**What it's for**: Payment processing for Indian customers

**Status**: ⏸️ **DELAYED - Will implement in Phase 2**

Payment integration is postponed to focus on core conversation and analysis features first. The app will work without billing for initial development and testing.

~~**Steps to get it**:~~
~~1. Go to https://www.instamojo.com~~
~~2. Sign up with email~~
~~3. Complete KYC verification (PAN, bank details)~~
~~4. Go to Settings → API & Plugins~~
~~5. Click "Generate Credentials"~~
~~6. Copy API Key, Auth Token, and Salt~~

**What to save** (when implementing):
```
# INSTAMOJO_API_KEY=... (delayed)
# INSTAMOJO_AUTH_TOKEN=... (delayed)
# INSTAMOJO_SALT=... (delayed)
```

**Cost**: 2% + ₹3 per transaction (when implemented)

---

### 4. Resend (REQUIRED - Email)
**What it's for**: Sending transactional emails (welcome, notifications, etc.)

**Steps to get it**:
1. Go to https://resend.com
2. Sign up with email or GitHub
3. Verify your email
4. Go to API Keys
5. Click "Create API Key"
6. Name it "Personity MVP"
7. Copy the key (starts with `re_`)

**Domain setup (optional for MVP)**:
- For testing: Use `onboarding@resend.dev` (no setup needed)
- For production: Add your domain and verify DNS records

**What to save**:
```
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@personity.com
```
(Use `onboarding@resend.dev` for testing)

**Cost**: Free tier (100 emails/day) or Pro ($20/month for 50k emails)

---

### 5. Vercel (REQUIRED - Hosting)
**What it's for**: Hosting the Next.js application

**Steps to get it**:
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Install Vercel CLI: `npm install -g vercel`
4. Run `vercel login` in terminal
5. Go to Account Settings → Tokens
6. Create token for CI/CD (if using GitHub Actions)

**What to save**:
```
VERCEL_TOKEN=... (for CI/CD)
VERCEL_ORG_ID=... (from project settings)
VERCEL_PROJECT_ID=... (from project settings)
```

**Cost**: Free tier (100GB bandwidth) or Pro ($20/month)

---

### 6. Sentry (OPTIONAL - Error Tracking)
**What it's for**: Monitoring errors in production

**Status**: ⏸️ **OPTIONAL - Can add later**

**Steps to get it** (when needed):
1. Go to https://sentry.io
2. Sign up with email or GitHub
3. Create new project → Next.js
4. Copy the DSN

**What to save** (when implementing):
```
# SENTRY_DSN=https://...@sentry.io/... (optional)
# NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/... (optional)
```

**Cost**: Free tier (5k errors/month) or Team ($29/month)

---

## 🔐 Security Keys to Generate

### 7. JWT Secret (REQUIRED)
**What it's for**: Signing authentication tokens

**How to generate**:
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**What to save**:
```
JWT_SECRET=<generated-random-string>
```

---

---

## 🔧 MCP Server Setup

### 8. Install UV (Python Package Manager)
**What it's for**: Running MCP servers

**Steps**:
```bash
# Windows (PowerShell):
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Mac/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Verify installation**:
```bash
uv --version
uvx --version
```

---

### 9. Configure Supabase MCP Server
**What it's for**: Direct database access during development

**Already configured in**: `.kiro/settings/mcp.json`

**You need to add**:
1. Your `SUPABASE_URL` (from step 2)
2. Your `SUPABASE_SERVICE_ROLE_KEY` (from step 2)

**Edit**: `.kiro/settings/mcp.json` and replace placeholders

---

## 📋 Environment Variables File

Once you have everything, create `.env.local` in your project root:

```bash
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres"

# Supabase (for file storage)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Provider (from Azure AI Foundry)
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=personity-gpt4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Authentication (generate with openssl)
JWT_SECRET=<your-generated-secret>
JWT_EXPIRY=24h

# Payments (⏸️ DELAYED - Instamojo)
# INSTAMOJO_API_KEY=... (Phase 2)
# INSTAMOJO_AUTH_TOKEN=... (Phase 2)
# INSTAMOJO_SALT=... (Phase 2)
# INSTAMOJO_WEBHOOK_SECRET=... (Phase 2)
# NEXT_PUBLIC_INSTAMOJO_ENABLED=false

# Email (from Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev

# Monitoring (Optional - can add later)
# SENTRY_DSN=https://... (optional)
# NEXT_PUBLIC_SENTRY_DSN=https://... (optional)

# Cost Monitoring
DAILY_COST_ALERT_USD=500
SLACK_WEBHOOK_URL=https://hooks.slack.com/... (optional)
```

---

## ✅ Pre-Build Checklist

Before we start coding, verify:

- [ ] Azure AI Foundry deployment created and credentials obtained
- [ ] Supabase project created (database + storage bucket)
- [ ] Supabase connection string and API keys copied
- [ ] ~~Instamojo account created~~ (⏸️ Delayed to Phase 2)
- [ ] Resend API key obtained
- [ ] Vercel account created
- [ ] JWT secret generated
- [ ] UV/UVX installed and working
- [ ] `.env.local` file created with all variables
- [ ] MCP server configured in `.kiro/settings/mcp.json`

---

## 🚀 Quick Start Commands

Once everything is set up:

```bash
# 1. Initialize the project
npx create-next-app@latest personity --typescript --tailwind --app --src-dir

# 2. Navigate to project
cd personity

# 3. Install dependencies
npm install @prisma/client prisma @tanstack/react-query zustand zod react-hook-form @hookform/resolvers bcryptjs jsonwebtoken @azure/openai @supabase/supabase-js resend axios

# 4. Install UI dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast

# 5. Install dev dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken @types/node typescript eslint prettier eslint-config-prettier

# 6. Initialize Prisma
npx prisma init

# 7. Copy your .env.local file to the project root

# 8. Start development
npm run dev
```

---

## 💰 Cost Summary (Monthly)

**Required Services (Phase 1)**:
- Azure AI Foundry: ~$70 (1000 conversations with GPT-4o)
- Supabase: $25 (Pro plan - database + storage)
- Vercel: $20 (Pro plan)
- Resend: $20 (Pro plan)

**Total Infrastructure**: ~$135/month

**Delayed (Phase 2)**:
- Instamojo: 2% per transaction (when implemented)

**Optional (can add later)**:
- Sentry: $29/month (error tracking)

**Total with Optional**: ~$164/month

---

## 🆘 Troubleshooting

### Can't install UV?
- Windows: Make sure PowerShell execution policy allows scripts
- Mac/Linux: You may need `sudo` permissions

### Supabase connection fails?
- Check if you replaced `[YOUR-PASSWORD]` in the connection string
- Verify your IP is not blocked (Supabase → Settings → Database → Connection pooling)

### Azure AI Foundry errors?
- Verify deployment is created and active
- Check endpoint URL format (should end with `.openai.azure.com/`)
- Ensure deployment name matches your configuration
- Verify API version is correct (2024-02-15-preview)

### Instamojo not working?
- Make sure you're using test mode credentials for development
- Verify KYC is complete for live mode

---

## 📞 Need Help?

If you get stuck on any step:
1. Check the service's documentation
2. Ask me specific questions about the setup
3. Share error messages for troubleshooting

---

**Ready to build?** Once you've checked off all items, let me know and we'll start with Task 1.1!
