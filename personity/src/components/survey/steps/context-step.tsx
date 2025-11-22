'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { DocumentUpload } from '../document-upload';

export function ContextStep() {
  const { context, setContext, mode, suggestedContextQuestions } = useSurveyWizardStore();

  // Use suggested questions or fallback to defaults
  const questions = suggestedContextQuestions.length > 0 
    ? suggestedContextQuestions 
    : [
        'What is your product or service?',
        'Who is your target audience?',
        'What are you hoping to learn?',
      ];

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-n-950 mb-2">
          Provide additional context
        </h2>
        <p className="text-sm text-n-600 leading-relaxed">
          {mode === 'PRODUCT_DISCOVERY' && 'Help the AI understand your product and target users better.'}
          {mode === 'FEEDBACK_SATISFACTION' && 'Provide context about what you\'re evaluating and any known concerns.'}
          {mode === 'EXPLORATORY_GENERAL' && 'Share background information to help guide the conversation.'}
        </p>
      </div>

      {/* Document Upload */}
      <div className="mb-8">
        <DocumentUpload />
      </div>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-n-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-n-500">Or answer these questions</span>
        </div>
      </div>

      {/* Dynamic Form Fields based on suggested questions */}
      <div className="flex flex-col gap-6">
        {questions.slice(0, 4).map((question, index) => {
          // Map index to context field
          const getFieldValue = () => {
            switch (index) {
              case 0: return context.productDescription || '';
              case 1: return context.userInfo || '';
              case 2: return context.knownIssues || '';
              case 3: return context.additional || '';
              default: return '';
            }
          };

          const handleChange = (value: string) => {
            switch (index) {
              case 0: setContext({ productDescription: value }); break;
              case 1: setContext({ userInfo: value }); break;
              case 2: setContext({ knownIssues: value }); break;
              case 3: setContext({ additional: value }); break;
            }
          };

          return (
            <div key={index}>
              <label
                htmlFor={`context-${index}`}
                className="block text-[13px] font-medium text-n-700 mb-2"
              >
                {question}
              </label>
              <textarea
                id={`context-${index}`}
                value={getFieldValue()}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Your answer..."
                className="
                  w-full min-h-[100px] px-4 py-4 text-sm text-n-950 bg-white
                  border border-n-300 rounded-lg resize-y font-sans leading-relaxed
                  transition-all duration-150 ease-out
                  placeholder:text-n-400
                  hover:border-n-400
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                "
                rows={4}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
