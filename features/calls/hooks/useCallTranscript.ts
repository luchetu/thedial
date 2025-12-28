import { useQuery } from "@tanstack/react-query";
import { getCallTranscript, TranscriptionSegment } from "../api";

export function useCallTranscript(callId: string | null) {
    return useQuery<TranscriptionSegment[]>({
        queryKey: ["transcript", callId],
        queryFn: () => {
            if (!callId) throw new Error("Call ID is required");
            return getCallTranscript(callId);
        },
        enabled: !!callId,
    });
}
