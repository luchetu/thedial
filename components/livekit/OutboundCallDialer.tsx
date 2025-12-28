"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import { useCreateOutboundCall } from "@/features/livekit/hooks/useCreateOutboundCall";
import { useContact } from "@/features/contacts/hooks/useContact";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { useToggleFavoriteContact } from "@/features/contacts/hooks/useToggleFavoriteContact";
import { formatPhoneNumber, normalizeToE164, isValidE164 } from "@/lib/utils/phone";
import { User, Phone, Clock, Star, Calculator as KeypadIcon, Delete, Search } from "lucide-react";
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
import { Dialpad } from "./Dialpad";
import { RecentCalls } from "./RecentCalls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OutboundCallDialerProps {
  contactId?: string;
}

export function OutboundCallDialer({
  contactId,
}: OutboundCallDialerProps) {
  const router = useRouter();

  // Sync phone number with URL for shareable state
  const [urlPhoneNumber, setUrlPhoneNumber] = useQueryState("number");
  const [destinationNumber, setDestinationNumber] = useState("");
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("keypad");

  // Contacts search state
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  const { data: user } = useCurrentUser();
  const {
    data: userPhoneNumbers,
    isLoading: isLoadingPhoneNumbers,
  } = useUserPhoneNumbers();

  const { data: contact } = useContact(contactId || "");
  const { data: contacts } = useContacts({
    search: contactSearchQuery || undefined,
  });

  const toggleFavorite = useToggleFavoriteContact();

  const createCallMutation = useCreateOutboundCall();
  const isConnecting = createCallMutation.isPending;

  const activePhoneNumbers = (userPhoneNumbers || []).filter((pn) => {
    return pn.status === "active";
  });

  const getPhoneNumberType = (phoneNumber: typeof activePhoneNumbers[0]) => {
    const provider = phoneNumber.provider;
    const isDial =
      provider === "twilio" || provider === "vonage" || provider === "livekit";
    return isDial ? "Dial" : "Caller ID";
  };

  useEffect(() => {
    if (
      activePhoneNumbers.length > 0 &&
      !selectedPhoneNumberId &&
      !isLoadingPhoneNumbers
    ) {
      setTimeout(() => {
        setSelectedPhoneNumberId(activePhoneNumbers[0].id);
      }, 0);
    }
  }, [activePhoneNumbers, selectedPhoneNumberId, isLoadingPhoneNumbers]);

  useEffect(() => {
    if (contact?.phone_number) {
      const formatted = formatPhoneNumber(contact.phone_number);
      setDestinationNumber((prev) => (prev !== formatted ? formatted : prev));
      const normalized = normalizeToE164(contact.phone_number);
      if (normalized && urlPhoneNumber !== normalized) {
        setUrlPhoneNumber(normalized);
      }
      setActiveTab("keypad"); // Switch to keypad when a contact is loaded
    } else if (urlPhoneNumber) {
      const formatted = formatPhoneNumber(urlPhoneNumber);
      setDestinationNumber((prev) => (prev !== formatted ? formatted : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact?.phone_number, contactId, urlPhoneNumber]);

  const contactName = contact?.name;

  const handleDial = async () => {
    // No country code autofill/handling as requested
    const fullNumber = destinationNumber.trim()
      .trim();

    // Add + if missing (simple fallback)
    if (!fullNumber.startsWith("+")) {
      // Assume US (+1) if 10 digits? Or just warn?
      // User asked to remove country code complexity "for now".
      // We'll normalize responsibly.
    }

    if (!fullNumber || !user || !selectedPhoneNumberId) return;

    const selectedPhone = activePhoneNumbers.find(
      (pn) => pn.id === selectedPhoneNumberId
    );
    if (!selectedPhone) {
      setError("Please select a phone number to use for calling");
      return;
    }

    const normalizedPhone = normalizeToE164(fullNumber);

    if (!isValidE164(normalizedPhone)) {
      setError(
        "Please enter a valid phone number (e.g., +14155551234)"
      );
      return;
    }

    setError(null);
    console.log("🟠 OutboundCallDialer: Starting call to:", normalizedPhone);

    createCallMutation.mutate(
      {
        phoneNumber: normalizedPhone,
        phoneNumberId: selectedPhoneNumberId,
        agentName: "telephony-agent",
        userIdentity: `user-${user.id}`,
      },
      {
        onSuccess: (result) => {
          const selectedContact = contacts?.find(
            (c) => normalizeToE164(c.phone_number) === normalizedPhone
          );
          const displayName =
            contactName || selectedContact?.name || normalizedPhone;



          const params = new URLSearchParams();
          params.set("roomName", result.room);
          params.set("identity", `user-${user.id}`);
          params.set("callerNumber", normalizedPhone);
          if (displayName) params.set("callerName", displayName);

          router.push(`/dashboard/dial/active?${params.toString()}`);
        },
        onError: (err) => {
          const message = err?.message || "Failed to initiate call";
          setError(message);
        },
      }
    );
  };

  const handleDigitPress = useCallback((digit: string) => {
    setDestinationNumber((prev) => prev + digit);
  }, []);

  const handleDelete = useCallback(() => {
    setDestinationNumber((prev) => prev.slice(0, -1));
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">

        {/* Top Tab Navigation - Floating Glass Pill */}
        <div className="px-4 py-3 pb-2 flex-none z-10">
          <TabsList className="w-full grid grid-cols-4 bg-white/10 backdrop-blur-2xl h-auto p-1.5 rounded-2xl border border-white/20 shadow-lg ring-1 ring-black/5">
            <TabsTrigger
              value="keypad"
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-500 data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.5)] data-[state=active]:text-primary text-slate-500/80 hover:text-slate-700 hover:bg-white/20"
            >
              <KeypadIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Keypad</span>
            </TabsTrigger>
            <TabsTrigger
              value="recents"
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-500 data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.5)] data-[state=active]:text-primary text-slate-500/80 hover:text-slate-700 hover:bg-white/20"
            >
              <Clock className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Recents</span>
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-500 data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.5)] data-[state=active]:text-primary text-slate-500/80 hover:text-slate-700 hover:bg-white/20"
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Contacts</span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-all duration-500 data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-md data-[state=active]:shadow-[0_4px_20px_-2px_rgba(255,255,255,0.5)] data-[state=active]:text-primary text-slate-500/80 hover:text-slate-700 hover:bg-white/20"
            >
              <Star className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase mt-1">Favs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Areas */}
        <div className="flex-1 overflow-hidden relative w-full h-full">

          {/* KEYPAD TAB */}
          <TabsContent value="keypad" className="absolute inset-0 flex flex-col p-0 m-0 overflow-y-auto min-h-0 data-[state=inactive]:hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Top Bar: Call From Selection */}
            <div className="px-6 py-2 flex-none">
              <div className="flex items-center gap-3 justify-center">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  From
                </Label>
                <Select
                  value={selectedPhoneNumberId}
                  onValueChange={setSelectedPhoneNumberId}
                  disabled={isLoadingPhoneNumbers || isConnecting}
                >
                  <SelectTrigger className="w-auto min-w-[180px] h-8 text-xs bg-white/30 border-white/40 shadow-sm text-slate-800 focus:ring-0 focus:border-white/60 hover:bg-white/50 transition-all rounded-full px-4">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/80 backdrop-blur-xl border-white/40 shadow-xl rounded-xl">
                    {activePhoneNumbers.map((pn) => {
                      const type = getPhoneNumberType(pn);
                      return (
                        <SelectItem key={pn.id} value={pn.id} className="focus:bg-slate-100/50 rounded-lg mx-1 my-0.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-slate-700">
                              {pn.friendlyName || pn.phoneNumber}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-slate-50 border-slate-200 text-slate-500">
                              {type}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number Display */}
            <div className="flex-none py-4 px-4 flex items-center justify-center relative z-20">
              <Input
                type="tel"
                value={destinationNumber}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9+*#\s\-()]/g, '');
                  setDestinationNumber(filtered);
                }}
                className="text-center text-5xl border-none shadow-none focus-visible:ring-0 p-0 h-auto font-light tracking-tight bg-transparent text-slate-800 placeholder:text-slate-300 placeholder:font-thin"
                placeholder="Enter number"
              />
              {destinationNumber && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-6 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10 transition-colors"
                  onClick={handleDelete}
                >
                  <Delete className="h-6 w-6 stroke-[1.5]" />
                </Button>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-start min-h-0 pb-4 pt-2 space-y-3 z-10">
              <Dialpad
                onDigitPress={handleDigitPress}
                onDelete={handleDelete}
                disabled={isConnecting}
              />

              <Button
                onClick={handleDial}
                disabled={!destinationNumber.trim() || !selectedPhoneNumberId || isConnecting}
                size="lg"
                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 text-white shadow-[0_8px_24px_-4px_rgba(34,197,94,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(34,197,94,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center p-0 shrink-0 ring-4 ring-green-100/50 backdrop-blur-sm"
              >
                {isConnecting ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Phone className="h-6 w-6 fill-current" />
                )}
              </Button>
            </div>
          </TabsContent>

          {/* RECENTS TAB */}
          <TabsContent value="recents" className="h-full flex flex-col m-0 min-h-0 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex-1 overflow-hidden bg-white/10 backdrop-blur-sm">
              <RecentCalls
                className="h-full border-0 flex flex-col bg-transparent"
                onSelect={(number) => {
                  const formatted = formatPhoneNumber(number);
                  setDestinationNumber(formatted);
                  setActiveTab("keypad");
                }}
              />
            </div>
          </TabsContent>

          {/* CONTACTS TAB */}
          <TabsContent value="contacts" className="h-full flex flex-col m-0 min-h-0 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-white/20 bg-white/10 backdrop-blur-md z-10">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-white/40 border-white/40 shadow-inner rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
            <ScrollArea className="flex-1 h-full min-h-0 bg-white/5">
              <div className="p-3 space-y-1">
                {contacts?.map((contact) => (
                  <div key={contact.id} className="group relative flex items-center rounded-2xl transition-all hover:bg-white/40 hover:shadow-sm border border-transparent hover:border-white/50">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start h-auto py-3 px-4 rounded-2xl hover:bg-transparent"
                      onClick={() => {
                        const formatted = formatPhoneNumber(contact.phone_number);
                        setDestinationNumber(formatted);
                        setActiveTab("keypad");
                      }}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-white/60 flex items-center justify-center mr-4 text-slate-600 shadow-sm shrink-0 font-semibold ring-1 ring-blue-100">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-semibold truncate w-full text-left text-slate-800">{contact.name}</span>
                        <span className="text-xs text-slate-500 font-medium tracking-wide">{contact.phone_number}</span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 h-8 w-8 rounded-full text-slate-300 hover:text-yellow-400 hover:bg-white/80 hover:shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite.mutate(contact.id);
                      }}
                    >
                      <Star className={`h-4 w-4 ${contact.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                ))}
                {contacts && contacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <User className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-sm">No contacts found</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* FAVORITES TAB */}
          <TabsContent value="favorites" className="h-full flex flex-col m-0 min-h-0 data-[state=inactive]:hidden animate-in fade-in slide-in-from-right-4 duration-300">
            <ScrollArea className="flex-1 h-full min-h-0 bg-white/5">
              <div className="p-3 grid grid-cols-2 gap-3 pb-20">
                {contacts?.filter(c => c.is_favorite).map((contact) => (
                  <div key={contact.id} className="relative group overflow-hidden rounded-3xl bg-white/30 hover:bg-white/60 border border-white/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      const formatted = formatPhoneNumber(contact.phone_number);
                      setDestinationNumber(formatted);
                      setActiveTab("keypad");
                    }}>
                    <div className="p-4 flex flex-col items-center text-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 border-2 border-white shadow-lg flex items-center justify-center text-xl font-bold text-slate-700">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="font-semibold text-slate-900 truncate text-sm">{contact.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{contact.phone_number}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full text-yellow-400 hover:bg-white/80 transition-colors shadow-sm bg-white/40 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite.mutate(contact.id);
                      }}
                    >
                      <Star className="h-3.5 w-3.5 fill-yellow-400" />
                    </Button>
                  </div>
                ))}
                {contacts && contacts.filter(c => c.is_favorite).length === 0 && (
                  <div className="col-span-2 flex flex-col items-center justify-center text-slate-400 p-12 text-center mt-10">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
                      <Star className="h-8 w-8 text-yellow-400/50" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">No favorites yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Star contacts to see them here for quick access</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>



      </Tabs>

      {(error || createCallMutation.error) && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-red-200 shadow-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Call Failed</p>
              <p className="text-sm text-gray-600 mt-0.5 break-words">
                {error || createCallMutation.error?.message || "Failed to initiate call"}
              </p>
            </div>
            <button
              onClick={() => {
                setError(null);
                createCallMutation.reset();
              }}
              className="flex-shrink-0 p-1.5 -m-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
