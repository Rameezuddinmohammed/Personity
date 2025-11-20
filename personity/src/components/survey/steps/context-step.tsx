'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';

export function ContextStep() {
  const { context, setContext } = useSurveyWizardStore();

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-n-950 mb-2">
          Provide additional context
        </h2>
        <p className="text-sm text-n-600 leading-relaxed">
          Help the AI understand your product and users better. All fields are
          optional but provide richer conversations.
        </p>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-6">
        {/* Product Description */}
        <div>
          <label
            htmlFor="productDescription"
            className="block text-[13px] font-medium text-n-700 mb-2"
          >
            Product Description
          </label>
          <textarea
            id="productDescription"
            value={context.productDescription || ''}
            onChange={(e) =>
              setContext({ productDescription: e.target.value })
            }
            placeholder="Describe your product, service, or feature..."
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

        {/* User Info */}
        <div>
          <label
            htmlFor="userInfo"
            className="block text-[13px] font-medium text-n-700 mb-2"
          >
            Target User Information
          </label>
          <textarea
            id="userInfo"
            value={context.userInfo || ''}
            onChange={(e) => setContext({ userInfo: e.target.value })}
            placeholder="Who are your target users? What are their characteristics?"
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

        {/* Known Issues */}
        <div>
          <label
            htmlFor="knownIssues"
            className="block text-[13px] font-medium text-n-700 mb-2"
          >
            Known Issues or Pain Points
          </label>
          <textarea
            id="knownIssues"
            value={context.knownIssues || ''}
            onChange={(e) => setContext({ knownIssues: e.target.value })}
            placeholder="Any known problems or areas of concern you want to explore?"
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
      </div>
    </div>
  );
}
