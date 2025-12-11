"use client";

import { cn } from "@/lib/utils";

interface RecordingIndicatorProps {
    className?: string;
}

export function RecordingIndicator({ className }: RecordingIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold text-red-500 tracking-wider">
                REC
            </span>
        </div>
    );
}
