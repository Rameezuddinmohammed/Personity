# Database Setup - Supabase

## Overview

Personity uses **Supabase** for database, authentication, and storage. All database operations use the Supabase client with TypeScript types.

## Database Structure

### Tables Created

1. **User** - User accounts and subscription info
2. **Survey** - Survey configurations
3. **ConversationSession** - Active conversation sessions
4. **Conversation** - Message history
5. **ResponseAnalysis** - Per-response insights
6. **AggregateAnalysis** - Multi-response patterns
7. **ApiUsage** - Cost tracking
8. **BannedIp** - Fraud prevention

### Enums

- **Plan**: FREE, STARTER, PRO, BUSINESS
- **SubscriptionStatus**: ACTIVE, CANCELED, PAST_DUE
- **SurveyStatus**: ACTIVE, PAUSED, COMPLETED
- **SessionStatus**: ACTIVE, PAUSED, COMPLETED, ABANDONED
- **Sentiment**: POSITIVE, NEUTRAL, NEGATIVE

## Setup Instructions

### 1. Database Already Created

The database tables are already created in Supabase. You can verify by:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **GetPersonity**
3. Navigate to **Table Editor**
4. You should see all 9 tables

### 2. TypeScript Types

TypeScript types are auto-generated and stored in:
```
src/types/supabase.ts
```

To regenerate types (if schema changes):
```typescript
// Use MCP tool
mcp_supabase_generate_typescript_types(project_id="byfftstfidplbwwhpcaj")
```

### 3. Database Client

The Supabase admin client is configured in:
```
src/lib/db/supabase.ts
```

Usage example:
```typescript
import { supabaseAdmin } from '@/lib/db/supabase';

// Insert data
const { data, error } = await supabaseAdmin
  .from('Survey')
  .insert({
    userId: user.id,
    title: 'My Survey',
    // ... other fields
  })
  .select()
  .single();

// Query data
const { data: surveys } = await supabaseAdmin
  .from('Survey')
  .select('*')
  .eq('userId', user.id);
```

## Environment Variables

Required in `.env.local`:
```env
# Supabase
SUPABASE_URL=https://byfftstfidplbwwhpcaj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://byfftstfidplbwwhpcaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Making Schema Changes

### Option 1: Supabase Dashboard (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Write your migration SQL
3. Execute the migration
4. Regenerate TypeScript types using MCP tool

### Option 2: MCP Tool

```typescript
// Apply migration
mcp_supabase_apply_migration({
  project_id: "byfftstfidplbwwhpcaj",
  name: "add_new_column",
  query: "ALTER TABLE \"Survey\" ADD COLUMN \"newField\" TEXT;"
});

// Regenerate types
mcp_supabase_generate_typescript_types({
  project_id: "byfftstfidplbwwhpcaj"
});
```

## Viewing Data

### Option 1: Supabase Dashboard
1. Go to **Table Editor**
2. Select a table
3. View/edit data directly

### Option 2: MCP Tool
```typescript
// List tables
mcp_supabase_list_tables({
  project_id: "byfftstfidplbwwhpcaj"
});

// Execute SQL
mcp_supabase_execute_sql({
  project_id: "byfftstfidplbwwhpcaj",
  query: "SELECT * FROM \"Survey\" LIMIT 10;"
});
```

## Migration from Prisma

We migrated from Prisma to Supabase for:
- ✅ Simpler architecture (one client for auth + database)
- ✅ No connection issues
- ✅ Better integration with Supabase Auth
- ✅ Built-in realtime features (for future use)
- ✅ Type safety with generated types

See `PRISMA-TO-SUPABASE-MIGRATION.md` for details.

## Troubleshooting

### Types not updating
```bash
# Regenerate types using MCP tool
mcp_supabase_generate_typescript_types(project_id="byfftstfidplbwwhpcaj")
```

### Connection errors
- Check environment variables are set correctly
- Verify Supabase project is active (not paused)
- Check service role key has correct permissions

### Query errors
- Always check the `error` response from Supabase
- Use TypeScript types to ensure correct field names
- Check foreign key constraints

## Best Practices

1. **Always use TypeScript types** from `src/types/supabase.ts`
2. **Check error responses** - Supabase returns `{ data, error }`
3. **Use service role key only on server** - Never expose to client
4. **Select only needed fields** - Don't use `select('*')` in production
5. **Use indexes** - All foreign keys and frequently queried fields are indexed
6. **Handle null values** - Many fields are nullable, check before using

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
