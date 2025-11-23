'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { Plus, X } from 'lucide-react';

export function TopicsStep() {
  const { topics, updateTopic, addTopic, removeTopic } =
    useSurveyWizardStore();

  const validTopics = topics.filter((t) => t.trim().length > 0);
  const canAddMore = topics.length < 10;
  const canRemove = topics.length > 2;

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
          What topics do you want to explore?
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          List 2-10 key topics or areas you want the AI to cover in the
          conversation. The AI will ensure all topics are discussed.
        </p>
      </div>

      {/* Topics List */}
      <div className="flex flex-col gap-3 mb-4">
        {topics.map((topic, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => updateTopic(index, e.target.value)}
              placeholder={`Topic ${index + 1}`}
              className="
                flex-1 px-4 py-3 text-sm text-neutral-950 dark:text-neutral-50 bg-white dark:bg-zinc-800
                border border-neutral-300 dark:border-zinc-700 rounded-lg
                transition-all duration-150 ease-out
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                hover:border-neutral-400 dark:hover:border-zinc-600
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              "
            />
            {canRemove && (
              <button
                type="button"
                onClick={() => removeTopic(index)}
                className="
                  w-9 h-9 flex items-center justify-center
                  rounded-md text-neutral-500 dark:text-neutral-400 transition-all duration-150 ease-out
                  hover:bg-neutral-100 dark:hover:bg-zinc-800 hover:text-red-600 dark:hover:text-red-400
                "
                aria-label="Remove topic"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Topic Button */}
      {canAddMore && (
        <button
          type="button"
          onClick={addTopic}
          className="
            inline-flex items-center gap-2 px-4 py-2
            text-[13px] font-medium text-primary
            bg-transparent border border-dashed border-neutral-300 dark:border-zinc-700 rounded-lg
            transition-all duration-150 ease-out
            hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10
          "
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      )}

      {/* Validation Message */}
      <div className="mt-6 p-4 bg-neutral-50 dark:bg-zinc-800 rounded-lg border border-neutral-200 dark:border-zinc-700">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {validTopics.length} of 2-10 topics
          </span>
          {validTopics.length < 2 && (
            <span className="text-red-600 dark:text-red-400 ml-2">
              (Add at least {2 - validTopics.length} more)
            </span>
          )}
          {validTopics.length >= 2 && (
            <span className="text-green-600 dark:text-green-400 ml-2">(Ready to proceed)</span>
          )}
        </p>
      </div>
    </div>
  );
}
