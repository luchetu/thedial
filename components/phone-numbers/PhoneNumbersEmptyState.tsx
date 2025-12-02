"use client";

import { Smartphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhoneNumbersEmptyStateProps {
  onAddPhoneNumber: () => void;
  title?: string;
  description?: string;
  secondaryDescription?: string;
  ctaLabel?: string;
}

export function PhoneNumbersEmptyState({
  onAddPhoneNumber,
  title,
  description,
  secondaryDescription,
  ctaLabel,
}: PhoneNumbersEmptyStateProps) {
  const heading = title ?? "Phone Numbers";
  const primaryText =
    description ??
    "Get a phone number to start recording, transcribing, and managing all your calls with AI.";
  const secondaryText =
    secondaryDescription ??
    "Buy a new number or port your existing number to Dial for seamless call management.";
  const buttonLabel = ctaLabel ?? "Add Phone Number";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-12">
      {/* Large Icon */}
      <div className="mb-8">
        <Smartphone className="h-20 w-20 text-muted-foreground/60" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold mb-4">{heading}</h1>

      {/* Description */}
      <div className="max-w-lg space-y-3 mb-10">
        <p className="text-muted-foreground text-base">{primaryText}</p>
        {secondaryText && (
          <p className="text-muted-foreground text-base">{secondaryText}</p>
        )}
      </div>

      {/* Action Button */}
      <Button
        variant="secondary"
        className="gap-2 text-white"
        onClick={onAddPhoneNumber}
        size="lg"
      >
        <Plus className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  );
}

