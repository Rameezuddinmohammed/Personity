'use client';

import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  steps: Array<{
    number: number;
    label: string;
  }>;
}

export function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  // Find the index of the current step in the visible steps array
  const currentStepIndex = steps.findIndex((step) => step.number === currentStep);
  const progressPercentage = currentStepIndex >= 0 
    ? (currentStepIndex / (steps.length - 1)) * 100 
    : 0;

  // Calculate the width percentage for the connector line
  // It should span from first button center to last button center
  const lineWidthPercentage = steps.length > 1 
    ? ((steps.length - 1) / steps.length) * 100 
    : 0;
  const lineLeftOffset = steps.length > 1 
    ? (1 / steps.length) * 50 
    : 0;

  return (
    <div className="relative mb-16">
      {/* Connector Line Background - spans from first to last button center */}
      <div 
        className="absolute top-5 h-[2px] bg-neutral-200 z-0" 
        style={{
          left: `${lineLeftOffset}%`,
          right: `${lineLeftOffset}%`,
        }}
      />
      
      {/* Progress Line - fills from first button center */}
      <div
        className="absolute top-5 h-[2px] bg-blue-600 z-0 transition-all duration-500 ease-out"
        style={{
          left: `${lineLeftOffset}%`,
          width: `${(progressPercentage / 100) * lineWidthPercentage}%`,
        }}
      />

      {/* Steps */}
      <div className="relative z-10 flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          // Display sequential numbers (1, 2, 3, 4) instead of actual step numbers
          const displayNumber = index + 1;

          return (
            <div
              key={step.number}
              className="flex flex-col items-center gap-3"
            >
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  text-sm font-semibold transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                      : 'bg-white border-2 border-neutral-300 text-neutral-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  displayNumber
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-sm font-medium transition-colors duration-200
                  ${
                    isActive
                      ? 'text-neutral-950'
                      : isCompleted
                      ? 'text-neutral-700'
                      : 'text-neutral-400'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
