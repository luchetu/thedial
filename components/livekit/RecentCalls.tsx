"use client";

import { useMemo } from "react";
import { Clock, PhoneIncoming, PhoneOutgoing, PhoneMissed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPhoneNumber } from "@/lib/utils/phone";
import { useUserCalls } from "@/features/calls/hooks";
import { useContacts } from "@/features/contacts/hooks/useContacts";

// Just icon colors based on status
const statusIconColor: Record<string, string> = {
    answered: "text-green-600",
    missed: "text-red-500",
    busy: "text-yellow-600",
    failed: "text-gray-500",
};

interface RecentCallsProps {
    onSelect: (phoneNumber: string) => void;
    className?: string;
}

export function RecentCalls({ onSelect, className }: RecentCallsProps) {
    const { data: calls, isLoading, error } = useUserCalls({ limit: 20 });

    // Fetch contacts to match phone numbers with names
    const { data: contacts } = useContacts();

    // Create a lookup map from phone number to contact name
    // Create a lookup map from phone number to contact name
    const contactMap = useMemo(() => {
        const map = new Map<string, string>();
        if (contacts) {
            contacts.forEach((contact) => {
                // Normalize phone numbers for matching
                const normalized = contact.phone_number.replace(/[\s\-\(\)]/g, "");
                map.set(normalized, contact.name);
            });
        }
        return map;
    }, [contacts]);

    const getContactName = (phone: string | null | undefined): string | null => {
        if (!phone) return null;
        const normalized = phone.replace(/[\s\-\(\)]/g, "");
        return contactMap.get(normalized) || null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4 text-sm text-muted-foreground">
                Failed to load recent calls
            </div>
        );
    }

    if (!calls || calls.length === 0) {
        return (
            <div className="text-center p-4 text-muted-foreground text-sm">
                No recent calls
            </div>
        );
    }

    return (
        <div className={className}>
            <ScrollArea className="flex-1 h-full min-h-0">
                <div className="space-y-1 p-2">
                    {calls.map((call) => {
                        const isOutbound = call.direction === "outbound";
                        const phoneNumber = isOutbound ? call.destinationE164 : call.sourceE164;
                        // Use API contact name, fallback to contacts lookup
                        const apiContactName = isOutbound ? call.destinationContactName : call.sourceContactName;
                        const contactName = apiContactName || getContactName(phoneNumber);
                        const isMissed = call.status === "missed";

                        if (!phoneNumber) return null;

                        // Choose icon based on status and direction
                        const IconComponent = isMissed ? PhoneMissed : (isOutbound ? PhoneOutgoing : PhoneIncoming);


                        // Get color value for inline style (more reliable)
                        const colorMap: Record<string, string> = {
                            answered: "#16a34a", // green-600
                            missed: "#ef4444",   // red-500
                            busy: "#ca8a04",     // yellow-600
                            failed: "#6b7280",   // gray-500
                            initiated: "#2563eb", // blue-600
                        };
                        const inlineColor = colorMap[call.status] || "#6b7280";

                        return (
                            <Button
                                key={call.id}
                                variant="ghost"
                                className="w-full justify-start h-auto py-3 px-4 hover:bg-white/20 rounded-3xl border border-transparent hover:border-white/20 transition-all duration-300 font-normal group"
                                onClick={() => onSelect(phoneNumber)}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-white/20 border border-white/10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <IconComponent className="h-4 w-4" style={{ color: inlineColor }} />
                                    </div>
                                    <div className="flex flex-col items-start min-w-0 flex-1">
                                        <span className="text-sm font-semibold truncate w-full text-left text-slate-700">{contactName || formatPhoneNumber(phoneNumber)}</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                            <span>{isOutbound ? "Outbound" : "Inbound"}</span>
                                            {call.startedAt && (
                                                <>
                                                    <span className="opacity-50">•</span>
                                                    <span>
                                                        {new Date(call.startedAt).toLocaleDateString()}{" "}
                                                        {new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </>
                                            )}
                                            {call.durationSeconds != null && call.durationSeconds > 0 && (
                                                <>
                                                    <span className="opacity-50">•</span>
                                                    <span>{formatDuration(call.durationSeconds)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

