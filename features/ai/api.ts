import { http } from "@/lib/http/client";

export interface AskAIResponse {
    response: string;
    tokens_used: number;
}

export const askAI = async (prompt: string, templateId?: string): Promise<string> => {
    const data = await http<AskAIResponse>("/internal/ai/ask", {
        method: "POST",
        body: JSON.stringify({ prompt, templateId }),
    });
    return data.response;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const askAIStream = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    templateId?: string
): Promise<void> => {
    const url = `${API_BASE}/ai/ask/stream`;

    // Using fetch directly for streaming
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ prompt, templateId }),
    });

    if (!response.ok) {
        // Try to read error body
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // Process buffer for SSE lines
        const lines = buffer.split("\n\n");
        // Keep the last part if incomplete
        buffer = lines.pop() || "";

        for (const line of lines) {
            if (line.startsWith("data: ")) {
                const dataStr = line.slice(6);
                if (dataStr === "[DONE]") return;

                // Parse JSON payload or raw text? 
                // Handler sends: payload, _ := json.Marshal(map[string]string{"content": chunk})
                // So dataStr is JSON.
                try {
                    const data = JSON.parse(dataStr);
                    if (data.content) {
                        onChunk(data.content);
                    }
                    // Handle "INSUFFICIENT_BALANCE"? 
                    // Actually handler sent "event: error\ndata: INSUFFICIENT_BALANCE" for error.
                    // But here I'm only parsing "data: ".
                    // I need to handle "event: error" if I want specific errors.
                    // But standard SSE splitting by line is tricky with just "data: ".
                    // My simple splitter handles "data: ...\n\n".
                    // If event line exists, it's "event: error\ndata: ...\n\n".
                    // My split "\n\n" will give "event: error\ndata: INSUFFICIENT_BALANCE".
                    // I should check if it contains "event: error".
                } catch (e) {
                    console.error("Failed to parse SSE data", dataStr, e);
                }
            } else if (line.startsWith("event: error")) {
                // The data should be in the same block if I split by \n\n
                // Pattern: event: error\ndata: MSG
                if (line.includes("data: INSUFFICIENT_BALANCE")) {
                    throw new Error("Insufficient balance for AI features");
                }
            }
        }
    }
};
