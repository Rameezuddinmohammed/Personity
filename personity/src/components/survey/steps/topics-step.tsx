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
        <h2 className="text-xl font-semibold text-n-950 mb-2">
          What topics do you want to explore?
        </h2>
        <p className="text-sm text-n-600 leading-relaxed">
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
                flex-1 px-4 py-3 text-sm text-n-950 bg-white
                border border-n-300 rounded-lg
                transition-all duration-150 ease-out
                placeholder:text-n-400
                hover:border-n-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              "
            />
            {canRemove && (
              <button
                type="button"
                onClick={() => removeTopic(index)}
                className="
                  w-9 h-9 flex items-center justify-center
                  rounded-md text-n-500 transition-all duration-150 ease-out
                  hover:bg-n-100 hover:text-error
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
            bg-transparent border border-dashed border-n-300 rounded-lg
            transition-all duration-150 ease-out
            hover:border-primary hover:bg-primary/5
          "
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      )}

      {/* Validation Message */}
      <div className="mt-6 p-4 bg-n-50 rounded-lg border border-n-200">
        <p className="text-xs text-n-600">
          <span className="font-medium text-n-700">
            {validTopics.length} of 2-10 topics
          </span>
          {validTopics.length < 2 && (
            <span className="text-error ml-2">
              (Add at least {2 - validTopics.length} more)
            </span>
          )}
          {validTopics.length >= 2 && (
            <span className="text-success ml-2">(Ready to proceed)</span>
          )}
        </p>
      </div>
    </div>
  );
}
