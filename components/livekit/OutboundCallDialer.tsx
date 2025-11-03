"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import { createOutboundCall } from "@/features/livekit/api";
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
import { Phone } from "lucide-react";
import type { ApiError } from "@/lib/http/client";

interface OutboundCallDialerProps {
  onCallStart: (call: { roomName: string; identity: string }) => void;
}

export function OutboundCallDialer({ onCallStart }: OutboundCallDialerProps) {
  const [destinationNumber, setDestinationNumber] = useState("");
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: user } = useCurrentUser();
  const { 
    data: userPhoneNumbers, 
    isLoading: isLoadingPhoneNumbers, 
    error: phoneNumbersError 
  } = useUserPhoneNumbers();
  
  
  // Filter to only active phone numbers
  const activePhoneNumbers = (userPhoneNumbers || []).filter(
    (pn) => pn.status === "active"
  );

  // Auto-select first phone number if available and none selected
  useEffect(() => {
    if (activePhoneNumbers.length > 0 && !selectedPhoneNumberId && !isLoadingPhoneNumbers) {
      setSelectedPhoneNumberId(activePhoneNumbers[0].id);
    }
  }, [activePhoneNumbers, selectedPhoneNumberId, isLoadingPhoneNumbers]);

  const formatPhoneNumber = (value: string) => {
    // Allow digits, spaces, dashes, parentheses, and +
    const cleaned = value.replace(/[^\d+\-()\s]/g, "");
    return cleaned;
  };

  const handleDial = async () => {
    if (!destinationNumber.trim() || !user || !selectedPhoneNumberId) return;
    
    // Find the selected phone number to get its details
    const selectedPhone = activePhoneNumbers.find((pn) => pn.id === selectedPhoneNumberId);
    if (!selectedPhone) {
      setError("Please select a phone number to use for calling");
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Call the backend API to create outbound call with AI agent
      const result = await createOutboundCall({
        phoneNumber: destinationNumber.trim(),
        phoneNumberId: selectedPhoneNumberId, // Backend will look up SIP trunk from this
        agentName: "telephony-agent",
        userIdentity: `user-${user.id}`,
      });
      
      // Join the browser user to the room
      onCallStart({ roomName: result.room, identity: `user-${user.id}` });
    } catch (err) {
      const apiError = err as ApiError | Error;
      const message = (apiError as ApiError)?.message || apiError.message || "Failed to initiate call";
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {activePhoneNumbers.length > 0 && (
        <div className="space-y-3 py-2">
          <Label htmlFor="from-phone-number" className="text-sm font-medium">
            Call From
          </Label>
          <Select
            value={selectedPhoneNumberId}
            onValueChange={setSelectedPhoneNumberId}
            disabled={isLoadingPhoneNumbers || isConnecting}
          >
            <SelectTrigger id="from-phone-number" className="w-full py-2.5 px-4">
              <SelectValue placeholder="Select phone number" />
            </SelectTrigger>
            <SelectContent>
              {activePhoneNumbers.map((pn) => (
                <SelectItem key={pn.id} value={pn.id}>
                  {pn.friendlyName ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {pn.friendlyName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pn.phoneNumber}
                      </span>
                    </div>
                  ) : (
                    <span>{pn.phoneNumber}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoadingPhoneNumbers && (
        <div className="text-sm text-muted-foreground">
          <p>Loading your phone numbers...</p>
        </div>
      )}

      {phoneNumbersError && (
        <div className="text-sm text-destructive" role="alert">
          <p>Failed to load phone numbers: {((phoneNumbersError as unknown) as ApiError)?.message || phoneNumbersError.message || "Unknown error"}</p>
        </div>
      )}

      {activePhoneNumbers.length === 0 && !isLoadingPhoneNumbers && !phoneNumbersError && (
        <div className="text-sm text-muted-foreground">
          <p>You need to add a phone number before making calls.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="destination-number" className="text-sm font-medium">
          Call To
        </Label>
        <div className="flex gap-2">
          <Input
            id="destination-number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={destinationNumber}
            onChange={(e) => setDestinationNumber(formatPhoneNumber(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && destinationNumber.trim() && selectedPhoneNumberId) {
                handleDial();
              }
            }}
            className="flex-1"
            disabled={!selectedPhoneNumberId || isConnecting}
          />
          <Button
            onClick={handleDial}
            disabled={!destinationNumber.trim() || !selectedPhoneNumberId || isConnecting}
            size="lg"
            className="px-8"
          >
            <Phone className="h-5 w-5 mr-2" />
            {isConnecting ? "Connecting..." : "Call"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {selectedPhoneNumberId && (
        <div className="text-sm text-muted-foreground">
          <p>
            Calls will be made from{" "}
            <span className="font-medium">
              {activePhoneNumbers.find((pn) => pn.id === selectedPhoneNumberId)?.phoneNumber}
            </span>
            . Enter the destination number and click &quot;Call&quot; to start a call.
          </p>
        </div>
      )}
    </div>
  );
}

