"use client";

import { CallsSecondaryMenu } from "@/components/calls-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RecordingsList } from "@/components/dashboard/RecordingsList";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function RecordingsPage() {
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
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <div className="flex-1" />
        </header>

        {/* Fixed Title Section */}
        <div className="flex-none px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Recordings</h1>
            <p className="text-sm text-muted-foreground">
              Listen to and manage your call recordings
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <RecordingsList className="h-full" />
        </div>
      </div>
    </div>
  );
}

