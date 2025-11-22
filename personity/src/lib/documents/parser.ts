/**
 * Document Parser
 * 
 * Extracts text content from uploaded documents (PDF, DOCX, TXT)
 */

export type SupportedFileType = 'pdf' | 'docx' | 'txt';

export interface ParsedDocument {
  content: string;
  wordCount: number;
  fileType: SupportedFileType;
  fileName: string;
}

/**
 * Parse uploaded document and extract text content
 */
export async function parseDocument(
  file: File
): Promise<ParsedDocument> {
  const fileType = getFileType(file.name);
  
  if (!fileType) {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
  }

  let content: string;

  switch (fileType) {
    case 'pdf':
      content = await parsePDF(file);
      break;
    case 'docx':
      content = await parseDOCX(file);
      break;
    case 'txt':
      content = await parseTXT(file);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  // Clean up content
  content = cleanText(content);

  return {
    content,
    wordCount: content.split(/\s+/).length,
    fileType,
    fileName: file.name,
  };
}

/**
 * Parse PDF file
 */
async function parsePDF(file: File): Promise<string> {
  // Use require for CommonJS library
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Parse DOCX file
 */
async function parseDOCX(file: File): Promise<string> {
  // Use require for CommonJS library
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mammoth = require('mammoth') as { extractRawText: (options: { buffer: Buffer }) => Promise<{ value: string }> };
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Parse TXT file
 */
async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

/**
 * Get file type from filename
 */
function getFileType(fileName: string): SupportedFileType | null {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx' || extension === 'doc') return 'docx';
  if (extension === 'txt') return 'txt';
  
  return null;
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\s{2,}/g, ' ') // Remove excessive spaces
    .trim();
}

/**
 * Validate file size (max 5MB)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return file.size <= maxSize;
}

/**
 * Validate file type
 */
export function validateFileType(file: File): boolean {
  return getFileType(file.name) !== null;
}
