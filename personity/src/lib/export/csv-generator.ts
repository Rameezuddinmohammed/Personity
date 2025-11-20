/**
 * CSV Export Module
 * 
 * Generates CSV exports of survey response data
 * Requirements: 12.4, 12.5
 */

export interface CSVExportData {
  surveyMode?: 'PRODUCT_DISCOVERY' | 'FEEDBACK_SATISFACTION' | 'EXPLORATORY_GENERAL';
  responses: Array<{
    timestamp: string;
    summary: string;
    keyThemes: string[];
    sentiment: string;
    qualityScore: number;
    painPoints: string[];
    opportunities: string[];
    topQuotes: Array<{ quote: string; context: string }>;
  }>;
}

/**
 * Escape CSV field value
 * 
 * @param value - The value to escape
 * @returns Escaped value
 */
function escapeCSVField(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate a CSV export of survey response data
 * 
 * @param data - The export data
 * @returns CSV string
 */
export function generateResponsesCSV(data: CSVExportData): string {
  const mode = data.surveyMode || 'EXPLORATORY_GENERAL';
  
  // Mode-specific sentiment column label
  const sentimentLabel = mode === 'FEEDBACK_SATISFACTION' 
    ? 'Sentiment' 
    : 'Response Tone';
  
  // CSV headers
  const headers = [
    'Timestamp',
    'Summary',
    'Key Themes',
    sentimentLabel,
    'Quality Score',
    'Pain Points',
    'Opportunities',
    'Top Quotes',
  ];

  // Build CSV rows
  const rows: string[] = [headers.join(',')];

  data.responses.forEach((response) => {
    const row = [
      escapeCSVField(new Date(response.timestamp).toISOString()),
      escapeCSVField(response.summary),
      escapeCSVField(response.keyThemes.join('; ')),
      escapeCSVField(response.sentiment),
      response.qualityScore.toString(),
      escapeCSVField(response.painPoints.join('; ')),
      escapeCSVField(response.opportunities.join('; ')),
      escapeCSVField(
        response.topQuotes
          .map((q) => `"${q.quote}" (${q.context})`)
          .join(' | ')
      ),
    ];

    rows.push(row.join(','));
  });

  return rows.join('\n');
}
