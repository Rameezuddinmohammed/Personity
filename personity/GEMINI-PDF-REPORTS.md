# Gemini 3 Pro AI-Powered PDF Reports

## Overview

Personity now supports AI-generated PDF reports using **Gemini 3 Pro**, Google's most advanced reasoning model. This feature transforms raw survey data into executive-ready insights with narrative analysis, key findings, and actionable recommendations.

## Features

- **Intelligent Analysis**: Gemini 3 Pro uses deep reasoning to identify patterns, themes, and insights
- **Mode-Adaptive**: Reports adapt based on survey type (Product Discovery, Feedback & Satisfaction, Exploratory)
- **Executive-Friendly**: Professional formatting with clear sections and data-backed recommendations
- **Quote Integration**: Automatically selects and contextualizes the most impactful respondent quotes

## How It Works

### 1. Data Collection
The system aggregates:
- Survey configuration (title, objective, mode)
- Individual response analyses (summaries, themes, pain points, quotes)
- Aggregate insights (executive summary, top themes)

### 2. AI Generation
Gemini 3 Pro processes the data with:
- **Model**: `gemini-3-pro-preview`
- **Thinking Level**: `high` (enables deep reasoning)
- **Temperature**: `1.0` (Gemini 3 optimized default)
- **Max Tokens**: `8000` (comprehensive reports)

### 3. Report Structure
Generated reports include:
1. **Executive Summary** - High-level takeaways for stakeholders
2. **Key Findings** - 3-5 data-backed insights
3. **Deep Dive** - Mode-specific analysis (Pain Points / Satisfaction / Themes)
4. **Recommendations** - Prioritized, actionable next steps
5. **Notable Quotes** - Representative respondent voices with context

## API Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your-api-key-here
```

Get your API key from: https://aistudio.google.com/apikey

### Pricing (as of Jan 2025)
- **Input**: $2/1M tokens (<200k), $4/1M tokens (>200k)
- **Output**: $12/1M tokens (<200k), $18/1M tokens (>200k)
- **Typical Report**: ~$0.10-0.30 per generation

## Usage

### From Insights Dashboard
```typescript
// Navigate to survey insights page
// Click "Export PDF" button
// Select "AI-Generated Report" option
```

### Programmatic Usage
```typescript
import { generateGeminiPDF } from '@/lib/export/gemini-pdf-generator';

const pdfBuffer = await generateGeminiPDF({
  surveyTitle: 'Product Feedback Survey',
  surveyObjective: 'Understand user pain points',
  surveyMode: 'PRODUCT_DISCOVERY',
  responses: [...],
  aggregateAnalysis: {...},
});
```

## Technical Details

### Gemini 3 Pro Features Used

#### Thinking Level
- **High**: Enables deep reasoning for complex analysis
- **Low**: Available for faster, simpler tasks (not used for reports)

#### Temperature
- **1.0**: Gemini 3 default, optimized for reasoning tasks
- **Note**: Unlike previous models, Gemini 3 performs best at default temperature

#### Prompt Engineering
- **Concise Instructions**: Gemini 3 responds best to direct, clear prompts
- **Context Placement**: Data provided first, questions at the end
- **Explicit Tone**: Specifies "professional, executive-friendly" output

### Error Handling
```typescript
try {
  const report = await generateGeminiPDF(data);
} catch (error) {
  // Falls back to standard PDF generator
  console.error('Gemini generation failed:', error);
}
```

## Comparison: Standard vs AI-Generated PDFs

| Feature | Standard PDF | Gemini AI PDF |
|---------|-------------|---------------|
| Generation Time | <1s | 5-15s |
| Cost | Free | ~$0.10-0.30 |
| Content | Raw data tables | Narrative insights |
| Recommendations | None | AI-generated |
| Quote Selection | All quotes | Most impactful |
| Executive Summary | Basic | Intelligent synthesis |

## Best Practices

### When to Use AI Reports
✅ Executive presentations
✅ Stakeholder updates
✅ Strategic decision-making
✅ Complex pattern identification

### When to Use Standard Reports
✅ Quick data exports
✅ Raw data analysis
✅ Cost-sensitive scenarios
✅ High-volume batch exports

## Limitations

- **Token Limit**: Reports limited to first 10 responses for context (full aggregate data included)
- **Language**: Currently optimized for English
- **Latency**: 5-15 seconds generation time
- **Cost**: Per-generation API costs apply

## Future Enhancements

- [ ] Multi-language support
- [ ] Custom report templates
- [ ] Batch report generation
- [ ] Comparative analysis across surveys
- [ ] Interactive report customization

## Troubleshooting

### "GEMINI_API_KEY not found"
Add your API key to `.env.local`:
```bash
GEMINI_API_KEY=your-key-here
```

### "Generation timeout"
- Check API key validity
- Verify network connectivity
- Reduce response count if needed

### "Invalid response format"
- Gemini may occasionally return malformed JSON
- System automatically retries once
- Falls back to standard PDF on failure

## References

- [Gemini 3 Documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3)
- [Thinking Levels Guide](https://ai.google.dev/gemini-api/docs/thinking)
- [Google AI Studio](https://aistudio.google.com/)

---

**Note**: This feature is currently in beta. Report quality and generation times may vary based on survey complexity and response volume.
