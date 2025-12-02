"use client";

import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CallLogsList } from "@/components/dashboard/CallLogsList";

export default function CallsPage() {
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
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">All Calls</h1>
                <span className="text-muted-foreground">|</span>
                <p className="text-sm text-muted-foreground">
                  Review and filter your recent inbound and outbound calls.
                </p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <CallLogsList />
          </div>
        </div>
      </div>
    </div>
  );
}