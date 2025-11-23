# Content Filter Error Handling

## 🔍 Problem Identified

Azure OpenAI's content management policy was blocking inappropriate content, causing the API to return a 400 error:

```
Error: 400 The response was filtered due to the prompt triggering Azure OpenAI's content management policy.
```

This resulted in:
- ❌ "Internal server error" shown to user
- ❌ No clear explanation of what went wrong
- ❌ Conversation couldn't continue

---

## ✅ Solution

Added proper content filter error handling at two levels:

### 1. AI Service Layer (`azure-openai.ts`)

Detect content filter errors and throw a specific error:

```typescript
catch (error: any) {
  console.error('Azure OpenAI API error:', error);
  
  // Handle content filter errors
  if (error?.code === 'content_filter' || error?.status === 400) {
    throw new Error('CONTENT_FILTERED');
  }
  
  throw new Error('Failed to generate AI response');
}
```

### 2. API Route Layer (`message/route.ts`)

Catch the content filter error and return a user-friendly message:

```typescript
catch (error: any) {
  console.error('Message handling error:', error);
  
  // Handle content filter errors
  if (error?.message === 'CONTENT_FILTERED') {
    return NextResponse.json(
      { 
        error: 'Your message contains inappropriate content. Please keep responses professional and on-topic.',
        contentFiltered: true,
      },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 🎯 User Experience

### Before:
```
User: [inappropriate content]
System: ❌ "Internal server error"
```
- No explanation
- Looks like a bug
- User confused

### After:
```
User: [inappropriate content]
System: ⚠️ "Your message contains inappropriate content. Please keep responses professional and on-topic."
```
- Clear explanation
- Professional message
- User understands what to do

---

## 🛡️ What Gets Filtered

Azure OpenAI's content filter blocks:
- Sexual content
- Violence
- Hate speech
- Self-harm content
- Profanity (in some contexts)
- Other inappropriate content

**Policy**: https://go.microsoft.com/fwlink/?linkid=2198766

---

## 📊 Error Flow

```
User sends inappropriate message
    ↓
API receives message
    ↓
Builds prompt with conversation history
    ↓
Sends to Azure OpenAI
    ↓
Azure content filter triggers
    ↓
Returns 400 error with code: 'content_filter'
    ↓
azure-openai.ts catches error
    ↓
Throws 'CONTENT_FILTERED' error
    ↓
message/route.ts catches error
    ↓
Returns 400 with user-friendly message
    ↓
Frontend displays error to user
```

---

## 🧪 Testing

### Test Scenario 1: Inappropriate Content
1. Send a message with inappropriate content
2. Verify error message: "Your message contains inappropriate content..."
3. Verify status code: 400
4. Verify `contentFiltered: true` flag

### Test Scenario 2: Normal Content
1. Send a normal message
2. Verify AI responds normally
3. No content filter triggered

### Test Scenario 3: Edge Cases
1. Borderline content (mild profanity)
2. Context-dependent content
3. Verify appropriate handling

---

## 🎨 Frontend Display

The error is already handled by the existing error display in the conversation page:

```tsx
{error && sessionToken && (
  <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-red-600">
    {error}
  </div>
)}
```

Shows: "Your message contains inappropriate content. Please keep responses professional and on-topic."

---

## 📝 Best Practices

### For Users:
- Keep responses professional
- Stay on-topic
- Avoid inappropriate language
- Focus on the research questions

### For System:
- Clear error messages
- No technical jargon
- Actionable guidance
- Professional tone

---

## 🔒 Security Benefits

1. **Protects Platform**: Prevents inappropriate content in database
2. **Protects Users**: Maintains professional environment
3. **Protects Creators**: Ensures quality responses
4. **Compliance**: Meets content policy requirements

---

## 🚀 Status

**Implementation: Complete**
**Testing: Ready**
**Production: Ready to deploy**

The system now gracefully handles content filter errors with clear, user-friendly messages! 🛡️
