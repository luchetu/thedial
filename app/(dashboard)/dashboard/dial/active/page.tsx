"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import { DisconnectReason } from "livekit-client";
import { useLiveKitToken } from "@/features/livekit/hooks/useLiveKitToken";
import { deleteRoom } from "@/features/livekit/api";
import { CallInterfaceContent } from "@/components/livekit/CallInterfaceContent";
import { Transcription } from "@/components/livekit/Transcription";
import { RecordingIndicator } from "@/components/livekit/RecordingIndicator";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export default function ActiveCallPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setOpen } = useSidebar();

    const roomName = searchParams.get("roomName");
    const identity = searchParams.get("identity");
    // ... (rest of the props)
    const callerName = searchParams.get("callerName") || undefined;
    const callerNumber = searchParams.get("callerNumber") || undefined;

    const { data: tokenData, isLoading, error } = useLiveKitToken(roomName || "", identity || "");
    const token = tokenData?.token;
    const serverUrl = tokenData?.url;

    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Auto-collapse sidebar when entering active call
    useEffect(() => {
        setOpen(false);
    }, [setOpen]);

    useEffect(() => {
        if (!roomName || !identity) {
            router.push("/dashboard/dial");
        }
    }, [roomName, identity, router]);

    useEffect(() => {
        if (error) {
            console.error("Failed to get token:", error);
            setTimeout(() => router.push("/dashboard/dial"), 3000);
        }
    }, [error, router]);


    const roomOptions = useMemo(() => ({
        publishDefaults: {
            videoSimulcastLayers: [],
        },
        disconnectOnPageLeave: true,
        adaptiveStream: false,
    }), []);

    const handleDisconnect = async () => {
        if (isDisconnecting) return;
        setIsDisconnecting(true);

        if (roomName) {
            try {
                await deleteRoom(roomName);
            } catch (e) {
                console.error("Failed to delete room:", e);
            }
        }
        router.push("/dashboard/dial");
    };

    const handleLiveKitDisconnected = async (reason?: DisconnectReason) => {
        console.log("LiveKit disconnected:", reason);
        if (!isDisconnecting) {
            await handleDisconnect();
        }
    };

    if (!roomName || !identity || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-900">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                        <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-indigo-500/30 opacity-20" />
                    </div>
                    <p className="text-lg font-light tracking-widest text-indigo-600 animate-pulse">CONNECTING SECURE LINE...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <p className="text-red-500 text-xl font-light">Connection Failed. Redirecting...</p>
            </div>
        )
    }

    return (
        <LiveKitRoom
            video={false}
            audio={false}
            token={token!}
            serverUrl={serverUrl!}
            connect={true}
            options={roomOptions}
            onDisconnected={handleLiveKitDisconnected}
            onError={(e) => console.error("Room error:", e)}
            className="flex flex-col h-screen overflow-hidden font-sans bg-gradient-to-br from-slate-100 via-blue-50 to-white relative"
        >
            {/* Background Texture - Matched to Dialer */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none z-0"></div>

            {/* Header */}
            <header className="flex h-20 shrink-0 items-center justify-between px-8 z-10 border-b border-slate-200 bg-white/40 backdrop-blur-md">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-full px-4"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    End & Back
                </Button>
                <div className="flex items-center gap-4 bg-white/60 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <RecordingIndicator className="text-red-500" />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden z-10">
                {/* Call Visualizer Area */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-4xl bg-white/60 backdrop-blur-3xl border border-white/60 rounded-3xl p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>

                        <div className="relative z-10">
                            <CallInterfaceContent
                                roomName={roomName}
                                callerName={callerName}
                                callerNumber={callerNumber}
                                onDisconnect={handleDisconnect}
                            />
                        </div>
                    </div>
                </div>

                {/* Transcription Sidebar */}
                <div className="w-[400px] border-l border-slate-200 bg-white/40 backdrop-blur-md hidden lg:flex flex-col shadow-xl">
                    <div className="p-6 border-b border-slate-100 bg-white/30">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest">Live Transcript</h3>
                        <p className="text-xs text-slate-500 mt-1">Real-time speech-to-text</p>
                    </div>
                    <Transcription className="flex-1 bg-transparent border-none p-0" />
                </div>
            </div>
        </LiveKitRoom>
    );
}
