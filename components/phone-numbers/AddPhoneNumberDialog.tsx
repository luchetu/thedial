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
import { VerifyPhoneNumberForm } from "./forms/VerifyPhoneNumberForm";
import { ShoppingCart, ArrowRight, Smartphone } from "lucide-react";

export type PhoneNumberOption = "buy" | "port" | "verify";

interface AddPhoneNumberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOption?: PhoneNumberOption;
  mode?: "all" | "port-only";
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
    id: "verify" as const,
    title: "Add Existing Number",
    description: "Add your existing number (verification required)",
    icon: Smartphone,
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
  initialOption = "buy",
  mode = "all",
}: AddPhoneNumberDialogProps) {
  const [selectedOption, setSelectedOption] =
    useState<PhoneNumberOption>(initialOption);

  // Reset to initial option when dialog opens/closes
  useEffect(() => {
    // When dialog is closed, reset selection back to the initial option after
    // a short delay so the close animation can finish.
    if (!open) {
      const timer = setTimeout(
        () => setSelectedOption(initialOption),
        200,
      );
      return () => clearTimeout(timer);
    }
  }, [open, initialOption]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const getActionButtonText = useCallback((option: PhoneNumberOption) => {
    switch (option) {
      case "buy":
        return "Buy Number";
      case "verify":
        return "Add Number";
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

  const effectiveOption: PhoneNumberOption =
    mode === "port-only" ? "port" : selectedOption;

  const showOptions = mode !== "port-only";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "port-only" ? "Port Existing Number" : "Add Phone Number"}
          </DialogTitle>
          <DialogDescription>
            {mode === "port-only"
              ? "Bring your existing phone number to Dial. You'll need your account information from your current carrier."
              : "Choose how you want to add a phone number to Dial."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto flex-1 pr-2">
          {/* Left: Options */}
          {showOptions && (
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
          )}

          {/* Right: Form */}
          <div className={showOptions ? "border-l border-muted pl-6 pr-2" : ""}>
            {effectiveOption === "buy" && (
              <BuyPhoneNumberForm onSuccess={() => onOpenChange(false)} />
            )}
            {effectiveOption === "verify" && <VerifyPhoneNumberForm />}
            {effectiveOption === "port" && <PortPhoneNumberForm />}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="secondary" className="text-white" onClick={handleAction}>
            {getActionButtonText(effectiveOption)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

