"use client";

import { useEffect, useState, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { Participant } from "livekit-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getFriendlyName } from "@/lib/utils";

interface TranscriptionSegment {
    id: string;
    participantIdentity: string;
    participantName: string;
    text: string;
    timestamp: number;
    isFinal: boolean;
}

interface TranscriptionProps {
    className?: string;
}

export function Transcription({ className }: TranscriptionProps) {
    const room = useRoomContext();
    const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!room) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleTextStream = async (reader: any, participant?: Participant) => {
            // Reader is TextStreamReader
            // Note: attributes are on reader.info.attributes
            const attrs = reader.info?.attributes || {};
            const isTranscription = attrs["lk.transcribed_track_id"] !== undefined;

            if (!isTranscription) return;

            console.log("📝 [Transcription] Stream received from:", participant?.identity);

            const text = await reader.readAll();
            console.log("📝 [Transcription] Text received:", text);

            const isFinal = attrs["lk.transcription_final"] === "true";
            const segmentId = attrs["lk.segment_id"] || crypto.randomUUID();
            const timestamp = Date.now(); // Stream doesn't always have exact timestamp, use receive time

            // Determine speaker
            const pIdentity = participant?.identity || "unknown";
            // Use helper to get nice name (e.g. "Client (415)..." or "Dial AI")
            const pName = participant ? getFriendlyName(participant) : "Unknown";

            console.log("📝 [Transcription] Processing segment:", { pName, text, isFinal });

            setSegments((prev) => {
                const updated = [...prev];
                const existingIdx = updated.findIndex(s => s.id === segmentId);

                const newSeg: TranscriptionSegment = {
                    id: segmentId,
                    participantIdentity: pIdentity,
                    participantName: pName,
                    text: text,
                    timestamp: existingIdx >= 0 ? updated[existingIdx].timestamp : timestamp,
                    isFinal: isFinal,
                };

                if (existingIdx >= 0) {
                    updated[existingIdx] = newSeg;
                } else {
                    updated.push(newSeg);
                }

                // Sort by timestamp
                updated.sort((a, b) => a.timestamp - b.timestamp);
                return updated;
            });

            // Auto-scroll
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        // Register handler
        // Note: registerTextStreamHandler might return a disposer or promise
        // We use a try-catch-like safe registration if needed, but standard SDK v2 has it.
        // We need to cast room to any or correct type if registerTextStreamHandler is missing from standard Room definition in installed version
        // But assumed available based on docs.

        // However, if the SDK version in package.json is old, this might fail.
        // The user docs say "JavaScript" example uses it.
        // Let's check if the method exists.
        if ("registerTextStreamHandler" in room) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (room as any).registerTextStreamHandler("lk.transcription", handleTextStream);
            } catch (e) {
                console.warn("Failed to register text stream handler (likely already set):", e);
            }
        } else {
            console.warn("registerTextStreamHandler not found on room instance");
        }

        return () => {
            if ("unregisterTextStreamHandler" in room) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (room as any).unregisterTextStreamHandler("lk.transcription");
            }
        };
    }, [room]);

    return (
        <div className={cn("flex flex-col h-full bg-muted/30 rounded-lg overflow-hidden border", className)}>
            <div className="px-4 py-3 border-b bg-muted/50">
                <h3 className="font-semibold text-sm">Transcription</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {segments.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            Waiting for transcription...
                        </div>
                    ) : (
                        segments.map((segment, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-primary">
                                        {segment.participantName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {new Date(segment.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-2 rounded-md">
                                    {segment.text}
                                </p>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>
        </div>
    );
}
