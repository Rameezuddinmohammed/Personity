-- Create SupportRequest table for storing user support inquiries
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "SupportRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "userEmail" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "resolvedAt" TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS "SupportRequest_userId_idx" ON "SupportRequest"("userId");
CREATE INDEX IF NOT EXISTS "SupportRequest_status_idx" ON "SupportRequest"("status");
CREATE INDEX IF NOT EXISTS "SupportRequest_createdAt_idx" ON "SupportRequest"("createdAt" DESC);

-- Add comment
COMMENT ON TABLE "SupportRequest" IS 'Stores user support requests submitted through help center';
