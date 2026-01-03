"use client"

import { useState } from "react"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AskAIChat } from "./AskAIChat"

export function AskAIAssistant() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 animate-in zoom-in duration-300"
                        onClick={() => setIsOpen(true)}
                    >
                        <Sparkles className="h-6 w-6 text-primary-foreground" />
                    </Button>
                )}
            </div>

            {/* Chat Interface */}
            <AskAIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
