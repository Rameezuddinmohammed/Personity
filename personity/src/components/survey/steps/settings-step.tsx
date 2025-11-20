'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';

export function SettingsStep() {
  const { settings, setSettings } = useSurveyWizardStore();

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-n-950 mb-2">
          Configure conversation settings
        </h2>
        <p className="text-sm text-n-600 leading-relaxed">
          Customize how the AI conducts conversations with your respondents.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversation Length */}
        <div>
          <label
            htmlFor="length"
            className="block text-[13px] font-medium text-n-700 mb-2"
          >
            Conversation Length
          </label>
          <div className="relative">
            <select
              id="length"
              value={settings.length}
              onChange={(e) =>
                setSettings({
                  length: e.target.value as 'quick' | 'standard' | 'deep',
                })
              }
              className="
                w-full px-4 py-3 pr-10 text-sm text-n-950 bg-white
                border border-n-300 rounded-lg cursor-pointer
                appearance-none
                transition-all duration-150 ease-out
                hover:border-n-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              "
            >
              <option value="quick">Quick (5-7 questions)</option>
              <option value="standard">Standard (8-12 questions)</option>
              <option value="deep">Deep (13-20 questions)</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p className="text-xs text-n-500 mt-2">
            Estimated completion time varies by length
          </p>
        </div>

        {/* Conversation Tone */}
        <div>
          <label
            htmlFor="tone"
            className="block text-[13px] font-medium text-n-700 mb-2"
          >
            Conversation Tone
          </label>
          <div className="relative">
            <select
              id="tone"
              value={settings.tone}
              onChange={(e) =>
                setSettings({
                  tone: e.target.value as
                    | 'professional'
                    | 'friendly'
                    | 'casual',
                })
              }
              className="
                w-full px-4 py-3 pr-10 text-sm text-n-950 bg-white
                border border-n-300 rounded-lg cursor-pointer
                appearance-none
                transition-all duration-150 ease-out
                hover:border-n-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              "
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-n-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <p className="text-xs text-n-500 mt-2">
            How the AI should communicate
          </p>
        </div>
      </div>

      {/* Stop Condition */}
      <div className="mt-6">
        <label className="block text-[13px] font-medium text-n-700 mb-3">
          When should the conversation end?
        </label>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 p-4 border border-n-300 rounded-lg cursor-pointer transition-all duration-150 hover:border-n-400 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="stopCondition"
              value="topics_covered"
              checked={settings.stopCondition === 'topics_covered'}
              onChange={(e) =>
                setSettings({ stopCondition: 'topics_covered' })
              }
              className="mt-0.5 w-4 h-4 text-primary border-n-300 focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-n-950">
                When all topics are covered
              </div>
              <div className="text-xs text-n-600 mt-1">
                AI decides when sufficient depth is reached on all topics
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-n-300 rounded-lg cursor-pointer transition-all duration-150 hover:border-n-400 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="stopCondition"
              value="questions"
              checked={settings.stopCondition === 'questions'}
              onChange={(e) => setSettings({ stopCondition: 'questions' })}
              className="mt-0.5 w-4 h-4 text-primary border-n-300 focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-n-950">
                After a specific number of questions
              </div>
              <div className="text-xs text-n-600 mt-1">
                Set a maximum number of questions to ask
              </div>
            </div>
          </label>
        </div>

        {/* Max Questions Input */}
        {settings.stopCondition === 'questions' && (
          <div className="mt-4 ml-7">
            <label
              htmlFor="maxQuestions"
              className="block text-[13px] font-medium text-n-700 mb-2"
            >
              Maximum Questions
            </label>
            <input
              type="number"
              id="maxQuestions"
              min="5"
              max="30"
              value={settings.maxQuestions || ''}
              onChange={(e) =>
                setSettings({
                  maxQuestions: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 15"
              className="
                w-full max-w-[200px] px-4 py-3 text-sm text-n-950 bg-white
                border border-n-300 rounded-lg
                transition-all duration-150 ease-out
                placeholder:text-n-400
                hover:border-n-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              "
            />
          </div>
        )}
      </div>
    </div>
  );
}
