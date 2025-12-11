"use client";

import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CallLogsList } from "@/components/dashboard/CallLogsList";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

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
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Breadcrumb Header Bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        {/* Fixed Title Section */}
        <div className="flex-none px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Call Logs</h1>
            <p className="text-sm text-muted-foreground">
              View your complete call history and details
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <CallLogsList className="h-full" />
        </div>
      </div>
    </div>
  );
}