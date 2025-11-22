"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface TrunkStepperProps {
  currentStep: number;
  totalSteps?: number; // Defaults to 2
  onNext?: () => void;
  onBack?: () => void;
  canGoNext?: boolean; // For validation - if false, disable Next button
  canGoBack?: boolean; // If false, hide/disable Back button
  isLoading?: boolean;
  submitButton?: ReactNode; // Submit button to render on last step (e.g., FormSubmitButton)
}

// Step indicator component - renders only the step indicator at the top
export function TrunkStepper({
  currentStep,
  totalSteps = 2,
}: {
  currentStep: number;
  totalSteps?: number;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                currentStep >= index
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-background text-muted-foreground"
              }`}
            >
              <span className="text-sm font-medium">{index + 1}</span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 w-12 transition-colors ${
                  currentStep > index ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Navigation buttons component - should be rendered separately at the bottom
export function TrunkStepperNavigation({
  currentStep,
  totalSteps = 2,
  onNext,
  onBack,
  canGoNext = true,
  canGoBack = true,
  isLoading = false,
  submitButton,
}: TrunkStepperProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-2">
        {!isFirstStep && canGoBack && onBack && (
          <Button
            type="button"
            variant="secondary-outline"
            onClick={onBack}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isLastStep && onNext && (
          <Button
            type="button"
            variant="secondary"
            onClick={onNext}
            disabled={isLoading || !canGoNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {isLastStep && submitButton}
      </div>
    </div>
  );
}

