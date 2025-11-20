# Quality Detection and Fraud Prevention System

## Overview

The quality detection and fraud prevention system protects Personity from low-quality responses, spam, and abusive behavior. It operates in real-time during conversations and includes automatic IP banning for repeat offenders.

## Components

### 1. Quality Detection (`src/lib/ai/quality-detection.ts`)

Detects low-quality responses using both heuristic and AI-powered analysis.

**Features:**
- Detects 1-2 word responses (e.g., "idk", "dunno", "nothing")
- Uses AI to assess quality of short responses (3-5 words)
- Generates re-engagement messages to encourage better responses
- Tracks low-quality response count per session
- Flags sessions after 3 low-quality responses

**Key Functions:**
- `checkResponseQuality()` - Analyzes a user message for quality
- `generateReEngagementMessage()` - Creates a friendly follow-up prompt
- `trackLowQualityResponse()` - Updates session state with quality tracking

**Example Usage:**
```typescript
const qualityCheck = await checkResponseQuality(message, conversationHistory);

if (qualityCheck.isLowQuality && qualityCheck.shouldReEngage) {
  const reEngagement = await generateReEngagementMessage(lastAIQuestion);
  // Return re-engagement message instead of continuing
}
```

### 2. Spam Detection (`src/lib/fraud/spam-detection.ts`)

Detects spam patterns and abusive behavior.

**Detection Patterns:**
- **Identical Responses**: Flags if user sends same message 3+ times
- **Suspicious Speed**: Flags if average response time < 5 seconds
- **High Session Count**: Flags if IP creates 20+ sessions in 24 hours
- **Low-Quality Sessions**: Flags if IP has 10+ flagged sessions in 24 hours

**Key Functions:**
- `detectIdenticalResponses()` - Checks for repeated messages
- `calculateAverageExchangeTime()` - Computes response speed
- `isSuspiciousSpeed()` - Detects bot-like behavior
- `getIPSessionCount()` - Counts sessions from an IP
- `getLowQualitySessionCount()` - Counts flagged sessions from an IP
- `checkForSpam()` - Comprehensive spam check
- `flagSession()` - Marks a session as spam/low-quality

**Example Usage:**
```typescript
const spamCheck = await checkForSpam(ipAddress, exchanges, newMessage);

if (spamCheck.isSpam) {
  await flagSession(sessionId, spamCheck.reason);
  
  if (spamCheck.shouldBan) {
    await autoBanIfNeeded(ipAddress);
  }
}
```

### 3. IP Banning (`src/lib/fraud/ip-banning.ts`)

Manages IP bans for fraud prevention.

**Features:**
- Check if IP is banned before allowing access
- Ban IPs manually or automatically
- Support for temporary bans (with expiry) or permanent bans
- Automatic ban after 10+ low-quality sessions in 24 hours
- Cleanup of expired bans

**Key Functions:**
- `isIPBanned()` - Check if an IP is currently banned
- `banIP()` - Ban an IP address (manual or automatic)
- `unbanIP()` - Remove a ban
- `getBannedIPs()` - List all banned IPs
- `autoBanIfNeeded()` - Automatically ban if threshold reached
- `cleanupExpiredBans()` - Remove expired bans (maintenance)

**Example Usage:**
```typescript
// Check before allowing session creation
const isBanned = await isIPBanned(ipAddress);
if (isBanned) {
  return { error: 'Access denied' };
}

// Manual ban
await banIP('192.168.1.1', 'Spam behavior', 7); // 7-day ban

// Automatic ban
await autoBanIfNeeded(ipAddress); // Bans if 10+ flagged sessions
```

### 4. Admin API (`src/app/api/admin/bans/route.ts`)

REST API for managing IP bans (requires authentication).

**Endpoints:**

**GET /api/admin/bans**
- Lists all banned IPs
- Returns: Array of banned IP records

**POST /api/admin/bans**
- Manually ban an IP
- Body: `{ ipAddress, reason, durationDays? }`
- Returns: Success message

**DELETE /api/admin/bans**
- Unban an IP
- Body: `{ ipAddress }`
- Returns: Success message

**Example:**
```bash
# List banned IPs
curl -X GET https://personity.com/api/admin/bans \
  -H "Authorization: Bearer <token>"

# Ban an IP
curl -X POST https://personity.com/api/admin/bans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ipAddress":"192.168.1.1","reason":"Manual ban","durationDays":7}'

# Unban an IP
curl -X DELETE https://personity.com/api/admin/bans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"ipAddress":"192.168.1.1"}'
```

