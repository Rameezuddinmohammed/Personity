/**
 * Gemini 3 Pro Client
 * For AI-powered report generation
 */

import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export interface GeminiGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  thinkingLevel?: 'low' | 'high';
}

/**
 * Generate content using Gemini 3 Pro
 */
export async function generateWithGemini(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string> {
  const {
    temperature = 1.0, // Gemini 3 default - strongly recommended
    maxTokens = 8000,
    thinkingLevel = 'high', // Use high for complex reasoning
  } = options;

  try {
    // Use gemini-2.0-flash-exp for free tier, or gemini-3-pro-preview for paid
    const model = process.env.GEMINI_USE_FREE_TIER === 'true' 
      ? 'gemini-2.0-flash-exp' 
      : 'gemini-3-pro-preview';
    
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        // @ts-ignore - thinkingLevel is a Gemini 3 parameter
        thinkingLevel,
      },
    });

    return response.text || '';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate structured JSON output using Gemini 3 Pro
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: any,
  options: GeminiGenerateOptions = {}
): Promise<T> {
  const {
    temperature = 1.0,
    maxTokens = 8000,
    thinkingLevel = 'high',
  } = options;

  try {
    // Use gemini-2.0-flash-exp for free tier, or gemini-3-pro-preview for paid
    const model = process.env.GEMINI_USE_FREE_TIER === 'true' 
      ? 'gemini-2.0-flash-exp' 
      : 'gemini-3-pro-preview';
    
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
        // @ts-ignore - thinkingLevel is a Gemini 3 parameter
        thinkingLevel,
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate structured output with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
