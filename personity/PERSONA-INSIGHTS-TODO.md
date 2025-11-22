# Persona Insights - Implementation TODO

## Current Status
✅ Master Prompt V10 generates persona data (painLevel, experience, sentiment, readiness, clarity)
✅ Structured response includes persona field
✅ Message API returns persona data
✅ PersonaDistribution component created

## What's Missing
❌ Persona data not being stored in database
❌ No aggregation of persona data across responses
❌ Insights dashboard doesn't display persona widget yet

## Implementation Steps

### 1. Database Schema Update
Add `personaInsights` JSON field to `ResponseAnalysis` table:
```sql
ALTER TABLE "ResponseAnalysis" 
ADD COLUMN "personaInsights" JSONB;
```

### 2. Store Persona Data on Completion
Update `/api/conversations/[token]/complete/route.ts`:
- Extract persona data from final message
- Store in ResponseAnalysis.personaInsights field

### 3. Aggregate Persona Data
Update `/api/surveys/[id]/insights/route.ts`:
- Query all ResponseAnalysis records for survey
- Aggregate persona counts:
  ```typescript
  {
    painLevel: { low: 5, medium: 10, high: 3 },
    experience: { novice: 2, intermediate: 12, expert: 4 },
    sentiment: { positive: 8, neutral: 7, negative: 3 },
    readiness: { cold: 4, warm: 9, hot: 5 },
    clarity: { low: 1, medium: 8, high: 9 }
  }
  ```

### 4. Display in Insights Dashboard
Update `/app/(dashboard)/surveys/[id]/insights/page.tsx`:
- Import PersonaDistribution component
- Add persona widget to layout
- Show after aggregate analysis section

## Priority
**HIGH** - This is a key differentiator and monetization feature.

Persona insights show:
- Who your users are (experience level)
- How much they care (pain level)
- How ready they are to act (readiness)
- Quality of insights (clarity)

This is premium data that justifies higher pricing tiers.
