'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';

export function DocumentUpload() {
  const { objective, documentContext, setDocumentContext } = useSurveyWizardStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('researchObjective', objective);

      const response = await fetch('/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to parse document');
      }

      setDocumentContext({
        fileName: result.data.fileName,
        extractedContext: result.data.extractedContext,
        rawContent: result.data.rawContent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setDocumentContext(undefined);
    setError(null);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!documentContext && (
        <div>
          <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Upload Context Document (Optional)
          </label>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
            Upload a PDF, DOCX, or TXT file with product specs, user personas, or research notes. 
            AI will extract relevant context automatically.
          </p>

          <div
            onClick={handleBrowse}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-all duration-150
              ${isUploading 
                ? 'border-neutral-300 bg-neutral-50 dark:bg-zinc-800 dark:border-zinc-700 cursor-not-allowed' 
                : 'border-neutral-300 bg-white dark:bg-zinc-900 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-neutral-700 dark:text-neutral-300">Processing document...</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Extracting context with AI</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                <div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    PDF, DOCX, or TXT (max 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Document Preview */}
      {documentContext && (
        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  {documentContext.fileName}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Context extracted successfully
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded transition-colors"
              title="Remove document"
            >
              <X className="w-4 h-4 text-green-700 dark:text-green-400" />
            </button>
          </div>

          {/* Extracted Context Preview */}
          <div>
            <label className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Extracted Context
            </label>
            <div className="p-4 bg-neutral-50 dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-lg">
              <div className="prose prose-sm max-w-none">
                {documentContext.extractedContext.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <h4 key={i} className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.startsWith('•')) {
                    return (
                      <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300 ml-4 mb-1">
                        {line}
                      </p>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              This context will be used by the AI to conduct more informed conversations with respondents.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
