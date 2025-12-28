"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PhoneSettingsSecondaryMenu } from "@/components/phone-settings-secondary-menu";
import { PhoneNumbersEmptyState } from "@/components/phone-numbers/PhoneNumbersEmptyState";
import { AddPhoneNumberDialog } from "@/components/phone-numbers/AddPhoneNumberDialog";
import { usePortRequests } from "@/features/phone-numbers/hooks/usePortRequests";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function PortNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: portRequests, isLoading, isError } = usePortRequests();

  return (
    <div className="flex h-screen">
      {/* Secondary menu */}
      <aside className="w-60 shrink-0 border-r bg-white flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Phone
          </h2>
        </div>
        <div className="flex-1 px-4 py-4">
          <PhoneSettingsSecondaryMenu />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <h1 className="text-lg font-semibold">Port Numbers</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-8">
            <PhoneNumbersEmptyState
              title="Port Numbers"
              description="Port your existing phone number into Dial."
              secondaryDescription="Start a port request to bring your current carrier number into this workspace."
              ctaLabel="Start Port Request"
              onAddPhoneNumber={() => setIsDialogOpen(true)}
            />

            <section className="max-w-3xl mx-auto w-full">
              <h2 className="text-base font-semibold mb-3">My Port Requests</h2>
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading port requests…
                </p>
              )}
              {isError && !isLoading && (
                <p className="text-sm text-destructive">
                  Failed to load port requests.
                </p>
              )}
              {!isLoading && !isError && (portRequests?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">
                  You have no port requests yet.
                </p>
              )}
              {!isLoading && !isError && (portRequests?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  {portRequests!.map((req) => (
                    <Card key={req.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {req.phoneNumbers.join(", ")}
                            </span>
                            <Badge
                              variant="default"
                              className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                            >
                              {req.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(req.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Add Phone Number Dialog – in this context, focused on porting */}
      <AddPhoneNumberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialOption="port"
        mode="port-only"
      />
    </div>
  );
}

