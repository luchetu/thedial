"use client";

import { useQueryState } from "nuqs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { OutboundCallDialer } from "@/components/livekit/OutboundCallDialer";
import { Card, CardContent } from "@/components/ui/card";

export default function DialPage() {
  const [contactId] = useQueryState("contact");

  return (
    <div className="flex flex-col h-full w-full max-h-[calc(100vh-1rem)] overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-white relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      <header className="flex h-12 shrink-0 items-center gap-2 px-4 z-10 text-slate-800">
        <SidebarTrigger className="-ml-1 text-slate-600 hover:bg-slate-200/50 hover:text-slate-900" />
        <PageBreadcrumb />
      </header>
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 gap-8 items-center justify-center relative z-10">
        <div className="flex-1 min-h-0 w-full max-w-md">
          <Card className="w-full h-full border-white/40 shadow-xl bg-white/40 backdrop-filter backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-white/50">
            <CardContent className="p-0 h-full">
              <OutboundCallDialer
                contactId={contactId ?? undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
