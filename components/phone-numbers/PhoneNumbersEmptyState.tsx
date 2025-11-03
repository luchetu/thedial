"use client";

import { Smartphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhoneNumbersEmptyStateProps {
  onAddPhoneNumber: () => void;
}

export function PhoneNumbersEmptyState({
  onAddPhoneNumber,
}: PhoneNumbersEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-12">
      {/* Large Icon */}
      <div className="mb-8">
        <Smartphone className="h-20 w-20 text-muted-foreground/60" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold mb-4">Phone Numbers</h1>

      {/* Description */}
      <div className="max-w-lg space-y-3 mb-10">
        <p className="text-muted-foreground text-base">
          Get a phone number to start recording, transcribing, and managing all
          your calls with AI.
        </p>
        <p className="text-muted-foreground text-base">
          Buy a new number or port your existing number to Dialer for seamless call management.
        </p>
      </div>

      {/* Action Button */}
      <Button onClick={onAddPhoneNumber} size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Add Phone Number
      </Button>
    </div>
  );
}

