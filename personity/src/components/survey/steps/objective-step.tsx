'use client';

import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { SURVEY_TEMPLATES } from '@/lib/templates/survey-templates';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function ObjectiveStep() {
  const { title, setTitle, objective, setObjective, setShowContextStep, setMode, loadTemplate, mode, modeConfidence } =
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
        // Detect mode
        const modeResponse = await fetch('/api/surveys/detect-mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objective }),
        });

        const modeData = await modeResponse.json();
        if (modeData.success) {
          setMode(modeData.mode, modeData.confidence, modeData.suggestedContextQuestions);
          setShowContextStep(modeData.suggestedContextQuestions.length > 0);
          setHasAnalyzed(true);
          lastAnalyzedObjective.current = objective;
          
          // Auto-generate a simple title from objective (no AI call)
          if (!title.trim()) {
            // Extract key topic and create a survey-style title
            let topic = objective
              .replace(/^(I want to |I'd like to |I need to |We want to |We need to |I'm trying to )/i, '')
              .replace(/^(understand |learn |know |find out |discover |explore |research |investigate )/i, '')
              .replace(/^(why |how |what |when |where |who |whether )/i, '')
              .split(/[.!?]/)[0]
              .trim();
            
            // Extract the main noun phrase (first ~5 words)
            const words = topic.split(/\s+/).slice(0, 6);
            topic = words.join(' ');
            
            // Create a proper survey title
            const formattedTitle = topic.charAt(0).toUpperCase() + topic.slice(1) + ' Survey';
            setTitle(formattedTitle.length > 60 ? formattedTitle.substring(0, 57) + '...' : formattedTitle);
          }
        }
      } catch (error) {
        console.error('Failed to analyze objective:', error);
        // Default to exploratory mode on error
        setMode('EXPLORATORY_GENERAL', 'LOW', []);
        setShowContextStep(false);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000); // Wait 2s after user stops typing (reduced API calls)

    return () => clearTimeout(timeoutId);
  }, [objective, title, setShowContextStep, setTitle]);

  return (
    <div>
      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
          Let's create your survey
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Give your survey a title and describe what you want to learn
        </p>
      </div>

      {/* Survey Title - Auto-generated, editable */}
      {title && (
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Survey Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Shopping Cart Abandonment Survey"
            className="
              w-full px-4 py-3 text-sm text-neutral-950 dark:text-neutral-50 bg-white dark:bg-zinc-800
              border border-neutral-300 dark:border-zinc-700 rounded-lg font-sans
              transition-all duration-150 ease-out
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              hover:border-neutral-400 dark:hover:border-zinc-600
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
            "
            maxLength={100}
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            This is what respondents will see. Edit if needed.
          </p>
        </div>
      )}

      {/* Example Templates */}
      {!objective && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Start with a template
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SURVEY_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => handleUseTemplate(template)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-zinc-900 border border-neutral-300 dark:border-zinc-700 rounded-md hover:border-primary hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors duration-150"
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
          className="block text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-2"
        >
          Research Objective
        </label>
        <textarea
          id="objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Example: I want to understand why users abandon their shopping carts and what would motivate them to complete their purchase."
          className="
            w-full min-h-[120px] px-4 py-4 text-sm text-neutral-950 dark:text-neutral-50 bg-white dark:bg-zinc-800
            border border-neutral-300 dark:border-zinc-700 rounded-lg resize-y font-sans leading-relaxed
            transition-all duration-150 ease-out
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
            hover:border-neutral-400 dark:hover:border-zinc-600
            focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          "
          rows={5}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
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

      {/* AI Analysis Result - Show detected mode */}
      {hasAnalyzed && !isAnalyzing && (
        <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Research Mode Detected: {' '}
                <span className="text-primary">
                  {mode === 'PRODUCT_DISCOVERY' && 'Product Discovery'}
                  {mode === 'FEEDBACK_SATISFACTION' && 'Feedback & Satisfaction'}
                  {mode === 'EXPLORATORY_GENERAL' && 'Exploratory Research'}
                </span>
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {mode === 'PRODUCT_DISCOVERY' && 'Your dashboard will focus on pain points, feature requests, and user segments.'}
                {mode === 'FEEDBACK_SATISFACTION' && 'Your dashboard will focus on satisfaction metrics, sentiment trends, and feedback analysis.'}
                {mode === 'EXPLORATORY_GENERAL' && 'Your dashboard will focus on key themes, insights, and open-ended discoveries.'}
                {useSurveyWizardStore.getState().showContextStep && ' Additional context required for better results.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
