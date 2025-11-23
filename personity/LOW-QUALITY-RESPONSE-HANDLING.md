# Low-Quality Response Handling Strategy

## 🎯 Strategy: Re-Engage Once, Then End

We use a **two-strike system** with automatic re-engagement:

---

## 📊 Response Flow

### Strike 1: Re-Engagement (Automatic)
```
User: "idk"
    ↓
Quality Check: LOW QUALITY
    ↓
System generates re-engagement message
    ↓
AI: "I'd love to hear more about that. Could you share a bit more detail or give me an example?"
    ↓
Give user another chance
```

**Action**: System automatically re-engages (user doesn't see any error)

---

### Strike 2: End Conversation (Polite)
```
User: "nah" (second low-quality response)
    ↓
Quality Check: LOW QUALITY (2nd consecutive)
    ↓
AI ends conversation politely
    ↓
AI: "I appreciate your time, but I don't think we're getting the information we need. Thank you for participating."
    ↓
shouldEnd: true, reason: "low_quality"
```

**Action**: End conversation professionally

---

## 🛡️ What Triggers Low Quality Detection

### 1. One-Word Answers
- "idk", "dunno", "nah", "maybe"
- "ok", "fine", "yes", "no"
- "yep", "nope", "yeah"

### 2. Profanity
- Any curse words
- Offensive language
- "fuck", "shit", "damn", etc.

### 3. Nonsensical Content
- "alien from pluto"
- "magic wizard"
- Fantasy/made-up scenarios
- Clearly trolling

### 4. Off-Topic
- Completely unrelated to question
- Random tangents
- Ignoring the question

### 5. Contradictions
- Contradicts previous answers
- No explanation provided
- Clearly inconsistent

---

## 💬 Example Conversations

### Example 1: Successful Re-Engagement
```
AI: "How do you currently manage leads?"
User: "idk" ← Strike 1

System: [Re-engages automatically]
AI: "I'd love to hear more. For example, do you use any tools or software?"
User: "Oh yeah, I use a spreadsheet and update it daily" ← Good response!

AI: "What's the hardest part of that process?" ← Continues normally
```

**Result**: ✅ Conversation continues

---

### Example 2: End After 2 Strikes
```
AI: "How do you currently manage leads?"
User: "idk" ← Strike 1

System: [Re-engages automatically]
AI: "I'd love to hear more. For example, do you use any tools?"
User: "nah" ← Strike 2

AI: "I appreciate your time, but I don't think we're getting the information we need. Thank you for participating."
shouldEnd: true, reason: "low_quality"
```

**Result**: ❌ Conversation ends

---

### Example 3: Profanity = Immediate Issue
```
AI: "How do you currently manage leads?"
User: "I don't know, this is stupid" ← Strike 1

System: [Re-engages automatically]
AI: "I understand this might feel tedious. Could you share just a quick overview?"
User: "no, fuck you" ← Strike 2 + Content Filter

Content Filter: Blocks AI response
Error: "Your message contains inappropriate content..."
```

**Result**: ❌ Content filtered + conversation flagged

---

## 🔄 System Behavior

### Backend (Automatic):
1. **Quality Check**: Runs on every user message
2. **Re-Engagement**: Generates friendly follow-up (1st strike)
3. **Tracking**: Increments `lowQualityCount` in state
4. **Flagging**: Marks session as flagged after 3 strikes
5. **IP Tracking**: May ban IP after multiple flagged sessions

### AI (Instructed):
1. **Awareness**: Sees quality status in dynamic prompt
2. **Ending**: Instructed to end after 2nd consecutive low-quality
3. **Message**: Uses polite, professional ending message
4. **Reason**: Sets `reason: "low_quality"` in response

---

## 📝 Ending Messages

### For Low Quality:
```json
{
  "message": "I appreciate your time, but I don't think we're getting the information we need. Thank you for participating.",
  "shouldEnd": true,
  "reason": "low_quality",
  "summary": "Conversation ended due to repeated low-quality or inappropriate responses."
}
```

### For Disqualification:
```json
{
  "message": "I appreciate your time, but this might not be the best fit. Thanks!",
  "shouldEnd": true,
  "reason": "disqualified",
  "summary": "Respondent does not meet survey criteria."
}
```

---

## 🎯 Why This Strategy Works

### 1. Gives Second Chance
- People might be confused
- Might not understand the question
- Might be on mobile (typing is hard)
- Re-engagement often works!

### 2. Protects Data Quality
- Doesn't waste time on trolls
- Prevents bad data from polluting insights
- Saves AI costs

### 3. Professional Experience
- Polite ending message
- No harsh language
- Maintains brand reputation

### 4. Protects Platform
- Flags abusive users
- Tracks IP addresses
- Can ban repeat offenders

---

## 📊 What Happens to These Conversations

### In Database:
```sql
INSERT INTO ConversationSession (
  status = 'COMPLETED',
  currentState = {
    lowQualityCount: 2,
    isFlagged: true
  }
)

INSERT INTO ResponseAnalysis (
  qualityScore = 2,
  isFlagged = true
)
```

### In Insights Dashboard:
```sql
-- Excluded from analysis
SELECT * FROM ResponseAnalysis
WHERE qualityScore >= 6  -- This one excluded (score: 2)
AND isFlagged = false    -- This one excluded (flagged: true)
```

### Creator Can See:
- Response marked with ⚠️ warning badge
- Full transcript available
- Reason for flagging shown
- Not included in aggregate insights

---

## 🧪 Testing Scenarios

### Test 1: Re-Engagement Success
1. Give one-word answer
2. Verify re-engagement message
3. Give good answer
4. Verify conversation continues

### Test 2: Two Strikes End
1. Give one-word answer
2. Verify re-engagement
3. Give another one-word answer
4. Verify conversation ends with "low_quality" reason

### Test 3: Profanity
1. Use profanity
2. Verify content filter error
3. Session flagged

### Test 4: Nonsense
1. Give nonsensical answers (aliens, magic)
2. Verify flagged after 2 strikes
3. Conversation ends

---

## 🚀 Status

**Implementation: Complete**
**Strategy: Re-engage once, then end politely**
**Testing: Ready**
**Production: Ready to deploy**

The system now handles low-quality responses professionally while protecting data quality! 🛡️
