"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CallInterface } from "@/components/livekit/CallInterface";
import { OutboundCallDialer } from "@/components/livekit/OutboundCallDialer";

export default function DialPage() {
  const [activeCall, setActiveCall] = useState<{ roomName: string; identity: string } | null>(null);

  if (activeCall) {
    return (
      <CallInterface
        roomName={activeCall.roomName}
        identity={activeCall.identity}
        onDisconnect={() => setActiveCall(null)}
      />
    );
  }

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
          <div className="flex-1" />
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Make a Call</CardTitle>
                <CardDescription>Start an outbound call to any phone number</CardDescription>
              </CardHeader>
              <CardContent>
                <OutboundCallDialer onCallStart={setActiveCall} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

