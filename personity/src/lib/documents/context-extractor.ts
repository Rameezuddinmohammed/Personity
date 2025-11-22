/**
 * Context Extractor
 * 
 * Uses AI to extract structured context from document content
 */

import { generateAIResponse, AIMessage } from '../ai/azure-openai';

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
 * Extract structured context from document content using AI
 */
export async function extractContextFromDocument(
  documentContent: string,
  researchObjective: string
): Promise<ExtractedContext> {
  const prompt = `You are analyzing a document to extract relevant context for a research survey.

Research Objective: "${researchObjective}"

Document Content:
"""
${documentContent.slice(0, 8000)} ${documentContent.length > 8000 ? '...(truncated)' : ''}
"""

Extract the following information from the document that would be relevant for conducting user research interviews:

1. **Summary** - Brief overview of what this document is about (2-3 sentences)
2. **Product/Service Details** - What product, service, or concept is being discussed?
3. **Target Audience** - Who are the intended users or customers?
4. **Key Features** - Important features, capabilities, or offerings mentioned
5. **Pain Points** - Problems, challenges, or needs identified
6. **Goals** - Objectives, success metrics, or desired outcomes
7. **Additional Notes** - Any other relevant context for the research

Respond with ONLY a JSON object in this format:
{
  "summary": "Brief overview...",
  "productDetails": "Description of product/service...",
  "targetAudience": "Description of target users...",
  "keyFeatures": ["feature 1", "feature 2"],
  "painPoints": ["pain point 1", "pain point 2"],
  "goals": ["goal 1", "goal 2"],
  "additionalNotes": "Other relevant context..."
}

If any field is not found in the document, omit it from the response.`;

  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a research analyst extracting structured context from documents. Always respond with valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await generateAIResponse(messages, {
      temperature: 0.3,
      maxTokens: 800,
    });

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      summary: result.summary || 'No summary available',
      productDetails: result.productDetails,
      targetAudience: result.targetAudience,
      keyFeatures: Array.isArray(result.keyFeatures) ? result.keyFeatures : undefined,
      painPoints: Array.isArray(result.painPoints) ? result.painPoints : undefined,
      goals: Array.isArray(result.goals) ? result.goals : undefined,
      additionalNotes: result.additionalNotes,
    };
  } catch (error) {
    console.error('Error extracting context from document:', error);
    
    // Fallback: return basic summary
    return {
      summary: 'Document uploaded successfully. Context extraction failed - please review manually.',
    };
  }
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
