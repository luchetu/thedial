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
