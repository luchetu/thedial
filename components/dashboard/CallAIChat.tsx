"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react"
import type { CallRecord } from "@/features/calls/api"
import { askCallAI } from "@/features/calls/api"
import { toast } from "sonner"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface CallAIChatProps {
    call: CallRecord
}

export function CallAIChat({ call }: CallAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I've analyzed this call. How can I help you? I can summarize the discussion, check for compliance, or draft a follow-up.",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const result = await askCallAI(input, call.id)

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: result.response,
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, aiMsg])
        } catch (err) {
            console.error(err)
            toast.error("Failed to get AI response")
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error processing your request. Please try again.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background border-l">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Call Assistant</h3>
                        <p className="text-xs text-muted-foreground">Context: Call with {call.sourceE164 || "Caller"}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <Avatar className="h-8 w-8">
                                {m.role === "assistant" ? (
                                    <>
                                        <AvatarImage src="/bot-avatar.png" />
                                        <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarImage src="/user-avatar.png" />
                                        <AvatarFallback className="bg-muted">Me</AvatarFallback>
                                    </>
                                )}
                            </Avatar>
                            <div
                                className={`rounded-lg p-3 max-w-[80%] text-sm whitespace-pre-wrap ${m.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-3 flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this call..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
