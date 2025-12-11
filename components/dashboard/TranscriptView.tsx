import { useCallTranscript } from "@/features/calls/hooks/useCallTranscript";
import { CallRecord } from "@/features/calls/api";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface TranscriptViewProps {
    call: CallRecord;
}

export function TranscriptView({ call }: TranscriptViewProps) {
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
        <div className="space-y-4">
            <h4 className="font-medium text-sm">Conversation</h4>
            <div className="space-y-4">
                {segments.map((segment) => {
                    // Determine styling based on participant
                    // Heuristic: If identity starts with "sip_", it's likely the external caller (Customer)
                    // Otherwise, it's the internal user (Agent)
                    const isAgent = !segment.participantIdentity?.startsWith("sip_");

                    const timeStr = segment.startTime
                        ? new Date(segment.startTime * 1000).toISOString().substr(14, 5) // mm:ss
                        : "";

                    return (
                        <div key={segment.id} className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-1 ${isAgent ? 'text-right' : ''}`}>
                                <div className="flex items-center gap-2 mb-1 justify-end">
                                    {/* For Agent, we want justify-end, but the flex-row-reverse handles the container flipping.
                        However, the text inside needs alignment.
                        Actually, flex-row-reverse flips the order of Avatar/Content. 
                        Let's check the inner alignment.
                     */}

                                    <span className={`text-xs font-medium text-muted-foreground w-full ${isAgent ? 'text-right' : 'text-left'}`}>
                                        {segment.participantIdentity || "Unknown"} <span className="opacity-50">• {timeStr}</span>
                                    </span>
                                </div>
                                <div className={`inline-block p-3 rounded-lg text-left ${isAgent
                                    ? 'bg-primary/10 text-primary-foreground'
                                    : 'bg-muted/50'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{segment.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
