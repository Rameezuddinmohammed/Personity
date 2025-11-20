'use client';

import { useState } from 'react';
import { useSurveyWizardStore } from '@/lib/stores/survey-wizard-store';
import { WizardProgress } from './wizard-progress';
import { WizardNavigation } from './wizard-navigation';
import { ObjectiveStep } from './steps/objective-step';
import { ContextStep } from './steps/context-step';
import { TopicsStep } from './steps/topics-step';
import { SettingsStep } from './steps/settings-step';
import { ReviewStep } from './steps/review-step';

const WIZARD_STEPS = [
  { number: 1, label: 'Objective' },
  { number: 2, label: 'Context' },
  { number: 3, label: 'Topics' },
  { number: 4, label: 'Settings' },
  { number: 5, label: 'Review' },
];

export function SurveyWizard() {
  const {
    currentStep,
    objective,
    topics,
    showContextStep,
    nextStep,
    previousStep,
  } = useSurveyWizardStore();

  // Determine which steps to show in progress indicator
  const visibleSteps = showContextStep
    ? WIZARD_STEPS
    : WIZARD_STEPS.filter((step) => step.number !== 2);

  // Validation for each step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return objective.trim().length > 0;
      case 2:
        return true; // Context is optional
      case 3:
        const validTopics = topics.filter((t) => t.trim().length > 0);
        return validTopics.length >= 2 && validTopics.length <= 10;
      case 4:
        return true; // Settings have defaults
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const state = useSurveyWizardStore.getState();
      
      // Filter out empty topics
      const validTopics = state.topics.filter((t) => t.trim().length > 0);

      // Generate title from objective (first 100 chars)
      const title = state.objective.substring(0, 100);

      // Prepare context - only include if there's actual content
      let contextData = undefined;
      if (state.showContextStep) {
        const hasContent = 
          state.context.productDescription?.trim() ||
          state.context.userInfo?.trim() ||
          state.context.knownIssues?.trim();
        
        if (hasContent) {
          contextData = {
            ...(state.context.productDescription?.trim() && { 
              productDescription: state.context.productDescription.trim() 
            }),
            ...(state.context.userInfo?.trim() && { 
              userInfo: state.context.userInfo.trim() 
            }),
            ...(state.context.knownIssues?.trim() && { 
              knownIssues: state.context.knownIssues.trim() 
            }),
          };
        }
      }

      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          objective: state.objective,
          mode: state.mode,
          ...(contextData && { context: contextData }),
          topics: validTopics,
          settings: state.settings,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error('Survey creation error:', data);
        if (data.details) {
          console.error('Validation details:', data.details);
        }
        throw new Error(data.error || 'Failed to create survey');
      }

      // Redirect to survey detail page
      window.location.href = `/surveys/${data.data.id}`;
    } catch (err) {
      console.error('Error creating survey:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create survey'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-n-50 py-10">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="bg-white rounded-2xl p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Progress Indicator */}
          <WizardProgress currentStep={currentStep} steps={visibleSteps} />

          {/* Step Content */}
          <div className="mb-10">
            {currentStep === 1 && <ObjectiveStep />}
            {currentStep === 2 && showContextStep && <ContextStep />}
            {currentStep === 3 && <TopicsStep />}
            {currentStep === 4 && <SettingsStep />}
            {currentStep === 5 && <ReviewStep />}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={5}
            onPrevious={previousStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
            isNextDisabled={!isStepValid()}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
