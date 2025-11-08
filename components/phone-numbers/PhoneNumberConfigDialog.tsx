"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  updatePhoneNumberFriendlyName, 
  updatePhoneNumberForwarding,
  updatePhoneNumberAIAssistant,
  getPhoneNumber 
} from "@/features/phone-numbers/api";
import type { UserPhoneNumber } from "@/features/phone-numbers/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface PhoneNumberConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: UserPhoneNumber | null;
}

export function PhoneNumberConfigDialog({
  open,
  onOpenChange,
  phoneNumber,
}: PhoneNumberConfigDialogProps) {
  const queryClient = useQueryClient();
  const [friendlyName, setFriendlyName] = useState("");
  const [forwardingEnabled, setForwardingEnabled] = useState(false);
  const [forwardingNumber, setForwardingNumber] = useState("");
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load phone number details when dialog opens
  useEffect(() => {
    if (open && phoneNumber) {
      setIsLoading(true);
      getPhoneNumber(phoneNumber.id)
        .then((data) => {
          setFriendlyName(data.friendlyName || "");
          const hasForwarding = !!(data.forwardingNumber && data.forwardingNumber.trim());
          setForwardingEnabled(hasForwarding);
          setForwardingNumber(data.forwardingNumber || "");
          setAiAssistantEnabled(data.aiAssistantEnabled || false);
        })
        .catch((err) => {
          console.error("Failed to load phone number:", err);
          toastError("Failed to load phone number details");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, phoneNumber]);

  const handleSave = async () => {
    if (!phoneNumber) return;

    setIsSaving(true);
    try {
      // Update both fields (only send if changed)
      const updates: Promise<void>[] = [];
      
      if (friendlyName !== (phoneNumber.friendlyName || "")) {
        updates.push(updatePhoneNumberFriendlyName(phoneNumber.id, friendlyName));
      }

      // Update forwarding - send empty string if disabled, or the number if enabled
      const newForwardingNumber = forwardingEnabled ? forwardingNumber : "";
      const currentForwardingNumber = phoneNumber.forwardingNumber || "";
      
      if (newForwardingNumber !== currentForwardingNumber) {
        updates.push(updatePhoneNumberForwarding(phoneNumber.id, newForwardingNumber));
      }

      // Update AI Assistant
      if (aiAssistantEnabled !== phoneNumber.aiAssistantEnabled) {
        updates.push(updatePhoneNumberAIAssistant(phoneNumber.id, aiAssistantEnabled));
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      // Refresh phone numbers list
      queryClient.invalidateQueries({ queryKey: ["phone-numbers", "user"] });
      
      toastSuccess("Phone number settings updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update phone number:", error);
      toastError("Failed to update phone number settings");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+1") && phone.length === 12) {
      const area = phone.slice(2, 5);
      const prefix = phone.slice(5, 8);
      const number = phone.slice(8);
      return `+1 (${area}) ${prefix}-${number}`;
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Phone Number</DialogTitle>
          <DialogDescription>
            Update settings for {phoneNumber && formatPhoneNumber(phoneNumber.phoneNumber)}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="friendly-name">Friendly Name</Label>
              <Input
                id="friendly-name"
                value={friendlyName}
                onChange={(e) => setFriendlyName(e.target.value)}
                placeholder="e.g., Business Line, Personal"
              />
              <p className="text-xs text-muted-foreground">
                A friendly name to identify this phone number
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-assistant">AI Assistant</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable AI assistant for call transcription and analysis
                  </p>
                </div>
                <Switch
                  id="ai-assistant"
                  checked={aiAssistantEnabled}
                  onCheckedChange={setAiAssistantEnabled}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-forwarding"
                  checked={forwardingEnabled}
                  onCheckedChange={(checked) => {
                    setForwardingEnabled(checked === true);
                    if (!checked) {
                      setForwardingNumber("");
                    }
                  }}
                />
                <Label
                  htmlFor="enable-forwarding"
                  className="text-sm font-medium cursor-pointer"
                >
                  Forward calls to another number
                </Label>
              </div>
              
              {forwardingEnabled && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="forwarding-number">Forwarding Number</Label>
                  <Input
                    id="forwarding-number"
                    type="tel"
                    value={forwardingNumber}
                    onChange={(e) => setForwardingNumber(e.target.value)}
                    placeholder="+14155551234"
                  />
                  <p className="text-xs text-muted-foreground">
                    When someone calls this phone number, forward the call to this number (e.g., your cell phone). Format: E.164 (e.g., +14155551234)
                  </p>
                </div>
              )}
              
              {!forwardingEnabled && (
                <p className="text-xs text-muted-foreground pl-6">
                  Calls will be handled in the app when forwarding is disabled.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

