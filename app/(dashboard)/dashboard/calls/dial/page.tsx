"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { CallInterface } from "@/components/livekit/CallInterface";
import { OutboundCallDialer } from "@/components/livekit/OutboundCallDialer";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function DialPage() {
  const [activeCall, setActiveCall] = useState<{ roomName: string; identity: string; callerNumber?: string; callerName?: string } | null>(null);
  const [contactId] = useQueryState("contact");

  return (
    <SidebarInset className="bg-muted/30">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">TheDial</h1>
            <span className="text-muted-foreground">|</span>
            <p className="text-sm text-muted-foreground">
              Start an outbound call to any phone number
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-auto">
          <div className="p-6 flex items-center justify-center min-h-full">
            <Card className="w-full max-w-lg bg-white">
              <CardHeader>
                <CardTitle>Make a Call</CardTitle>
                <CardDescription>Start an outbound call to any phone number</CardDescription>
              </CardHeader>
              <CardContent>
                <OutboundCallDialer
                  onCallStart={setActiveCall}
                  contactId={contactId ?? undefined}
                  activeCall={activeCall}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call Modal */}
      {activeCall && (
        <CallInterface
          roomName={activeCall.roomName}
          identity={activeCall.identity}
          callerName={activeCall.callerName}
          callerNumber={activeCall.callerNumber}
          onDisconnect={() => {
            console.log("🔴 DialPage: Call disconnected");
            setActiveCall(null);
          }}
        />
      )}
    </SidebarInset>
  );
}

