'use client';

import { Button } from '@/components/ui/button';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isNextDisabled = false,
  isLoading = false,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex items-center justify-between pt-8 border-t border-n-200">
      <div>
        {!isFirstStep && (
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isLoading}
          >
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={isNextDisabled || isLoading}
          >
            {isLoading ? 'Creating Survey...' : 'Create Survey'}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
