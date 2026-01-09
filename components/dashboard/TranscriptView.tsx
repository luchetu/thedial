import { useCallTranscript } from "@/features/calls/hooks/useCallTranscript";
import { CallRecord } from "@/features/calls/api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TranscriptViewProps {
    call: CallRecord;
    resolveContactName?: (phoneNumber: string) => string | null;
}

export function TranscriptView({ call, resolveContactName }: TranscriptViewProps) {
    const { data: segments, isLoading, isError } = useCallTranscript(call.id);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                Failed to load transcript.
            </div>
        );
    }

    if (!segments || segments.length === 0) {
        // Fallback to metadata text if available (legacy compatibility)
        if (call.metadata?.transcription?.text) {
            return (
                <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{call.metadata.transcription.text}</p>
                </div>
            );
        }
        return (
            <div className="text-center p-8 text-muted-foreground text-sm">
                No transcript available.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <h4 className="font-medium text-sm shrink-0">Conversation</h4>
            <div className="flex-1 min-h-0 relative">
                <div className="absolute inset-0 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        {segments.map((segment) => {
                            // Determine styling based on participant
                            // Heuristic: If identity starts with "sip_", it's likely the external caller (Customer)
                            // otherwise check if it matches the other party's phone number
                            // But in our bridge logic:
                            //   - We seeded "SourceE164" (which might be the caller) -> "Caller"
                            //   - "DestinationE164" -> "Callee"
                            // But identities are now Phone Numbers.

                            // Logic:
                            // If my user ID matches the call owner, I am the "Agent" (though in bridge I might be one side).
                            // Typically call UI shows "Me" vs "Them".
                            // For now, let's just resolve names.

                            // Identity is now a phone number string (e.g. "+1555...")
                            const identity = segment.participantIdentity || "Unknown";
                            const resolvedName = resolveContactName?.(identity);
                            const displayName = resolvedName ? `${resolvedName} (${identity})` : identity;

                            // Improved heuristic for "Is this me/agent?":
                            // If the identity matches the destination of the INBOUND call, it's likely the system/agent side if we assume inbound.
                            // But simpler: if it's NOT the external party.
                            // Let's stick to the previous heuristic or just assume left/right based on simple "sip" check is insufficient now.
                            // For now, if we don't have a reliable "Me" check, we might just list them.
                            // But previously: `const isAgent = !segment.participantIdentity?.startsWith("sip_");`
                            // Now identities are E.164.
                            // Let's assume if it matches the Call's SourceE164 on an Inbound Call -> It is the CONTACT (Left).
                            // If it matches DestinationE164 on Inbound Call -> It is US (Right).

                            let isAgent = false;
                            if (call.direction === "inbound") {
                                // Inbound: Source is Caller (Left), Dest is Agent (Right)
                                if (segment.participantIdentity === call.destinationE164) isAgent = true;
                            } else {
                                // Outbound: Source is Agent (Right), Dest is Callee (Left)
                                if (segment.participantIdentity === call.sourceE164) isAgent = true;
                            }

                            const timeStr = segment.startTime
                                ? new Date(segment.startTime * 1000).toISOString().substr(14, 5) // mm:ss
                                : "";

                            return (
                                <div key={segment.id} className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-1 ${isAgent ? 'text-right' : ''}`}>
                                        <div className="flex items-center gap-2 mb-1 justify-end">
                                            <span className={`text-xs font-medium text-muted-foreground w-full ${isAgent ? 'text-right' : 'text-left'}`}>
                                                {displayName} <span className="opacity-50">• {timeStr}</span>
                                            </span>
                                        </div>
                                        <div className={`inline-block p-3 rounded-lg text-left ${isAgent
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{segment.text}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
