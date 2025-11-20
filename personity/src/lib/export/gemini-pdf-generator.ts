/**
 * Gemini 3 Pro Powered PDF Generator
 * Uses AI to create intelligent, narrative-driven reports
 */

import { generateWithGemini } from '@/lib/ai/gemini-client';
import jsPDF from 'jspdf';

export interface GeminiPDFData {
  surveyTitle: string;
  surveyObjective: string;
  surveyMode: 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';
  responses: Array<{
    summary: string;
    sentiment: string;
    qualityScore: number;
    keyThemes: string[];
    painPoints?: string[];
    topQuotes: Array<{ quote: string; context: string }>;
  }>;
  aggregateAnalysis: {
    executiveSummary: string;
    topThemes: Array<{ theme: string; percentage: number; count: number }>;
  };
}

/**
 * Generate AI-powered PDF report using Gemini 3 Pro
 */
export async function generateGeminiPDF(data: GeminiPDFData): Promise<Uint8Array> {
  // Build prompt for Gemini
  const prompt = buildReportPrompt(data);

  // Generate report content with Gemini 3 Pro
  const reportContent = await generateWithGemini(prompt, {
    thinkingLevel: 'high',
    maxTokens: 8000,
  });

  // Create PDF with AI-generated content
  return createPDFFromContent(data, reportContent);
}

function buildReportPrompt(data: GeminiPDFData): string {
  const modeContext = {
    PRODUCT_DISCOVERY: 'This is product discovery research focused on finding pain points, validating ideas, and understanding user workflows.',
    FEEDBACK_SATISFACTION: 'This is satisfaction research focused on measuring user happiness, identifying issues, and understanding experiences.',
    EXPLORATORY_GENERAL: 'This is exploratory research focused on understanding perspectives, discovering patterns, and exploring attitudes.',
  }[data.surveyMode];

  return `You are a research analyst creating an executive report. ${modeContext}

SURVEY: ${data.surveyTitle}
OBJECTIVE: ${data.surveyObjective}
RESPONSES: ${data.responses.length}

AGGREGATE INSIGHTS:
${data.aggregateAnalysis.executiveSummary}

TOP THEMES:
${data.aggregateAnalysis.topThemes.map(t => `- ${t.theme} (${t.percentage}% of responses)`).join('\n')}

INDIVIDUAL RESPONSES:
${data.responses.slice(0, 10).map((r, i) => `
Response ${i + 1} (Quality: ${r.qualityScore}/10):
${r.summary}
Key themes: ${r.keyThemes.join(', ')}
${r.painPoints && r.painPoints.length > 0 ? `Pain points: ${r.painPoints.join(', ')}` : ''}
Top quote: "${r.topQuotes[0]?.quote || 'N/A'}"
`).join('\n')}

Create a professional executive report with these sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
   - What did we learn?
   - What are the key takeaways?
   - What should stakeholders know?

2. KEY FINDINGS (3-5 bullet points)
   - Most important insights
   - Backed by data from responses
   - Actionable and specific

3. ${data.surveyMode === 'PRODUCT_DISCOVERY' ? 'CRITICAL PAIN POINTS' : data.surveyMode === 'FEEDBACK_SATISFACTION' ? 'SATISFACTION ANALYSIS' : 'KEY THEMES & PATTERNS'}
   - Deep dive into the main insights
   - Include specific examples and quotes
   - Explain the "why" behind the data

4. RECOMMENDATIONS (3-5 action items)
   - What should the team do next?
   - Prioritized by impact
   - Specific and actionable

5. NOTABLE QUOTES (3-5 quotes)
   - Most insightful or representative quotes
   - Include context for each

Write in a professional, executive-friendly tone. Be concise but insightful. Use data to back up claims.

Format as markdown with clear section headers.`;
}

function createPDFFromContent(data: GeminiPDFData, content: string): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const colors = {
    primary: [37, 99, 235],
    heading: [10, 10, 11],
    body: [63, 63, 70],
    light: [113, 113, 122],
  };

  const checkSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');
  y += 12;

  const modeLabels = {
    PRODUCT_DISCOVERY: 'PRODUCT DISCOVERY',
    FEEDBACK_SATISFACTION: 'FEEDBACK & SATISFACTION',
    EXPLORATORY_GENERAL: 'EXPLORATORY RESEARCH',
  };

  doc.setFontSize(10);
  doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
  doc.text(`${modeLabels[data.surveyMode]} • AI-GENERATED REPORT`, margin, y);
  y += 6;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.heading[0], colors.heading[1], colors.heading[2]);
  const titleLines = doc.splitTextToSize(data.surveyTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 8;

  // Parse markdown content and render
  const sections = content.split(/^#{1,2}\s+/m).filter(s => s.trim());

  sections.forEach(section => {
    const lines = section.split('\n');
    const title = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();

    checkSpace(30);

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.heading[0], colors.heading[1], colors.heading[2]);
    doc.text(title, margin, y);
    y += 8;

    // Section body
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.body[0], colors.body[1], colors.body[2]);

    // Handle bullet points
    const paragraphs = body.split('\n\n');
    paragraphs.forEach(para => {
      if (para.trim().startsWith('-') || para.trim().startsWith('•')) {
        // Bullet list
        const bullets = para.split('\n').filter(l => l.trim());
        bullets.forEach(bullet => {
          checkSpace(15);
          const text = bullet.replace(/^[-•]\s*/, '');
          const textLines = doc.splitTextToSize(text, contentWidth - 5);
          doc.text('•', margin, y);
          doc.text(textLines, margin + 5, y);
          y += textLines.length * 5 + 3;
        });
      } else if (para.trim().startsWith('"')) {
        // Quote
        checkSpace(20);
        doc.setFillColor(239, 246, 255);
        const quoteLines = doc.splitTextToSize(para, contentWidth - 8);
        const quoteHeight = quoteLines.length * 5 + 6;
        doc.roundedRect(margin, y - 2, contentWidth, quoteHeight, 2, 2, 'F');
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setFont('helvetica', 'italic');
        doc.text(quoteLines, margin + 4, y + 2);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.body[0], colors.body[1], colors.body[2]);
        y += quoteHeight + 4;
      } else {
        // Regular paragraph
        checkSpace(20);
        const paraLines = doc.splitTextToSize(para, contentWidth);
        doc.text(paraLines, margin, y);
        y += paraLines.length * 5 + 6;
      }
    });

    y += 6;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.text(
      `Generated by Personity • Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return new Uint8Array(doc.output('arraybuffer'));
}
