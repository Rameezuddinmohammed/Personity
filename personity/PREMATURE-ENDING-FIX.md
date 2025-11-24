# Premature Ending Fix

## Problem

AI was ending conversations too early (after 4-5 questions) even when configured for "standard" (8-12 questions) or "deep" (13-20 questions).

### Example Issue:
- User set: "Friendly tone, more questions"
- Expected: 8-12 questions
- Actual: Only 4 questions before starting ending protocol

### Root Cause:
The AI was ending as soon as "all topics covered" without checking if the target question count was reached. The `getNextFocus()` function said "All topics at L3 - Start ending protocol" without considering the minimum question requirement.

## Fix Applied

### 1. Added Minimum Question Check in `getNextFocus()`

```typescript
// All topics covered - but check if we should continue for more depth
// Don't end too early - explore topics further even if all are at L2+
if (state.exchangeCount < 6) {
  return 'Continue exploring - Ask follow-up questions to deepen understanding';
}
```

This prevents ending before at least 6 exchanges (12 questions total, since each exchange = 2 messages).

### 2. Added Target Question Count to Dynamic Prompt

```typescript
TARGET: ${targetQuestions} questions (currently at ${state.exchangeCount})
${state.exchangeCount < targetRange.min ? 
  `⚠️ KEEP GOING - Need at least ${targetRange.min - state.exchangeCount} more questions` : 
  state.exchangeCount >= targetRange.max ? 
  '✓ Target reached - Can start ending protocol' : 
  '✓ In target range - Continue or start ending when topics covered'}
```

The AI now sees:
- Current exchange count
- Target range (5-7, 8-12, or 13-20)
- Clear warning if below minimum
- Green light if in range

### 3. Updated Ending Protocol Instructions

**Before:**
```
End when:
1. All topics covered AND you have sufficient depth
2. User gives 2+ low-quality responses
3. User is clearly not qualified
4. You've reached the target question count
```

**After:**
```
End when:
1. You've reached the MINIMUM target question count (see CONVERSATION STATE above)
   AND all topics are covered with sufficient depth (L2+ on all topics)
2. User gives 2+ low-quality responses in a row
3. User is clearly not qualified

⚠️ DO NOT END EARLY:
- If you haven't reached the minimum target question count, KEEP ASKING
- Even if topics are covered, continue exploring for deeper insights
- The target question count is your PRIMARY guide for when to end
```

Made it crystal clear that target question count is the PRIMARY guide.

## Expected Behavior After Fix

### Quick (5-7 questions)
- Minimum: 5 exchanges (10 messages)
- Maximum: 7 exchanges (14 messages)
- AI will ask at least 5 questions before starting ending protocol

### Standard (8-12 questions)
- Minimum: 8 exchanges (16 messages)
- Maximum: 12 exchanges (24 messages)
- AI will ask at least 8 questions before starting ending protocol

### Deep (13-20 questions)
- Minimum: 13 exchanges (26 messages)
- Maximum: 20 exchanges (40 messages)
- AI will ask at least 13 questions before starting ending protocol

## Testing

### Test Case 1: Standard Length
1. Create survey with "Standard" length setting
2. Start conversation
3. Answer questions normally
4. **Expected:** AI asks 8-12 questions before "Is there anything I didn't ask about?"
5. **Before fix:** AI asked only 4-5 questions
6. **After fix:** AI asks minimum 8 questions

### Test Case 2: Deep Length
1. Create survey with "Deep" length setting
2. Start conversation
3. Answer questions normally
4. **Expected:** AI asks 13-20 questions before ending protocol
5. **After fix:** AI asks minimum 13 questions

## Files Modified

- `src/lib/ai/master-prompt.ts`
  - Updated `getNextFocus()` to check minimum exchange count
  - Added target question count display in dynamic prompt
  - Updated ending protocol instructions to emphasize target count

## Status

✅ Fixed - AI will now respect the configured question count before starting the ending protocol.
