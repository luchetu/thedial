"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneNumberOptionCard } from "./PhoneNumberOptionCard";
import { BuyPhoneNumberForm } from "./forms/BuyPhoneNumberForm";
import { PortPhoneNumberForm } from "./forms/PortPhoneNumberForm";
import { ShoppingCart, ArrowRight } from "lucide-react";

export type PhoneNumberOption = "buy" | "port";

interface AddPhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PHONE_NUMBER_OPTIONS = [
  {
    id: "buy" as const,
    title: "Buy Phone Number",
    description: "Purchase a new phone number",
    icon: ShoppingCart,
    badge: undefined,
  },
  {
    id: "port" as const,
    title: "Port Existing Number",
    description: "Bring your existing number to Dialer",
    icon: ArrowRight,
    badge: "Beta",
  },
] as const;

export function AddPhoneNumberDialog({
  open,
  onOpenChange,
}: AddPhoneNumberDialogProps) {
  const [selectedOption, setSelectedOption] =
    useState<PhoneNumberOption>("buy");

  // Reset to default option when dialog closes
  useEffect(() => {
    if (!open) {
      // Small delay to allow dialog close animation
      const timer = setTimeout(() => setSelectedOption("buy"), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const getActionButtonText = useCallback((option: PhoneNumberOption) => {
    switch (option) {
      case "buy":
        return "Buy Number";
      case "port":
        return "Start Port";
      default:
        return "Continue";
    }
  }, []);

  const handleAction = useCallback(() => {
    // Form components will handle their own submission via context or props
    // This is just a placeholder for now
    console.log("Action triggered for:", selectedOption);
  }, [selectedOption]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Phone Number</DialogTitle>
          <DialogDescription>
            Choose how you want to add a phone number to Dialer
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto flex-1 pr-2">
          {/* Left: Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium mb-3">Phone Number Options</h3>
            {PHONE_NUMBER_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <PhoneNumberOptionCard
                  key={option.id}
                  id={option.id}
                  title={option.title}
                  description={option.description}
                  icon={Icon}
                  isSelected={selectedOption === option.id}
                  onSelect={() => setSelectedOption(option.id)}
                  badge={option.badge}
                />
              );
            })}
          </div>

          {/* Right: Form */}
          <div className="border-l border-muted pl-6 pr-2">
            {selectedOption === "buy" && <BuyPhoneNumberForm />}
            {selectedOption === "port" && <PortPhoneNumberForm />}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAction}>
            {getActionButtonText(selectedOption)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

