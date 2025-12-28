"use client";

import { useState } from "react";
import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AskAIInterface } from "@/components/calls/AskAIInterface";
import { TemplatePrompts } from "@/components/calls/TemplatePrompts";
import { Card, CardContent } from "@/components/ui/card";
import type { TemplatePrompt } from "@/components/calls/TemplatePrompts";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

// Mock responses for design purposes
const mockResponses: Record<string, string> = {
  summarize: `## Call Summary

**Date:** January 15, 2024
**Duration:** 23 minutes
**Participants:** John Smith (Sales Rep), Sarah Johnson (Client)

### Key Points Discussed:
- Discussed pricing for Enterprise Plan
- Client requested custom integrations
- Next steps: Send proposal by end of week

### Main Topics:
1. Product features and capabilities
2. Pricing structure and discounts
3. Implementation timeline
4. Support and maintenance

### Decisions Made:
- Client will review proposal and respond by Friday
- Technical demo scheduled for next week
- Pricing discussion to continue after demo`,

  "action-items": `## Action Items

1. **Send Enterprise Plan proposal**
   - Responsible: John Smith
   - Deadline: End of week (Friday, January 19)
   - Details: Include custom integration pricing

2. **Schedule technical demo**
   - Responsible: John Smith
   - Deadline: Next week
   - Details: Focus on integration capabilities

3. **Follow up on pricing discussion**
   - Responsible: John Smith
   - Deadline: After technical demo
   - Details: Address discount questions

4. **Review contract terms**
   - Responsible: Sarah Johnson
   - Deadline: Friday, January 19
   - Details: Client will review and provide feedback`,

  "analyze-sentiment": `## Sentiment Analysis

**Overall Tone:** Positive and Professional

### Sentiment Breakdown:
- **Opening:** Friendly and warm (positive)
- **Mid-call:** Professional and engaged (neutral-positive)
- **Closing:** Enthusiastic and optimistic (very positive)

### Key Observations:
- Client expressed genuine interest in the product
- No signs of tension or frustration
- Positive reception to pricing discussion
- Strong engagement throughout the call
- Client asked thoughtful questions showing investment

### Emotional Indicators:
- Used positive language ("excited", "interested", "great")
- Active listening and engagement
- No negative language or concerns raised`,

  "extract-info": `## Key Information Extracted

### Contact Information:
- **Client Name:** Sarah Johnson
- **Company:** TechStart Inc
- **Email:** sarah.j@techstart.com
- **Phone:** +1 (555) 987-6543

### Dates Mentioned:
- Proposal deadline: Friday, January 19, 2024
- Technical demo: Next week (TBD)
- Contract review: By Friday, January 19

### Numbers:
- Enterprise Plan base price: $5,000/month
- Custom integration add-on: $2,000/month
- Total potential: $7,000/month
- Contract duration: 12 months

### Other Details:
- Company size: ~150 employees
- Current system: Legacy CRM
- Integration needs: CRM, email, calendar
- Decision maker: Sarah Johnson (CTO)`,

  default: `I understand you'd like to ask a question about your call transcripts. This feature will allow you to interact with an AI assistant that has access to your call history and can answer questions, provide insights, and help you understand your conversations better.

**Example questions you can ask:**
- "What did the client say about pricing?"
- "Who mentioned the deadline?"
- "What concerns did they raise?"
- "What were the main objections?"

The AI will analyze the relevant call transcripts and provide detailed answers based on the actual conversation content.`,
};

import { askAI } from "@/features/ai/api";
// ... imports ...

export default function AIAssistantPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePrompt | null>(null);

  const handleSelectTemplate = (template: TemplatePrompt) => {
    setSelectedTemplate(template);
    // If template has a prompt, it will be passed via initialPrompt prop
    // If empty (like "Ask a question"), user can type their own
  };

  const handleAsk = async (prompt: string): Promise<string> => {
    return await askAI(prompt, selectedTemplate?.id);
  };

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Calls</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <CallsSecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <div className="flex-1" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          <TemplatePrompts
            onSelectTemplate={handleSelectTemplate}
            selectedTemplateId={selectedTemplate?.id}
          />

          <Card className="flex-1 flex flex-col min-h-[500px]">
            <CardContent className="pt-6 flex-1 flex flex-col">
              <AskAIInterface
                onAsk={handleAsk}
                initialPrompt={selectedTemplate?.prompt || ""}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

