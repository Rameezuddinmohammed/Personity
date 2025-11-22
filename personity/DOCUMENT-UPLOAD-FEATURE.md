# Document Upload Feature - Implementation Complete

## Overview
Added document upload capability to survey creation wizard, allowing creators to upload PDF, DOCX, or TXT files containing product specs, user personas, or research notes. AI automatically extracts structured context from documents.

## Features Implemented

### 1. Document Parser (`src/lib/documents/parser.ts`)
- Supports PDF, DOCX, and TXT files
- Max file size: 5MB
- Extracts text content from documents
- Cleans and normalizes text

### 2. AI Context Extractor (`src/lib/documents/context-extractor.ts`)
- Uses Azure OpenAI to extract structured context
- Identifies:
  - Product/service details
  - Target audience
  - Key features
  - Pain points
  - Goals and objectives
  - Additional relevant notes
- Formats context for display and AI consumption

### 3. Document Upload API (`src/app/api/documents/parse/route.ts`)
- Handles file upload via FormData
- Validates file type and size
- Parses document content
- Extracts structured context using AI
- Returns formatted context preview

### 4. Document Upload Component (`src/components/survey/document-upload.tsx`)
- Drag-and-drop upload interface
- Real-time processing with loading states
- Preview of extracted context
- Ability to remove uploaded document
- Clean, minimal UI following design system

### 5. Integration with Survey Wizard
- Added to Context Step (Step 2)
- Document context OR manual questions (not both required)
- Document context takes priority in master prompt
- Stored in database for future reference

## Database Changes Required

Add `documentContext` column to Survey table:

```sql
ALTER TABLE "Survey" 
ADD COLUMN "documentContext" TEXT;
```

## Dependencies Added
- `pdf-parse` - PDF text extraction
- `mammoth` - DOCX text extraction

## User Flow

1. **Upload Document** (Optional)
   - Creator uploads PDF/DOCX/TXT in Context Step
   - System parses document and extracts text
   - AI analyzes content and extracts structured context
   - Preview shown to creator

2. **Review Context**
   - Extracted context displayed in formatted view
   - Shows: Summary, Product Details, Target Audience, Features, Pain Points, Goals
   - Creator can remove and re-upload if needed

3. **Survey Creation**
   - Document context included in master prompt
   - Takes priority over manual context questions
   - AI interviewer uses this context during conversations

## Benefits

- **Faster Setup**: Upload existing docs instead of typing
- **Richer Context**: More detailed information for AI
- **Consistency**: Use same docs across multiple surveys
- **Efficiency**: Reuse product specs, personas, research notes

## Example Use Cases

1. **Product Manager**: Upload PRD to validate feature ideas
2. **Founder**: Upload pitch deck to test product-market fit
3. **Researcher**: Upload previous research report to build on findings
4. **Designer**: Upload user personas to guide conversation topics

## Technical Notes

- Document parsing happens server-side for security
- AI extraction uses GPT-4o with low temperature (0.3) for consistency
- Raw document content stored for future re-processing if needed
- Extracted context limited to 10,000 characters
- File uploads not stored permanently (only extracted text)

## Next Steps (Optional Enhancements)

1. **File Storage**: Store uploaded files in Supabase Storage for reference
2. **Re-extraction**: Allow re-processing documents with updated prompts
3. **Multiple Documents**: Support uploading multiple context documents
4. **Document Library**: Save frequently used documents for reuse
5. **Template Extraction**: Auto-generate survey templates from documents
