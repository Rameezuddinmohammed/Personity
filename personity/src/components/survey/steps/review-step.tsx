'use client';

import { useState } from 'react';
import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { Button } from '@/components/ui/button';
import { TestConversation } from '../test-conversation';

export function ReviewStep() {
  const { objective, context, topics, settings, showContextStep } =
    useSurveyWizardStore();
  const [showTestMode, setShowTestMode] = useState(false);

  const validTopics = topics.filter((t) => t.trim().length > 0);

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
          Review your survey
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Review your survey configuration before creating it. You can go back to
          make changes if needed.
        </p>
      </div>

      {/* Review Sections */}
      <div className="flex flex-col gap-6">
        {/* Objective */}
        <div className="p-6 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
          <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
            Research Objective
          </h3>
          <p className="text-sm text-neutral-950 dark:text-neutral-50 leading-relaxed">{objective}</p>
        </div>

        {/* Context (if provided) */}
        {showContextStep &&
          (context.productDescription ||
            context.userInfo ||
            context.knownIssues) && (
            <div className="p-6 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
              <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
                Additional Context
              </h3>
              <div className="flex flex-col gap-4">
                {context.productDescription && (
                  <div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Product Description
                    </div>
                    <p className="text-sm text-neutral-950 dark:text-neutral-50 leading-relaxed">
                      {context.productDescription}
                    </p>
                  </div>
                )}
                {context.userInfo && (
                  <div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Target Users
                    </div>
                    <p className="text-sm text-neutral-950 dark:text-neutral-50 leading-relaxed">
                      {context.userInfo}
                    </p>
                  </div>
                )}
                {context.knownIssues && (
                  <div>
                    <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Known Issues
                    </div>
                    <p className="text-sm text-neutral-950 dark:text-neutral-50 leading-relaxed">
                      {context.knownIssues}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Topics */}
        <div className="p-6 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
          <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
            Topics to Explore ({validTopics.length})
          </h3>
          <ul className="flex flex-col gap-2">
            {validTopics.map((topic, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-neutral-950 dark:text-neutral-50"
              >
                <span className="text-neutral-500 dark:text-neutral-400 mt-0.5">•</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Settings */}
        <div className="p-6 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
          <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-3">
            Conversation Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Length</div>
              <p className="text-sm text-neutral-950 dark:text-neutral-50 capitalize">{settings.length}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Tone</div>
              <p className="text-sm text-neutral-950 dark:text-neutral-50 capitalize">{settings.tone}</p>
            </div>
            <div className="col-span-2">
              <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Stop Condition
              </div>
              <p className="text-sm text-neutral-950 dark:text-neutral-50">
                {settings.stopCondition === 'topics_covered'
                  ? 'When all topics are covered'
                  : `After ${settings.maxQuestions || 'N/A'} questions`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Section */}
      <div className="mt-8 p-6 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-1">
              Test Your Survey
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Try out the conversation before creating the survey. This won't
              count towards your usage limits.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTestMode(!showTestMode)}
          >
            {showTestMode ? 'Close Test' : 'Start Test'}
          </Button>
        </div>

        {showTestMode && (
          <div className="mt-4">
            <TestConversation
              objective={objective}
              context={showContextStep ? context : undefined}
              topics={validTopics}
              settings={settings}
            />
          </div>
        )}
      </div>

      {/* Info Box */}
      {!showTestMode && (
        <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Once created, you'll receive a unique survey link to share with
            respondents. You can test the survey before sharing it publicly.
          </p>
        </div>
      )}
    </div>
  );
}
