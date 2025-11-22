-- Add personaInsights column to ResponseAnalysis table
-- This stores user persona data collected during conversations
-- Run this migration in Supabase SQL Editor

ALTER TABLE "ResponseAnalysis" 
ADD COLUMN IF NOT EXISTS "personaInsights" JSONB;

-- Add comment for documentation
COMMENT ON COLUMN "ResponseAnalysis"."personaInsights" IS 'Stores persona insights: painLevel, experience, sentiment, readiness, clarity';

-- Example data structure:
-- {
--   "painLevel": "high",
--   "experience": "intermediate", 
--   "sentiment": "negative",
--   "readiness": "hot",
--   "clarity": "high"
-- }