## Integration with Conversation Flow

The quality detection and fraud prevention system is integrated into the conversation message handler (`src/app/api/conversations/[token]/message/route.ts`).

**Flow:**

1. **Rate Limiting**: Check if IP exceeds 30 requests/minute
2. **Spam Check**: Detect spam patterns (identical responses, suspicious speed, high session count)
3. **Quality Check**: Analyze response quality
4. **Re-engagement**: If low quality and first occurrence, send re-engagement message
5. **Flagging**: Flag session after 3 low-quality responses
6. **Auto-ban**: Ban IP if 10+ flagged sessions in 24 hours
7. **Normal Flow**: Continue with AI response generation if all checks pass

**Session State Tracking:**

The system tracks quality metrics in the session's `currentState`:

```typescript
{
  exchangeCount: number;
  topicsCovered: string[];
  lowQualityCount?: number;      // Number of low-quality responses
  hasReEngaged?: boolean;         // Whether re-engagement was attempted
  isFlagged?: boolean;            // Whether session is flagged
  flagReason?: string;            // Reason for flagging
  flaggedAt?: string;             // Timestamp of flagging
}
```

## Database Schema

**BannedIp Table:**
```sql
CREATE TABLE "BannedIp" (
  id UUID PRIMARY KEY,
  ipAddress TEXT UNIQUE NOT NULL,
  reason TEXT,
  bannedAt TIMESTAMP NOT NULL,
  expiresAt TIMESTAMP NULL
);
```

## Thresholds and Configuration

**Quality Detection:**
- Low-quality threshold: 1-2 word responses or generic answers
- Re-engagement: Attempted once per session
- Flagging threshold: 3 low-quality responses

**Spam Detection:**
- Identical responses: 3+ times
- Suspicious speed: < 5 seconds average
- High session count: 20+ sessions in 24 hours
- Low-quality sessions: 10+ flagged sessions in 24 hours

**Rate Limiting:**
- 30 requests per minute per IP

**IP Banning:**
- Automatic ban: 10+ low-quality sessions in 24 hours
- Ban duration: 7 days (configurable)
- Permanent bans: Set `durationDays` to `null`

## Monitoring and Maintenance

**Recommended Monitoring:**
1. Track flagged session rate
2. Monitor banned IP count
3. Review false positives (legitimate users flagged)
4. Analyze spam patterns for improvements

**Maintenance Tasks:**
1. Run `cleanupExpiredBans()` daily to remove expired bans
2. Review and unban false positives
3. Adjust thresholds based on observed patterns

**Cron Job Example:**
```typescript
// Run daily at midnight
export async function cleanupBans() {
  const removed = await cleanupExpiredBans();
  console.log(`Cleaned up ${removed} expired bans`);
}
```

## Testing

**Test Scenarios:**

1. **Low-Quality Response Detection:**
   - Send "idk" → Should trigger re-engagement
   - Send 3 low-quality responses → Should flag session

2. **Spam Detection:**
   - Send identical message 3 times → Should flag as spam
   - Create 20+ sessions from same IP → Should flag

3. **IP Banning:**
   - Create 10+ flagged sessions → Should auto-ban IP
   - Try to create session with banned IP → Should deny access

4. **Re-engagement:**
   - Send low-quality response → Should receive re-engagement message
   - Send another low-quality response → Should not re-engage again

## Future Enhancements

1. **Machine Learning**: Train model on flagged sessions for better detection
2. **Whitelist**: Allow trusted IPs to bypass checks
3. **Graduated Responses**: Warn before banning
4. **Appeal System**: Allow users to appeal bans
5. **Analytics Dashboard**: Visualize fraud patterns
6. **Honeypot Detection**: Detect automated bots

## Requirements Satisfied

- ✅ **Requirement 4.5**: Low-quality response detection with re-engagement
- ✅ **Requirement 7.1**: Detect 1-2 word responses, "idk", generic answers
- ✅ **Requirement 7.2**: Detect identical responses (3+ times)
- ✅ **Requirement 7.3**: Track sessions per IP in 24-hour window
- ✅ **Requirement 7.4**: Calculate average exchange time and flag suspicious speed
- ✅ **Requirement 7.2**: Ban IPs with 10+ low-quality sessions in 24 hours

## Status

✅ **Task 7.1**: Low-quality response detection - COMPLETED
✅ **Task 7.2**: Spam and abuse detection - COMPLETED
✅ **Task 7.3**: IP banning system - COMPLETED

All quality detection and fraud prevention features are implemented and integrated into the conversation flow.
