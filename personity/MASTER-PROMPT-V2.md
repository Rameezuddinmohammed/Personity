# Master Prompt V2 - Adaptive Intelligence Upgrade

## Problem Statement

The original master prompt was too rigid and pushy, leading to poor user experiences:
- Continued questioning unqualified respondents
- Didn't recognize disengagement signals
- Forced through all topics even when not relevant
- Created frustrating experiences for both respondents and researchers

## Solution: Adaptive Intelligence

The new master prompt adds **contextual awareness** and **graceful degradation** to handle real-world edge cases.

## Key Improvements

### 1. Respondent Qualification (First 2-3 Exchanges)

**Problem:** AI kept asking social media questions to someone who said "I don't do social media"

**Solution:**
```
IF respondent indicates they're not qualified:
  1. Acknowledge respectfully
  2. Ask ONE clarifying question
  3. If confirmed unqualified → End gracefully
  4. DO NOT ask hypothetical questions
```

**Example:**
```
User: "I don't do social media leads. I have organic word of mouth"
AI: "Thanks for sharing that! Have you ever considered using social media for your business?"
User: "nope"
AI: "I completely understand. Thank you for your time! Since social media marketing isn't part of your strategy, this research may not be the best fit. I appreciate you speaking with me."
```

### 2. Low Engagement Detection

**Problem:** AI kept pushing after multiple "idk" / "nothing" responses

**Solution:**
```
Track consecutive short/dismissive answers:
  1st time: Encourage elaboration
  2nd time: Rephrase question
  3rd time: Offer exit
```

**Example:**
```
User: "idk"
AI: "No worries! Let me ask differently: when you think about [topic], what comes to mind?"
User: "nothing really"
AI: "I appreciate your honesty. Would you prefer to continue, or should we wrap up? I want to respect your time."
```

### 3. Confusion Handling

**Problem:** AI didn't recognize when respondents were confused

**Solution:**
- Detect off-topic or confused responses
- Gently redirect with clarification
- After 2 attempts, simplify or move on

### 4. Hostile Response Protocol

**Problem:** No handling for rude/inappropriate respondents

**Solution:**
- Stay professional
- End immediately
- Don't engage further

### 5. Pivoting Strategy

**Problem:** AI spent too long on topics yielding no insights

**Solution:**
- Max 3 questions per topic if not working
- Acknowledge and move on
- "I understand this might not be something you have strong thoughts on..."

### 6. Quality Over Quantity

**New Philosophy:**
- 5 questions with rich insights > 15 questions with "idk"
- Prioritize respondent experience
- Don't waste anyone's time
- End gracefully when appropriate

## Response Format Rules

Every AI response must:
1. Acknowledge what they said (1 sentence)
2. Ask next question OR end conversation (1-2 sentences)
3. Never exceed 3 sentences total

## Adaptive Behavior Matrix

| Situation | Detection | Response | Max Attempts |
|-----------|-----------|----------|--------------|
| Unqualified | "I don't do X" where X is core topic | Clarify once → End gracefully | 1 |
| Disengaged | 3+ consecutive short answers | Encourage → Rephrase → Offer exit | 3 |
| Confused | Off-topic or unclear responses | Redirect → Simplify → Move on | 2 |
| Hostile | Rude/inappropriate | Professional exit immediately | 0 |
| Unproductive Topic | Minimal insights after questions | Acknowledge → Pivot | 3 per topic |

## Edge Cases Handled

### ✅ Unqualified Respondent
- Detects early (first 2-3 exchanges)
- Ends gracefully without wasting time
- Maintains positive experience

### ✅ Low Effort Respondent
- Tries to re-engage (2 attempts)
- Offers exit if not working
- Doesn't force completion

### ✅ Confused Respondent
- Clarifies and redirects
- Simplifies language
- Moves to different topics

### ✅ Hostile Respondent
- Maintains professionalism
- Exits immediately
- Protects brand reputation

### ✅ Partially Qualified
- Explores what they DO know
- Skips irrelevant topics
- Adapts question flow

### ✅ Highly Engaged
- Probes deeper on rich responses
- Follows interesting threads
- Maximizes insight quality

## Technical Implementation

**No code changes required** - this is purely prompt engineering:
- Same API calls
- Same conversation flow
- Same data structure
- Just smarter AI behavior

## Expected Outcomes

### Metrics Improvement
- **Completion Rate:** May decrease slightly (filtering out bad fits)
- **Quality Score:** Should increase significantly (better engagement)
- **Respondent Satisfaction:** Much higher (respectful exits)
- **Insight Value:** Higher (focus on qualified respondents)

### User Experience
- **Respondents:** Less frustration, more respect for their time
- **Researchers:** Higher quality data, fewer junk responses
- **Brand:** More professional, adaptive, intelligent

## Testing Scenarios

Test the new prompt with:
1. ✅ Unqualified respondent (should exit gracefully)
2. ✅ Disengaged respondent (should offer exit after 3 attempts)
3. ✅ Confused respondent (should clarify and redirect)
4. ✅ Hostile respondent (should exit professionally)
5. ✅ Highly engaged respondent (should probe deeper)
6. ✅ Partially qualified (should adapt topics)

## Backward Compatibility

- ✅ Existing surveys continue to work
- ✅ No database changes needed
- ✅ No API changes needed
- ✅ Existing conversations unaffected
- ✅ Topic tracking still works
- ✅ Quality detection still works

## Future Enhancements (Phase 2)

1. **Screening Questions:** Add explicit qualification questions upfront
2. **Branching Logic:** Different question paths based on responses
3. **Sentiment Analysis:** Real-time mood detection and adaptation
4. **Multi-Language:** Adaptive prompts for different languages
5. **Industry Templates:** Pre-tuned prompts for specific research types

## Conclusion

This upgrade transforms Personity from a **rigid question-asker** into an **intelligent conversationalist** that:
- Respects respondent time
- Recognizes when to pivot or exit
- Prioritizes quality over quantity
- Handles edge cases gracefully
- Maintains professional brand image

**Status:** ✅ Deployed
**Impact:** Significantly better UX and data quality
**Risk:** Low (prompt-only change, easily reversible)

---
**Version:** 2.0
**Date:** 2025-11-20
**Author:** AI Improvement Initiative
