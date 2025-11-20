# Future Enhancements

This document tracks features that are built but not yet activated, or planned for future releases.

## AI-Powered PDF Reports (Ready, Not Active)

### Status: ⏸️ Built but Paused

The Gemini 3 Pro integration for AI-powered PDF reports is fully implemented but not currently active due to billing requirements.

### What's Built
- ✅ Gemini client (`src/lib/ai/gemini-client.ts`)
- ✅ AI PDF generator (`src/lib/export/gemini-pdf-generator.ts`)
- ✅ Mode-adaptive prompts
- ✅ Professional PDF formatting
- ✅ Documentation (`GEMINI-PDF-REPORTS.md`, `GEMINI-SETUP-GUIDE.md`)

### Why Not Active
- Requires Google Cloud billing to be enabled
- Free tier quota currently at 0
- Cost: ~$0.10-0.30 per report

### To Activate
1. Enable billing in Google Cloud Console
2. Set `GEMINI_API_KEY` in `.env.local`
3. Create API endpoint route
4. Add UI button to insights dashboard

### Alternative
Current standard PDF export works great and includes:
- All response data
- Aggregate analysis
- Charts and visualizations
- CSV export option

---

## Other Planned Features

### Phase 2 (Post-MVP)
- [ ] Payment integration (Instamojo)
- [ ] Subscription plans
- [ ] Team collaboration
- [ ] Advanced analytics
- [ ] Custom branding
- [ ] White-label options

### Nice-to-Have
- [ ] Multi-language support
- [ ] Video responses
- [ ] Integration with Slack/Teams
- [ ] Automated report scheduling
- [ ] A/B testing for surveys
- [ ] Response quality scoring improvements

---

**Note**: Focus remains on core MVP features. These enhancements can be added incrementally based on user feedback and business needs.
