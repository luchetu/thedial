"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp, 
  Info,
  Sparkles 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type TemplatePrompt = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
};

const templatePrompts: TemplatePrompt[] = [
  {
    id: "summarize",
    title: "Summarize this call",
    description: "Get a concise summary of the call",
    prompt: "Summarize this call transcript. Include key points, main topics discussed, and any important decisions made.",
    icon: FileText,
  },
  {
    id: "action-items",
    title: "What action items were mentioned?",
    description: "Extract tasks and follow-ups",
    prompt: "What action items were mentioned in this call? List them clearly with any deadlines or responsible parties.",
    icon: CheckSquare,
  },
  {
    id: "analyze-sentiment",
    title: "Analyze sentiment",
    description: "Understand the tone and mood",
    prompt: "Analyze the sentiment of this call. What was the overall tone? Were there any moments of tension or positivity?",
    icon: TrendingUp,
  },
  {
    id: "extract-info",
    title: "Extract key information",
    description: "Pull out important details",
    prompt: "Extract the key information from this call. Include names, dates, numbers, and any other critical details mentioned.",
    icon: Info,
  },
  {
    id: "ask-question",
    title: "Ask a question",
    description: "Ask anything about the transcript",
    prompt: "",
    icon: MessageSquare,
  },
];

interface TemplatePromptsProps {
  onSelectTemplate: (template: TemplatePrompt) => void;
  selectedTemplateId?: string;
  className?: string;
}

export function TemplatePrompts({
  onSelectTemplate,
  selectedTemplateId,
  className,
}: TemplatePromptsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Template Prompts</h3>
      </div>
      <div className="space-y-2">
        {templatePrompts.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedTemplateId === template.id;
          
          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-md",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{template.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

