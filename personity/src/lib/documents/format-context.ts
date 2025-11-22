/**
 * Context Formatting Utilities
 * 
 * Pure functions for formatting extracted context (safe for client-side use)
 */

export interface ExtractedContext {
  summary: string;
  productDetails?: string;
  targetAudience?: string;
  keyFeatures?: string[];
  painPoints?: string[];
  goals?: string[];
  additionalNotes?: string;
}

/**
 * Format extracted context for display
 */
export function formatExtractedContext(context: ExtractedContext): string {
  let formatted = `**Summary:**\n${context.summary}\n\n`;

  if (context.productDetails) {
    formatted += `**Product/Service:**\n${context.productDetails}\n\n`;
  }

  if (context.targetAudience) {
    formatted += `**Target Audience:**\n${context.targetAudience}\n\n`;
  }

  if (context.keyFeatures && context.keyFeatures.length > 0) {
    formatted += `**Key Features:**\n${context.keyFeatures.map(f => `• ${f}`).join('\n')}\n\n`;
  }

  if (context.painPoints && context.painPoints.length > 0) {
    formatted += `**Pain Points:**\n${context.painPoints.map(p => `• ${p}`).join('\n')}\n\n`;
  }

  if (context.goals && context.goals.length > 0) {
    formatted += `**Goals:**\n${context.goals.map(g => `• ${g}`).join('\n')}\n\n`;
  }

  if (context.additionalNotes) {
    formatted += `**Additional Notes:**\n${context.additionalNotes}`;
  }

  return formatted.trim();
}
