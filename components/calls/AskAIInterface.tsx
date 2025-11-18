"use client";

import { useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskAIInterfaceProps {
  onAsk?: (prompt: string) => Promise<string>;
  initialPrompt?: string;
}

export function AskAIInterface({ onAsk, initialPrompt = "" }: AskAIInterfaceProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update prompt when initialPrompt changes (template selection)
  React.useEffect(() => {
    setPrompt(initialPrompt);
    // Clear previous response when template changes
    setResponse(null);
  }, [initialPrompt]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      if (onAsk) {
        const result = await onAsk(prompt);
        setResponse(result);
      } else {
        // Mock response for now
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setResponse("AI functionality coming soon. This feature will allow you to ask questions about call transcripts, generate summaries, and extract action items.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Input Area */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about your calls... (Press Cmd/Ctrl + Enter to submit)"
            className="min-h-[120px] resize-none pr-12"
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              size="sm"
              className="h-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ask AI
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Area */}
      {response && (
        <Card className="flex-1 flex flex-col">
          <CardContent className="pt-6 flex-1 overflow-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{response}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!response && !isLoading && !error && (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center text-muted-foreground">
            <p>Enter a prompt above to get started</p>
            <p className="text-sm mt-2">Ask questions about call transcripts, generate summaries, or extract action items</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

