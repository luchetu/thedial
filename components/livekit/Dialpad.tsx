"use client";

import * as React from "react";
import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DialpadProps {
    onDigitPress: (digit: string) => void;
    onDelete: () => void;
    onClear?: () => void;
    disabled?: boolean;
    className?: string;
}

export function Dialpad({ onDigitPress, disabled, className }: DialpadProps) {
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressRef = useRef(false);

    const digits = [
        { label: "1", sub: "" },
        { label: "2", sub: "ABC" },
        { label: "3", sub: "DEF" },
        { label: "4", sub: "GHI" },
        { label: "5", sub: "JKL" },
        { label: "6", sub: "MNO" },
        { label: "7", sub: "PQRS" },
        { label: "8", sub: "TUV" },
        { label: "9", sub: "WXYZ" },
        { label: "*", sub: "" },
        { label: "0", sub: "+", longPress: "+" },
        { label: "#", sub: "" },
    ];

    const handlePointerDown = useCallback((digit: typeof digits[0]) => {
        if (digit.longPress) {
            isLongPressRef.current = false;
            longPressTimerRef.current = setTimeout(() => {
                isLongPressRef.current = true;
                onDigitPress(digit.longPress!);
            }, 500);
        }
    }, [onDigitPress]);

    const handlePointerUp = useCallback((digit: typeof digits[0]) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (digit.longPress && isLongPressRef.current) {
            // Already handled by long press
            isLongPressRef.current = false;
            return;
        }
        onDigitPress(digit.label);
    }, [onDigitPress]);

    const handlePointerLeave = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    return (
        <div className={cn("grid grid-cols-3 gap-x-8 gap-y-3 mx-auto w-full max-w-xs", className)}>
            {digits.map((digit) => (
                <Button
                    key={digit.label}
                    variant="outline"
                    className="h-16 w-16 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-90 shadow-[0_8px_32px_-4px_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_-4px_rgba(31,38,135,0.2)] border border-white/30 bg-white/10 hover:bg-white/20 text-slate-800 p-0 select-none backdrop-blur-xl ring-1 ring-white/20"
                    onPointerDown={() => digit.longPress ? handlePointerDown(digit) : undefined}
                    onPointerUp={() => digit.longPress ? handlePointerUp(digit) : undefined}
                    onPointerLeave={handlePointerLeave}
                    onClick={digit.longPress ? undefined : () => onDigitPress(digit.label)}
                    disabled={disabled}
                >
                    <span className="text-3xl font-thin leading-none mb-1 text-slate-700">{digit.label}</span>
                    {digit.sub && (
                        <span className="text-[9px] text-slate-400 font-semibold tracking-widest leading-none uppercase opacity-60">
                            {digit.sub}
                        </span>
                    )}
                </Button>
            ))}
        </div>
    );
}
