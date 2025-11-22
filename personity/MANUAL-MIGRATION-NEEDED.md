# Manual Database Migration Required

## Action Needed
Run the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE "ResponseAnalysis" 
ADD COLUMN IF NOT EXISTS "personaInsights" JSONB;
```

## How to Run
1. Go to https://supabase.com/dashboard/project/byfftstfidplbwwhpcaj
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL above
5. Click "Run" or press Cmd/Ctrl + Enter

## What This Does
Adds a `personaInsights` column to store user persona data:
- painLevel (low/medium/high)
- experience (novice/intermediate/expert)
- sentiment (positive/neutral/negative)
- readiness (cold/warm/hot)
- clarity (low/medium/high)

## Verification
After running, verify with:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ResponseAnalysis' 
AND column_name = 'personaInsights';
```

Should return:
```
column_name      | data_type
personaInsights  | jsonb
```

## Status
⏳ **PENDING** - Migration not yet applied
✅ Once applied, persona insights will start being collected and displayed
