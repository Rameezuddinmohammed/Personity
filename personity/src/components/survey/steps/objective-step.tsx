'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { SURVEY_TEMPLATES } from '@/lib/templates/survey-templates';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function ObjectiveStep() {
  const { objective, setObjective, setShowContextStep, loadTemplate } =
    useSurveyWizardStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const lastAnalyzedObjective = useRef<string>('');

  const handleUseTemplate = (template: typeof SURVEY_TEMPLATES[0]) => {
    loadTemplate({
      objective: template.objective,
      topics: template.topics,
    });
  };

  // Debounce and analyze objective - only once when user finishes typing
  useEffect(() => {
    // Skip if objective too short
    if (objective.length < 20) {
      setHasAnalyzed(false);
      lastAnalyzedObjective.current = '';
      return;
    }

    // Skip if we already analyzed this exact objective
    if (lastAnalyzedObjective.current === objective) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/surveys/detect-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objective }),
        });

        const data = await response.json();
        if (data.success) {
          setShowContextStep(data.data.needsContext);
          setHasAnalyzed(true);
          lastAnalyzedObjective.current = objective;
        }
      } catch (error) {
        console.error('Failed to analyze objective:', error);
        // Default to not showing context step on error
        setShowContextStep(false);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000); // Wait 2s after user stops typing (reduced API calls)

    return () => clearTimeout(timeoutId);
  }, [objective, setShowContextStep]);

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-n-950 mb-2">
          What's your research objective?
        </h2>
        <p className="text-sm text-n-600 leading-relaxed">
          Describe what you want to learn from your respondents. Be specific about
          your goals and what insights you're seeking.
        </p>
      </div>

      {/* Example Templates */}
      {!objective && (
        <div className="mb-6 p-4 bg-n-50 border border-n-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-n-700">
              Start with a template
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SURVEY_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => handleUseTemplate(template)}
                className="px-3 py-1.5 text-xs font-medium text-n-700 bg-white border border-n-300 rounded-md hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors duration-150"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Field */}
      <div>
        <label
          htmlFor="objective"
          className="block text-[13px] font-medium text-n-700 mb-2"
        >
          Research Objective
        </label>
        <textarea
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Example: I want to understand why users abandon their shopping carts and what would motivate them to complete their purchase."
          className="
            w-full min-h-[120px] px-4 py-4 text-sm text-n-950 bg-white
            border border-n-300 rounded-lg resize-y font-sans leading-relaxed
            transition-all duration-150 ease-out
            placeholder:text-n-400
            hover:border-n-400
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          "
          rows={5}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-n-500">
            Tip: A clear objective helps the AI ask better questions
          </p>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Result - Only show if context is recommended */}
      {hasAnalyzed && !isAnalyzing && useSurveyWizardStore.getState().showContextStep && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-n-700">
            <span className="font-medium">AI Analysis:</span> Based on your
            objective, we recommend providing additional context in the next step.
          </p>
        </div>
      )}
    </div>
  );
}
