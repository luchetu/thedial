"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, X, Sparkles, CheckCircle2, FileText, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    type?: "text" | "summary" | "action-items" | "email-draft" | "sentiment"
    data?: any
}

interface AskAIChatProps {
    isOpen: boolean
    onClose: () => void
}

export function AskAIChat({ isOpen, onClose }: AskAIChatProps) {
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm Dial AI. I can help you analyze your calls. Try asking 'Summarize last call' or 'What are the action items?'.",
            type: "text"
        }
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const simulateResponse = async (query: string) => {
        setIsLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        const lowerQuery = query.toLowerCase()
        let response: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "",
            type: "text"
        }

        if (lowerQuery.includes("summarize") || lowerQuery.includes("summary")) {
            response.type = "summary"
            response.content = "Here is the summary of the call with Client X:"
            response.data = {
                title: "Sales Discovery Call - Client X",
                duration: "14:30",
                keyPoints: [
                    "Client is interested in the Premium Plan.",
                    "Concerned about API rate limits.",
                    "Requested a custom pricing quote for 50 seats."
                ]
            }
        } else if (lowerQuery.includes("action") || lowerQuery.includes("todo")) {
            response.type = "action-items"
            response.content = "I found 3 action items from the conversation:"
            response.data = [
                { id: 1, text: "Send updated pricing PDF", done: false },
                { id: 2, text: "Check technical feasibility of 500 RPM", done: false },
                { id: 3, text: "Schedule follow-up for next Tuesday", done: false }
            ]
        } else if (lowerQuery.includes("email") || lowerQuery.includes("draft")) {
            response.type = "email-draft"
            response.content = "Here is a draft follow-up email:"
            response.data = {
                subject: "Follow-up: The Dial Premium Plan",
                body: "Hi [Client Name],\n\nThanks for hopping on the call today. As discussed, I've attached the pricing for the Premium Plan.\n\nRegarding the rate limits: we can accommodate your 500 RPM requirement on the Enterprise tier.\n\nLet me know if you have any questions!\n\nBest,\n[Your Name]"
            }
        } else {
            response.content = "I'm currently in simulation mode. Once connected to the backend, I'll be able to answer that using real call data!"
        }

        setMessages(prev => [...prev, response])
        setIsLoading(false)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        }

        setMessages(prev => [...prev, userMsg])
        const currentInput = input
        setInput("")
        simulateResponse(currentInput)
    }

    if (!isOpen) return null

    return (
        <Card className="fixed bottom-24 right-6 w-[400px] h-[600px] shadow-2xl flex flex-col overflow-hidden border-border animate-in slide-in-from-bottom-10 fade-in duration-300 z-50 bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Dial AI</h3>
                        <p className="text-xs text-muted-foreground">Call Intelligence Assistant</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 text-sm",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <Avatar className="h-8 w-8 border">
                                {msg.role === "assistant" ? (
                                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                )}
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-2 max-w-[80%]",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "p-3 rounded-lg",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted rounded-tl-none"
                                )}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {/* Interaction Cards */}
                                {msg.type === "summary" && msg.data && (
                                    <Card className="p-3 w-full bg-card/50 border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-xs">{msg.data.title}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">{msg.data.duration}</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                            {msg.data.keyPoints.map((point: string, i: number) => (
                                                <li key={i}>{point}</li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {msg.type === "action-items" && msg.data && (
                                    <Card className="p-3 w-full bg-card/50 border-primary/20 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-xs">Tasks Detected</span>
                                        </div>
                                        {msg.data.map((item: any) => (
                                            <div key={item.id} className="flex items-start gap-2 text-xs">
                                                <div className="w-3 h-3 border rounded-sm mt-0.5 flex-shrink-0" />
                                                <span className="text-muted-foreground">{item.text}</span>
                                            </div>
                                        ))}
                                    </Card>
                                )}

                                {msg.type === "email-draft" && msg.data && (
                                    <Card className="p-3 w-full bg-card/50 border-primary/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-xs">Draft Email</span>
                                        </div>
                                        <div className="bg-background p-2 rounded border text-xs font-mono text-muted-foreground">
                                            <p className="font-bold mb-1">Subject: {msg.data.subject}</p>
                                            <p className="whitespace-pre-wrap">{msg.data.body}</p>
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full mt-2 h-7 text-xs">
                                            Copy to Clipboard
                                        </Button>
                                    </Card>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
                <div className="relative">
                    <Input
                        placeholder="Ask anything about your calls..."
                        className="pr-10"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-primary"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </Card>
    )
}
