"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import { useCreateOutboundCall } from "@/features/livekit/hooks/useCreateOutboundCall";
import { useContact } from "@/features/contacts/hooks/useContact";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { formatPhoneNumber, normalizeToE164, isValidE164 } from "@/lib/utils/phone";
import { User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone } from "lucide-react";

interface OutboundCallDialerProps {
  onCallStart: (call: { roomName: string; identity: string; callerNumber?: string; callerName?: string }) => void;
  contactId?: string;
  activeCall?: { roomName: string; identity: string; callerNumber?: string; callerName?: string } | null;
}

export function OutboundCallDialer({ onCallStart, contactId, activeCall }: OutboundCallDialerProps) {
  // Sync phone number with URL for shareable state
  const [urlPhoneNumber, setUrlPhoneNumber] = useQueryState("number");
  const [destinationNumber, setDestinationNumber] = useState("");
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  const { data: user } = useCurrentUser();
  const { 
    data: userPhoneNumbers, 
    isLoading: isLoadingPhoneNumbers, 
    error: phoneNumbersError 
  } = useUserPhoneNumbers();
  
  const { data: contact } = useContact(contactId || "");
  const { data: contacts } = useContacts({ search: contactSearchQuery || undefined });
  
  const createCallMutation = useCreateOutboundCall();
  
  const isConnecting = createCallMutation.isPending || Boolean(activeCall);
  
  
  // Filter to only active phone numbers
  const activePhoneNumbers = (userPhoneNumbers || []).filter(
    (pn) => pn.status === "active"
  );

  // Helper function to get phone number type
  const getPhoneNumberType = (phoneNumber: typeof activePhoneNumbers[0]) => {
    // Use provider field if available, otherwise fall back to twilioSid check for backward compatibility
    const provider = phoneNumber.provider || (phoneNumber.twilioSid?.startsWith("non-twilio-") ? "sms-verified" : "twilio");
    const isDial = provider === "twilio" || provider === "vonage" || provider === "livekit"; // Add other dial-capable providers
    return isDial ? "Dial" : "Caller ID";
  };

  useEffect(() => {
    if (activePhoneNumbers.length > 0 && !selectedPhoneNumberId && !isLoadingPhoneNumbers) {
      // Use setTimeout to make setState asynchronous and avoid cascading renders
      setTimeout(() => {
        setSelectedPhoneNumberId(activePhoneNumbers[0].id);
      }, 0);
    }
  }, [activePhoneNumbers, selectedPhoneNumberId, isLoadingPhoneNumbers]);

  // Pre-populate phone number and name from contact data or URL query parameter
  useEffect(() => {
    if (contact?.phone_number) {
      // Format the phone number for display
      const formatted = formatPhoneNumber(contact.phone_number);
      // Only update if the value actually changed to avoid unnecessary re-renders
      setDestinationNumber((prev) => prev !== formatted ? formatted : prev);
      // Sync to URL if different
      const normalized = normalizeToE164(contact.phone_number);
      if (normalized && urlPhoneNumber !== normalized) {
        setUrlPhoneNumber(normalized);
      }
    } else if (urlPhoneNumber) {
      // Pre-populate from URL query parameter
      const formatted = formatPhoneNumber(urlPhoneNumber);
      setDestinationNumber((prev) => prev !== formatted ? formatted : prev);
    } else if (!contactId && !urlPhoneNumber && destinationNumber) {
      // Clear destination number if no contactId and no URL phone number and contact data is cleared
      setDestinationNumber("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.phone_number, contactId, urlPhoneNumber]);

  // Get contact name for display
  const contactName = contact?.name;

  const handleDial = async () => {
    if (!destinationNumber.trim() || !user || !selectedPhoneNumberId) return;
    
    // Find the selected phone number to get its details
    const selectedPhone = activePhoneNumbers.find((pn) => pn.id === selectedPhoneNumberId);
    if (!selectedPhone) {
      setError("Please select a phone number to use for calling");
      return;
    }
    
    // Normalize phone number to E.164 format
    const normalizedPhone = normalizeToE164(destinationNumber.trim());
    
    // Validate E.164 format
    if (!isValidE164(normalizedPhone)) {
      setError("Please enter a valid phone number in international format (e.g., +14155551234)");
      return;
    }
    
    setError(null);
    
    console.log("🟠 OutboundCallDialer: Starting call to:", normalizedPhone);
    
    // Use React Query mutation to create the call
    createCallMutation.mutate(
      {
        phoneNumber: normalizedPhone,
        phoneNumberId: selectedPhoneNumberId, // Backend will look up SIP trunk from this
        agentName: "telephony-agent",
        userIdentity: `user-${user.id}`,
      },
      {
        onSuccess: (result) => {
          console.log("🟠 OutboundCallDialer: API call successful! Result:", result);
          
          // Find contact name from selected contact or search results
          const selectedContact = contacts?.find(
            (c) => normalizeToE164(c.phone_number) === normalizedPhone
          );
          const displayName = contactName || selectedContact?.name || normalizedPhone;
          
          // Join the browser user to the room
          const callData = { 
            roomName: result.room, 
            identity: `user-${user.id}`,
            callerNumber: normalizedPhone,
            callerName: displayName,
          };
          
          console.log("🟠 OutboundCallDialer: Calling onCallStart with:", callData);
          onCallStart(callData);
          console.log("🟠 OutboundCallDialer: onCallStart completed");
        },
        onError: (err) => {
          console.error("🟠 OutboundCallDialer: ERROR:", err);
          const message = err?.message || "Failed to initiate call";
          setError(message);
        },
      }
    );
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
              <SelectValue placeholder="Select phone number">
                {selectedPhoneNumberId ? (() => {
                  const selected = activePhoneNumbers.find((pn) => pn.id === selectedPhoneNumberId);
                  if (!selected) return "Select phone number";
                  const type = getPhoneNumberType(selected);
                  return `${selected.friendlyName || selected.phoneNumber} (${type})`;
                })() : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {activePhoneNumbers.map((pn) => {
                const type = getPhoneNumberType(pn);
                return (
                  <SelectItem key={pn.id} value={pn.id}>
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex flex-col flex-1 min-w-0">
                        {pn.friendlyName ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {pn.friendlyName}
                              </span>
                              <Badge 
                                variant={type === "Dial" ? "default" : "secondary"}
                                className="text-xs shrink-0"
                              >
                                {type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground truncate">
                              {pn.phoneNumber}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="truncate">{pn.phoneNumber}</span>
                            <Badge 
                              variant={type === "Dial" ? "default" : "secondary"}
                              className="text-xs shrink-0"
                            >
                              {type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
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
          <p>Failed to load phone numbers: {phoneNumbersError instanceof Error ? phoneNumbersError.message : "Unknown error"}</p>
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
          <div className="flex-1 space-y-1">
            <div className="flex gap-2">
              <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!selectedPhoneNumberId || isConnecting}
                    type="button"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search contacts..." 
                      value={contactSearchQuery}
                      onValueChange={setContactSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No contacts found.</CommandEmpty>
                      <CommandGroup>
                        {contacts?.map((contact) => (
                          <CommandItem
                            key={contact.id}
                            value={`${contact.name} ${contact.phone_number}`}
                            onSelect={() => {
                              const normalized = normalizeToE164(contact.phone_number);
                              const formatted = formatPhoneNumber(contact.phone_number);
                              setDestinationNumber(formatted);
                              // Update URL with selected contact's phone number
                              setUrlPhoneNumber(normalized);
                              setContactSearchOpen(false);
                              setContactSearchQuery("");
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-xs text-muted-foreground">{contact.phone_number}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input
                id="destination-number"
                type="tel"
                placeholder="+1 (555) 123-4567 or search contacts"
                value={destinationNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setDestinationNumber(formatted);
                  // Clear URL param when input is cleared
                  if (!formatted.trim()) {
                    setUrlPhoneNumber(null);
                  }
                }}
                onBlur={() => {
                  // Update URL when input loses focus and has a valid phone number
                  const normalized = normalizeToE164(destinationNumber.trim());
                  if (normalized && isValidE164(normalized)) {
                    setUrlPhoneNumber(normalized);
                  } else if (!destinationNumber.trim()) {
                    setUrlPhoneNumber(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && destinationNumber.trim() && selectedPhoneNumberId) {
                    // Update URL before dialing
                    const normalized = normalizeToE164(destinationNumber.trim());
                    if (normalized && isValidE164(normalized)) {
                      setUrlPhoneNumber(normalized);
                    }
                    handleDial();
                  }
                }}
                className="flex-1"
                disabled={!selectedPhoneNumberId || isConnecting}
              />
            </div>
            {destinationNumber.trim() && (
              <p className="text-xs text-muted-foreground">
                Will call: {normalizeToE164(destinationNumber.trim()) || "Enter a valid number"}
              </p>
            )}
          </div>
          <Button
            onClick={handleDial}
            disabled={!destinationNumber.trim() || !selectedPhoneNumberId || isConnecting}
            size="lg"
            className="px-8 bg-green-600 hover:bg-green-700 text-white"
          >
            {isConnecting ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-2" />
                Call
              </>
            )}
          </Button>
        </div>
      </div>

      {(error || createCallMutation.error) && (
        <div className="text-sm text-destructive" role="alert">
          {error || createCallMutation.error?.message || "Failed to initiate call"}
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

