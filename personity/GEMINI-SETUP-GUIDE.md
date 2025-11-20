# Gemini API Setup Guide

## Current Status

✅ **API Key**: Valid (`AIzaSyAoBovJwXWzUjCzsHL7zpgUHD29PG86wwY`)  
❌ **Quota**: Currently at 0 (quota exhausted or billing not enabled)

## Issue: Quota Exceeded

You're seeing this error:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
limit: 0
```

This means your API key either:
1. Has exhausted its daily free quota
2. Needs billing enabled (even for free tier usage)

## Solution Options

### Option 1: Enable Billing (Recommended)

Even if you want to use the free tier, Google requires a billing account to be set up:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Select Your Project**
   - Find the project associated with your API key
   - Or create a new project

3. **Enable Billing**
   - Go to: https://console.cloud.google.com/billing
   - Click "Link a billing account"
   - Add a payment method (credit card)
   - **Note**: You won't be charged unless you exceed free tier limits

4. **Enable Gemini API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Generative Language API"
   - Click "Enable"

5. **Check Quotas**
   - Visit: https://ai.dev/usage?tab=rate-limit
   - Verify your quotas are active

### Option 2: Wait for Quota Reset

If you've already used your free tier quota today:
- **Free tier resets**: Every 24 hours
- **Wait time**: Check the error message for retry time (~28 seconds to 24 hours)
- **Monitor usage**: https://ai.dev/usage

### Option 3: Use Alternative Model (Temporary)

While waiting for quota/billing setup, you can:
- Test the integration with mock data
- Use Azure OpenAI (already configured) for all reports
- Wait until billing is enabled

## Free Tier Limits

### Gemini 2.0 Flash (Free)
- **Requests**: 15 requests per minute
- **Tokens**: 1 million tokens per day
- **Cost**: $0 (free)

### Gemini 3 Pro (Paid Only)
- **No free tier** - Requires billing
- **Cost**: ~$0.10-0.30 per report
- **Pricing**: $2-4/1M input, $12-18/1M output

## Configuration

### Current Setup (.env.local)
```bash
GEMINI_API_KEY=AIzaSyAoBovJwXWzUjCzsHL7zpgUHD29PG86wwY
GEMINI_USE_FREE_TIER=true  # Uses gemini-2.0-flash-exp
```

### For Paid Tier (Gemini 3 Pro)
```bash
GEMINI_API_KEY=your-key-here
GEMINI_USE_FREE_TIER=false  # Uses gemini-3-pro-preview
```

## Testing After Setup

### 1. Quick Test
```bash
node test-gemini.mjs
```

### 2. Check Quota Status
Visit: https://ai.dev/usage?tab=rate-limit

### 3. Test PDF Generation
```bash
# Start dev server
npm run dev

# Test endpoint (replace {id} with actual survey ID)
curl http://localhost:3000/api/surveys/{id}/export/gemini-pdf
```

## Troubleshooting

### Error: "Quota exceeded, limit: 0"
**Cause**: Billing not enabled or quota exhausted  
**Fix**: Enable billing in Google Cloud Console

### Error: "API key not valid"
**Cause**: Invalid or expired API key  
**Fix**: Generate new key at https://aistudio.google.com/apikey

### Error: "Model not found"
**Cause**: Model name incorrect or not available  
**Fix**: Use `gemini-2.0-flash-exp` (free) or `gemini-3-pro-preview` (paid)

### Error: "Rate limit exceeded"
**Cause**: Too many requests in short time  
**Fix**: Wait 60 seconds and retry

## Cost Estimates (After Billing Enabled)

### Free Tier (gemini-2.0-flash-exp)
- **Daily limit**: 1M tokens
- **Typical report**: ~5,000 tokens
- **Reports per day**: ~200 reports (free)

### Paid Tier (gemini-3-pro-preview)
- **Per report**: ~$0.10-0.30
- **100 reports**: ~$10-30
- **1000 reports**: ~$100-300

## Recommended Next Steps

1. ✅ **Enable billing** in Google Cloud Console
2. ✅ **Verify quotas** are active
3. ✅ **Run test script**: `node test-gemini.mjs`
4. ✅ **Test PDF generation** via API endpoint
5. ✅ **Add UI button** to insights dashboard
6. ✅ **Monitor costs** at https://console.cloud.google.com/billing

## Alternative: Use Azure OpenAI Only

If you prefer not to set up Gemini billing, you can:
- Continue using the existing standard PDF export
- Use Azure OpenAI for all AI features
- Skip Gemini integration for now

The standard PDF export already works and provides:
- ✅ All response data
- ✅ Aggregate analysis
- ✅ Charts and visualizations
- ✅ CSV export option

## Support Links

- **Google AI Studio**: https://aistudio.google.com/
- **API Keys**: https://aistudio.google.com/apikey
- **Usage Dashboard**: https://ai.dev/usage
- **Billing Console**: https://console.cloud.google.com/billing
- **Documentation**: https://ai.google.dev/gemini-api/docs
- **Rate Limits**: https://ai.google.dev/gemini-api/docs/rate-limits

---

**Current Status**: ⏸️ Waiting for billing setup or quota reset  
**Next Action**: Enable billing in Google Cloud Console
