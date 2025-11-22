/**
 * Document Parse API
 * 
 * Handles document upload, parsing, and context extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseDocument, validateFileSize, validateFileType } from '@/lib/documents/parser';
import { extractContextFromDocument } from '@/lib/documents/context-extractor';
import { formatExtractedContext } from '@/lib/documents/format-context';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const researchObjective = formData.get('researchObjective') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!researchObjective) {
      return NextResponse.json(
        { success: false, error: 'Research objective is required' },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileType(file)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    if (!validateFileSize(file)) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Parse document
    const parsedDoc = await parseDocument(file);

    // Extract context using AI
    const extractedContext = await extractContextFromDocument(
      parsedDoc.content,
      researchObjective
    );

    // Format for display
    const formattedContext = formatExtractedContext(extractedContext);

    return NextResponse.json({
      success: true,
      data: {
        fileName: parsedDoc.fileName,
        fileType: parsedDoc.fileType,
        wordCount: parsedDoc.wordCount,
        rawContent: parsedDoc.content,
        extractedContext: formattedContext,
      },
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse document' 
      },
      { status: 500 }
    );
  }
}
