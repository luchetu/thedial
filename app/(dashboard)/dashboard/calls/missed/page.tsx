"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function MissedCallsPage() {
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
                <CardTitle>Missed Calls</CardTitle>
                <CardDescription>Calls you missed and need to return</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Missed calls interface coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

