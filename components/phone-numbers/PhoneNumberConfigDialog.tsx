"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  updatePhoneNumberStatus,
  releasePhoneNumber,
  getPhoneNumber,
  updatePhoneNumberCapabilities,
} from "@/features/phone-numbers/api";
import type { UserPhoneNumber, PhoneNumberCapabilities } from "@/features/phone-numbers/types";
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
  const [status, setStatus] = useState<string | null>(null);
  
  // Call configuration state
  const [participantName, setParticipantName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [krispEnabled, setKrispEnabled] = useState(true);
  const [playDialtone, setPlayDialtone] = useState(true);

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
          setStatus(data.status || null);
          
          // Load call configuration from capabilities
          const capabilities = data.capabilities as PhoneNumberCapabilities | undefined;
          if (capabilities?.callConfig) {
            const callConfig = capabilities.callConfig;
            setParticipantName(callConfig.participantName || "");
            setDisplayName(callConfig.displayName || "");
            setKrispEnabled(callConfig.krispEnabled ?? true);
            setPlayDialtone(callConfig.playDialtone ?? true);
          } else {
            // Set defaults
            setParticipantName("");
            setDisplayName("");
            setKrispEnabled(true);
            setPlayDialtone(true);
          }
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

      // Status updates (excluding release, handled separately)
      if (status && status !== phoneNumber.status && status !== "released") {
        updates.push(updatePhoneNumberStatus(phoneNumber.id, status));
      }

      // Update call configuration in capabilities
      const currentCapabilities = (phoneNumber.capabilities as PhoneNumberCapabilities) || {};
      const currentCallConfig = currentCapabilities.callConfig || {};
      
      // Get current values (with defaults)
      const currentParticipantName = currentCallConfig.participantName || "";
      const currentDisplayName = currentCallConfig.displayName || "";
      const currentKrispEnabled = currentCallConfig.krispEnabled ?? true;
      const currentPlayDialtone = currentCallConfig.playDialtone ?? true;
      
      // Check if call config changed
      const hasCallConfigChanges = 
        participantName.trim() !== currentParticipantName ||
        displayName.trim() !== currentDisplayName ||
        krispEnabled !== currentKrispEnabled ||
        playDialtone !== currentPlayDialtone;
      
      if (hasCallConfigChanges) {
        // Build new call config (only include fields that are set or different from defaults)
        const newCallConfig: Record<string, unknown> = {};
        if (participantName.trim() !== "") {
          newCallConfig.participantName = participantName.trim();
        }
        if (displayName.trim() !== "") {
          newCallConfig.displayName = displayName.trim();
        }
        // Only include if different from default (true)
        if (krispEnabled !== true) {
          newCallConfig.krispEnabled = krispEnabled;
        }
        if (playDialtone !== true) {
          newCallConfig.playDialtone = playDialtone;
        }
        
        // Merge with existing capabilities
        const updatedCapabilities: Record<string, unknown> = {
          ...currentCapabilities,
        };
        
        // Only set callConfig if it has values, otherwise remove it
        if (Object.keys(newCallConfig).length > 0) {
          updatedCapabilities.callConfig = newCallConfig;
        } else {
          delete updatedCapabilities.callConfig;
        }
        
        updates.push(updatePhoneNumberCapabilities(phoneNumber.id, updatedCapabilities));
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>Configure Phone Number</SheetTitle>
          <SheetDescription>
            Update settings for {phoneNumber && formatPhoneNumber(phoneNumber.phoneNumber)}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
            <div className="space-y-4 mt-6 pr-6 pb-8">
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

            {/* Call Configuration Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-semibold mb-2">Call Configuration</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure how this phone number appears and behaves during outbound calls
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="participant-name">Participant Name</Label>
                <Input
                  id="participant-name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder={phoneNumber?.phoneNumber || "Leave empty to use phone number"}
                />
                <p className="text-xs text-muted-foreground">
                  Custom name shown in the call room. Leave empty to use the phone number.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Caller ID Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Leave empty for CNAM lookup"
                />
                <p className="text-xs text-muted-foreground">
                  Custom name shown on the recipient&apos;s caller ID. Leave empty to use provider CNAM lookup.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="krisp-enabled">Krisp Noise Suppression</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable noise suppression for better call quality
                    </p>
                  </div>
                  <Switch
                    id="krisp-enabled"
                    checked={krispEnabled}
                    onCheckedChange={setKrispEnabled}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="play-dialtone">Play Dial Tone</Label>
                    <p className="text-xs text-muted-foreground">
                      Play dial tone audio while the call is connecting
                    </p>
                  </div>
                  <Switch
                    id="play-dialtone"
                    checked={playDialtone}
                    onCheckedChange={setPlayDialtone}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Control whether this number is active or inactive in your workspace.
                  </p>
                </div>
                <select
                  id="status"
                  value={status ?? phoneNumber?.status ?? "active"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {phoneNumber?.status === "released" && (
                <p className="text-xs text-destructive">
                  This number has been released and can no longer be used.
                </p>
              )}
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

            <div className="flex justify-between gap-2 pt-4">
              <Button
                variant="outline"
                className="text-destructive border-destructive/40"
                disabled={isSaving || phoneNumber?.status === "released"}
                onClick={async () => {
                  if (!phoneNumber) return;
                  setIsSaving(true);
                  try {
                    await releasePhoneNumber(phoneNumber.id);
                    queryClient.invalidateQueries({ queryKey: ["phone-numbers", "user"] });
                    toastSuccess("Phone number released");
                    onOpenChange(false);
                  } catch (error) {
                    console.error("Failed to release phone number:", error);
                    toastError("Failed to release phone number");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                Release Number
              </Button>

              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
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
      </SheetContent>
    </Sheet>
  );
}

