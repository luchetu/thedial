"use client";

import * as React from "react";
import { Info, Phone, CheckCircle2, Loader2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ForwardCellPhoneForm() {
  const [cellPhoneNumber, setCellPhoneNumber] = React.useState("");
  const [selectedDialerNumber, setSelectedDialerNumber] = React.useState("");
  const [carrier, setCarrier] = React.useState("");
  const [forwardingType, setForwardingType] = React.useState<"busy" | "no-answer" | "always">("busy");
  const [isSettingUp, setIsSettingUp] = React.useState(false);
  const [setupComplete, setSetupComplete] = React.useState(false);
  const [forwardingNumber, setForwardingNumber] = React.useState("");
  const [instructions, setInstructions] = React.useState<string[]>([]);

  // Mock - would come from API
  const availableDialerNumbers = [
    { id: "1", number: "+14155551234", friendlyName: "My Business Line" },
  ];

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      return cleaned.length > 0 ? `+${cleaned}` : "";
    }
    return cleaned;
  };

  const handleSetup = async () => {
    if (!selectedDialerNumber) {
      return;
    }

    setIsSettingUp(true);
    // TODO: API call to POST /phone-numbers/{id}/forwarding/setup
    // For now, simulate setup
    setTimeout(() => {
      setIsSettingUp(false);
      setSetupComplete(true);
      // Get the forwarding number from selected Dialer number
      const selectedNumber = availableDialerNumbers.find(n => n.id === selectedDialerNumber);
      setForwardingNumber(selectedNumber?.number || "+14155551234"); // Would come from API
      setInstructions([
        "1. Open your phone's Settings app",
        "2. Go to Phone → Call Forwarding",
        `3. Enter: ${selectedNumber?.number || "+14155551234"}`,
        "4. Enable forwarding for Busy/No Answer",
        "5. Save settings",
      ]);
    }, 2000);
  };

  const handleCopyNumber = () => {
    if (forwardingNumber) {
      navigator.clipboard.writeText(forwardingNumber);
    }
  };

  const canSetup = selectedDialerNumber !== "";

  const carrierInstructions: Record<string, string[]> = {
    verizon: ["Dial *72 +14155551234", "Press Call", "Wait for confirmation"],
    att: ["Dial *21* +14155551234", "Press Call", "Wait for confirmation"],
    "t-mobile": ["Settings → Phone → Call Forwarding", "Enter: +14155551234", "Enable for Busy/No Answer"],
    default: [
      "Open phone Settings",
      "Go to Call Forwarding",
      "Enter: +14155551234",
      "Enable forwarding",
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Forward Cell Phone</h3>
        <p className="text-sm text-muted-foreground">
          Get step-by-step instructions to configure your cell phone to forward calls 
          to Dialer for recording and transcription. You&apos;ll set this up through your carrier settings.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            You&apos;ll manually configure forwarding on your cell phone carrier settings. 
            Once set up, calls to your cell phone will forward to Dialer where they&apos;ll 
            be automatically recorded and transcribed.
          </p>
        </div>
      </div>

      {!setupComplete ? (
        <>
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Cell Phone Number (Optional - for caller ID verification) */}
            <div className="space-y-2">
              <Label htmlFor="cellPhone" className="text-sm font-medium">
                Cell Phone Number <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="cellPhone"
                type="tel"
                placeholder="+14155559999"
                value={cellPhoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setCellPhoneNumber(formatted);
                }}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide your cell phone number if you want to verify it for use as outbound caller ID. 
                Not needed for forwarding instructions.
              </p>
            </div>

            {/* Dialer Number Selector */}
            <div className="space-y-2">
              <Label htmlFor="dialerNumber" className="text-sm font-medium">
                Dialer Number <span className="text-destructive">*</span>
              </Label>
              {availableDialerNumbers.length > 0 ? (
                <Select value={selectedDialerNumber} onValueChange={setSelectedDialerNumber}>
                  <SelectTrigger id="dialerNumber" className="w-full">
                    <SelectValue placeholder="Select a Dialer number" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDialerNumbers.map((number) => (
                      <SelectItem key={number.id} value={number.id}>
                        {number.friendlyName} ({number.number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 rounded-lg border border-muted bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    You need to have a Dialer phone number first. 
                    <a href="#" className="text-primary underline ml-1">
                      Buy or port a number
                    </a>
                    .
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Select which Dialer number should receive forwarded calls
              </p>
            </div>

            {/* Carrier Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="carrier" className="text-sm font-medium">
                Your Carrier <span className="text-xs text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger id="carrier" className="w-full">
                  <SelectValue placeholder="Select your carrier for specific instructions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verizon">Verizon</SelectItem>
                  <SelectItem value="att">AT&T</SelectItem>
                  <SelectItem value="t-mobile">T-Mobile</SelectItem>
                  <SelectItem value="sprint">Sprint</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                We&apos;ll provide carrier-specific forwarding instructions
              </p>
            </div>

            {/* Forwarding Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Forward When</Label>
              <Select value={forwardingType} onValueChange={(value) => setForwardingType(value as typeof forwardingType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="busy">When Busy</SelectItem>
                  <SelectItem value="no-answer">No Answer</SelectItem>
                  <SelectItem value="always">Always Forward</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose when calls should forward to Dialer
              </p>
            </div>

            {/* Setup Button */}
            <Button
              onClick={handleSetup}
              disabled={!canSetup || isSettingUp || availableDialerNumbers.length === 0}
              className="w-full"
              size="lg"
            >
              {isSettingUp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Preparing Instructions...
                </>
              ) : (
                "Get Forwarding Instructions"
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Success State with Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  Instructions ready!
                </p>
                <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                  Follow the instructions below to configure forwarding on your cell phone carrier settings.
                </p>
              </div>
            </div>

            {/* Forwarding Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Forward To This Number</Label>
              <div className="flex gap-2">
                <Input
                  value={forwardingNumber}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyNumber}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this number and use it in your cell phone forwarding settings
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Setup Instructions</Label>
              <div className="p-4 rounded-lg border border-muted bg-muted/30">
                <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                  {instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Carrier-Specific Instructions */}
            {carrier && carrier !== "other" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {carrier.charAt(0).toUpperCase() + carrier.slice(1)} Specific Instructions
                </Label>
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
                  <ol className="space-y-2 list-decimal list-inside text-sm text-blue-900 dark:text-blue-200">
                    {carrierInstructions[carrier]?.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Help Link */}
            <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
              <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Need help? Check your carrier&apos;s website or contact support.
                  <a
                    href="#"
                    className="text-primary underline ml-1 inline-flex items-center gap-1"
                  >
                    View carrier guides
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
              <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  After setting up forwarding, we&apos;ll verify your cell phone number 
                  for use as outbound caller ID. This allows your outbound calls to show 
                  your cell phone number as the caller ID.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

