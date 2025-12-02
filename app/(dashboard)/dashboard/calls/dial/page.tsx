"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { CallInterface } from "@/components/livekit/CallInterface";
import { OutboundCallDialer } from "@/components/livekit/OutboundCallDialer";

function DialContent() {
  const [activeCall, setActiveCall] = useState<{ roomName: string; identity: string; callerNumber?: string; callerName?: string } | null>(null);
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contact");

  return (
    <SidebarInset className="bg-muted/30">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
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
                  contactId={contactId || undefined}
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

export default function DialPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <DialContent />
    </Suspense>
  );
}

