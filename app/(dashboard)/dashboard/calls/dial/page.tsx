"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CallInterface } from "@/components/livekit/CallInterface";
import { OutboundCallDialer } from "@/components/livekit/OutboundCallDialer";

function DialContent() {
  const [activeCall, setActiveCall] = useState<{ roomName: string; identity: string; callerNumber?: string; callerName?: string } | null>(null);
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contact");

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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Dial</h1>
          <div className="flex-1" />
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 flex items-center justify-center">
            <Card className="w-full max-w-lg">
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
    </div>
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

