/**
 * PDF Export Module - "The Executive Report" Edition
 * * Generates visual, presentable PDF reports with charts and styled components.
 */

import jsPDF from 'jspdf';

export interface PDFExportData {
  surveyTitle: string;
  surveyObjective: string;
  surveyMode?: 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';
  executiveSummary: string;
  topThemes: Array<{ theme: string; percentage: number; count: number }>;
  userSegments: Array<{ segment: string; characteristics: string[]; count: number }> | null;
  responses: Array<{
    summary: string;
    sentiment: string;
    qualityScore: number;
    keyThemes: string[];
    painPoints?: string[];
    topQuotes: Array<{ quote: string; context: string }>;
    createdAt: string;
  }>;
  responseCount: number;
  includeWatermark: boolean;
}

export function generateInsightsPDF(data: PDFExportData): Uint8Array {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- CONFIG ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Colors
  const colors = {
    primary: [37, 99, 235], // #2563EB Personity Blue
    secondary: [79, 70, 229], // Indigo
    text: {
      heading: [10, 10, 11], // N950
      body: [63, 63, 70],   // N700
      light: [113, 113, 122] // N500
    },
    bg: {
      card: [248, 250, 252], // N50
      highlight: [239, 246, 255] // Blue-50
    },
    sentiment: {
      positive: [22, 163, 74], // Green 600
      neutral: [202, 138, 4],  // Yellow 600
      negative: [220, 38, 38]  // Red 600
    }
  };

  // --- HELPERS ---
  
  const checkSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawHeader = (title: string) => {
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 6, 'F'); // Top accent bar
    
    // Branding footer on every page (except logic handled in main loop)
  };

  // --- SECTION RENDERERS ---

  // 1. REPORT HEADER
  drawHeader(data.surveyTitle);
  y += 10;

  const mode = data.surveyMode || 'EXPLORATORY_GENERAL';
  const modeLabels = {
    PRODUCT_DISCOVERY: 'PRODUCT DISCOVERY',
    FEEDBACK_SATISFACTION: 'FEEDBACK & SATISFACTION',
    EXPLORATORY_GENERAL: 'EXPLORATORY RESEARCH'
  };

  doc.setFontSize(10);
  doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
  doc.text(`${modeLabels[mode]} • INSIGHTS REPORT`, margin, y);
  y += 6;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
  const titleLines = doc.splitTextToSize(data.surveyTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += (titleLines.length * 10) + 4;

  // Metadata Grid
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Responses Box
  doc.setDrawColor(228, 228, 231);
  doc.setFillColor(colors.bg.card[0], colors.bg.card[1], colors.bg.card[2]);
  doc.roundedRect(margin, y, 40, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.responseCount}`, margin + 20, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
  doc.text('RESPONSES', margin + 20, y + 14, { align: 'center' });

  // Objective Text next to box
  const objX = margin + 45;
  const objWidth = contentWidth - 45;
  doc.setFontSize(9);
  doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
  const objLines = doc.splitTextToSize(data.surveyObjective, objWidth);
  doc.text(objLines, objX, y + 5);
  
  y += Math.max(20, objLines.length * 5) + 12;

  // 2. EXECUTIVE SUMMARY
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
  doc.text('Executive Summary', margin, y);
  y += 6;

  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 10, y); // Small accent line
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
  const sumLines = doc.splitTextToSize(data.executiveSummary, contentWidth);
  doc.text(sumLines, margin, y);
  y += (sumLines.length * 6) + 12;

  // 3. KEY THEMES (VISUAL BAR CHARTS)
  checkSpace(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
  doc.text('Top Themes & Frequency', margin, y);
  y += 10;

  if (data.topThemes && data.topThemes.length > 0) {
    data.topThemes.forEach((theme) => {
      checkSpace(15);
      
      // Theme Label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
      doc.text(theme.theme, margin, y);
      
      // Percentage Label
      doc.text(`${theme.percentage}%`, pageWidth - margin, y, { align: 'right' });
      y += 2;

      // Background Bar
      doc.setFillColor(244, 244, 245); // N100
      doc.roundedRect(margin, y, contentWidth, 4, 1, 1, 'F');
      
      // Fill Bar
      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      const fillWidth = (contentWidth * theme.percentage) / 100;
      doc.roundedRect(margin, y, fillWidth, 4, 1, 1, 'F');
      
      y += 10;
    });
  }
  y += 5;

  // 4. MODE-SPECIFIC SECTION
  checkSpace(40);
  
  if (mode === 'FEEDBACK_SATISFACTION') {
    // SENTIMENT BREAKDOWN (STACKED BAR) - Only for Feedback mode
    const sentimentCounts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
    data.responses.forEach(r => {
      const s = r.sentiment as keyof typeof sentimentCounts;
      if (sentimentCounts[s] !== undefined) sentimentCounts[s]++;
    });
    const total = data.responses.length || 1;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
    doc.text('Sentiment Analysis', margin, y);
    y += 8;

    // Draw Stacked Bar
    const barHeight = 12;
    let currentX = margin;
    
    // Positive Segment
    const posWidth = (sentimentCounts.POSITIVE / total) * contentWidth;
    if (posWidth > 0) {
      doc.setFillColor(colors.sentiment.positive[0], colors.sentiment.positive[1], colors.sentiment.positive[2]);
    doc.rect(currentX, y, posWidth, barHeight, 'F');
    if (posWidth > 15) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`${Math.round((sentimentCounts.POSITIVE/total)*100)}%`, currentX + (posWidth/2), y + 7.5, { align: 'center' });
    }
    currentX += posWidth;
  }

  // Neutral Segment
  const neuWidth = (sentimentCounts.NEUTRAL / total) * contentWidth;
  if (neuWidth > 0) {
    doc.setFillColor(colors.sentiment.neutral[0], colors.sentiment.neutral[1], colors.sentiment.neutral[2]);
    doc.rect(currentX, y, neuWidth, barHeight, 'F');
    currentX += neuWidth;
  }

  // Negative Segment
  const negWidth = (sentimentCounts.NEGATIVE / total) * contentWidth;
  if (negWidth > 0) {
    doc.setFillColor(colors.sentiment.negative[0], colors.sentiment.negative[1], colors.sentiment.negative[2]);
    doc.rect(currentX, y, negWidth, barHeight, 'F');
  }

  // Legend
  y += barHeight + 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
  
  let legendX = margin;
  // Green dot
  doc.setFillColor(colors.sentiment.positive[0], colors.sentiment.positive[1], colors.sentiment.positive[2]);
  doc.circle(legendX, y - 1, 1.5, 'F');
  doc.text('Positive', legendX + 4, y);
  legendX += 25;
  
  // Yellow dot
  doc.setFillColor(colors.sentiment.neutral[0], colors.sentiment.neutral[1], colors.sentiment.neutral[2]);
  doc.circle(legendX, y - 1, 1.5, 'F');
  doc.text('Neutral', legendX + 4, y);
  legendX += 25;

  // Red dot
  doc.setFillColor(colors.sentiment.negative[0], colors.sentiment.negative[1], colors.sentiment.negative[2]);
  doc.circle(legendX, y - 1, 1.5, 'F');
  doc.text('Negative', legendX + 4, y);

  y += 12;
  } else if (mode === 'PRODUCT_DISCOVERY') {
    // TOP PAIN POINTS - For Product Discovery mode
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
    doc.text('Top Pain Points', margin, y);
    y += 8;

    // Collect all pain points
    const allPainPoints: string[] = [];
    data.responses.forEach(r => {
      if (r.painPoints) {
        allPainPoints.push(...r.painPoints);
      }
    });

    // Count frequency
    const painPointCounts: Record<string, number> = {};
    allPainPoints.forEach(pp => {
      painPointCounts[pp] = (painPointCounts[pp] || 0) + 1;
    });

    // Get top 5
    const topPainPoints = Object.entries(painPointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    if (topPainPoints.length > 0) {
      topPainPoints.forEach(([painPoint, count]) => {
        checkSpace(12);
        
        // Pain point text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
        const ppLines = doc.splitTextToSize(painPoint, contentWidth - 20);
        doc.text(ppLines, margin, y);
        
        // Count badge
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${count}x`, pageWidth - margin, y, { align: 'right' });
        
        y += (ppLines.length * 5) + 5;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
      doc.text('No pain points identified', margin, y);
      y += 8;
    }
    y += 4;
  } else {
    // KEY THEMES DISTRIBUTION - For Exploratory mode
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
    doc.text('Key Themes Distribution', margin, y);
    y += 8;

    // Show top 5 themes with bars (similar to themes section but different styling)
    if (data.topThemes && data.topThemes.length > 0) {
      data.topThemes.slice(0, 5).forEach((theme) => {
        checkSpace(12);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
        doc.text(theme.theme, margin, y);
        doc.text(`${theme.count} responses`, pageWidth - margin, y, { align: 'right' });
        y += 2;

        // Bar
        doc.setFillColor(244, 244, 245);
        doc.roundedRect(margin, y, contentWidth, 3, 1, 1, 'F');
        doc.setFillColor(124, 58, 237); // Purple for exploratory
        const fillWidth = (contentWidth * theme.percentage) / 100;
        doc.roundedRect(margin, y, fillWidth, 3, 1, 1, 'F');
        
        y += 8;
      });
    }
    y += 4;
  }

  // 5. USER SEGMENTS (Cards)
  if (data.userSegments && data.userSegments.length > 0) {
    checkSpace(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
    doc.text('User Segments', margin, y);
    y += 8;

    data.userSegments.forEach((segment) => {
      checkSpace(35);
      
      // Card Background
      doc.setFillColor(colors.bg.card[0], colors.bg.card[1], colors.bg.card[2]);
      doc.setDrawColor(228, 228, 231);
      const cardY = y;
      
      // Segment Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
      doc.text(segment.segment, margin + 4, y + 6);
      
      // Count badge
      doc.setFontSize(9);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text(`${segment.count} users`, pageWidth - margin - 4, y + 6, { align: 'right' });
      
      y += 12;
      
      // Characteristics
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
      
      segment.characteristics.forEach(char => {
        doc.text(`• ${char}`, margin + 6, y);
        y += 5;
      });
      
      // Draw border around the segment we just made
      const height = y - cardY;
      doc.roundedRect(margin, cardY, contentWidth, height, 2, 2, 'S');
      y += 6;
    });
  }

  // 6. SELECTED QUOTES (Styled)
  if (data.responses.some(r => r.topQuotes.length > 0)) {
    checkSpace(40);
    y += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.text.heading[0], colors.text.heading[1], colors.text.heading[2]);
    doc.text('Key Quotes', margin, y);
    y += 8;

    let quoteCount = 0;
    // Just grab the top 5 quotes total across responses to avoid PDF bloat
    for (const r of data.responses) {
      if (quoteCount >= 5) break;
      for (const q of r.topQuotes) {
        if (quoteCount >= 5) break;
        checkSpace(30);
        
        // Quote Bar
        doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.setLineWidth(1);
        doc.line(margin, y, margin, y + 10); // Vertical accent line
        
        // Quote Text
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(colors.text.body[0], colors.text.body[1], colors.text.body[2]);
        const qLines = doc.splitTextToSize(`"${q.quote}"`, contentWidth - 6);
        doc.text(qLines, margin + 4, y + 4);
        y += (qLines.length * 5) + 2;
        
        // Context
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
        doc.text(`— ${q.context}`, margin + 4, y);
        y += 8;
        quoteCount++;
      }
    }
  }

  // WATERMARK
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Page number
    doc.setFontSize(9);
    doc.setTextColor(colors.text.light[0], colors.text.light[1], colors.text.light[2]);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Footer Branding
    if (data.includeWatermark) {
      doc.text('Generated by Personity.ai', margin, pageHeight - 10);
    }
  }

  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}