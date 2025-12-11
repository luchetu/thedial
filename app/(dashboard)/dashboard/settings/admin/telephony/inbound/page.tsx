"use client";

import { useEffect, useState } from "react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PhoneIncoming } from "lucide-react";
import type { InboundTrunk, TwilioTrunk } from "@/features/admin/telephony/types";
import { PageHeader } from "@/components/ui/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { InboundTrunkDialog } from "@/features/admin/telephony/components/inbound/InboundTrunkDialog";
import { getInboundTrunkColumns, getTwilioOriginationColumns } from "@/features/admin/telephony/components/inbound/columns";
import { StatsGrid } from "@/components/ui/stat-card";
import { useInboundTrunks, useDeleteInboundTrunk } from "@/features/admin/telephony/hooks/useInboundTrunks";
import { useTwilioTrunks } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import { TwilioTrunkDialog } from "@/features/admin/telephony/components/outbound/TwilioTrunkDialog";
import { toastError, toastSuccess } from "@/lib/toast";

export default function InboundTrunksPage() {
  const [isCreateInboundDialogOpen, setIsCreateInboundDialogOpen] = useState(false);
  const [isTwilioTrunkDialogOpen, setIsTwilioTrunkDialogOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<InboundTrunk | null>(null);
  const [editingTwilioTrunk, setEditingTwilioTrunk] = useState<TwilioTrunk | null>(null);

  const {
    data: inboundTrunks = [],
    isLoading: isLoadingInboundTrunks,
    isError: isInboundTrunksError,
    error: inboundTrunksError,
  } = useInboundTrunks();

  const deleteInboundTrunkMutation = useDeleteInboundTrunk();

  const {
    data: twilioTrunks = [],
    isLoading: isLoadingTwilioTrunks,
    isError: isTwilioTrunksError,
    error: twilioTrunksError,
  } = useTwilioTrunks();

  useEffect(() => {
    if (isInboundTrunksError && inboundTrunksError) {
      toastError(inboundTrunksError.message || "Failed to load inbound trunks");
    }
  }, [isInboundTrunksError, inboundTrunksError]);

  useEffect(() => {
    if (isTwilioTrunksError && twilioTrunksError) {
      toastError(twilioTrunksError.message || "Failed to load Twilio trunks");
    }
  }, [isTwilioTrunksError, twilioTrunksError]);

  // Handle actions
  const handleEditInboundTrunk = (trunk: InboundTrunk) => {
    setEditingTrunk(trunk);
    setIsCreateInboundDialogOpen(true);
  };

  const handleDeleteInboundTrunk = (trunk: InboundTrunk) => {
    deleteInboundTrunkMutation.mutate(trunk.id, {
      onSuccess: () => {
        toastSuccess("Inbound trunk deleted");
      },
      onError: (mutationError) => {
        toastError(`Failed to delete inbound trunk: ${mutationError?.message || "Unknown error"}`);
      },
    });
  };

  const handleEditTwilioOrigination = (trunk: TwilioTrunk) => {
    setEditingTwilioTrunk(trunk);
    setIsTwilioTrunkDialogOpen(true);
  };

  const inboundColumns = getInboundTrunkColumns({
    onEdit: handleEditInboundTrunk,
    onDelete: handleDeleteInboundTrunk,
  });

  const twilioOriginationColumns = getTwilioOriginationColumns({
    onEdit: handleEditTwilioOrigination,
  });

  const totalInboundTrunks = inboundTrunks.length;
  const activeInboundTrunks = inboundTrunks.filter(
    (trunk) => (trunk.status ?? "active").toLowerCase() === "active"
  ).length;
  const inactiveInboundTrunks = totalInboundTrunks - activeInboundTrunks;
  const totalTwilioTrunksConfigured = twilioTrunks.length;

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <PhoneIncoming className="h-6 w-6" />
                  Inbound Trunks
                </h1>
              </div>
              <Button onClick={() => setIsCreateInboundDialogOpen(true)} variant="secondary" className="flex items-center gap-2">
                <PhoneIncoming className="h-4 w-4" />
                Create Inbound Trunk
              </Button>
            </div>
            {/* Summary Statistics */}
            <StatsGrid
              stats={[
                { title: "Total inbound trunks", value: totalInboundTrunks },
                { title: "Active trunks", value: activeInboundTrunks },
                { title: "Inactive trunks", value: inactiveInboundTrunks },
                { title: "Twilio trunks configured", value: totalTwilioTrunksConfigured },
              ]}
              columns={3}
            />

            {/* Inbound Section */}
            <div className="space-y-6">
              {/* LiveKit Inbound Trunks Subsection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">LiveKit Inbound Trunks</h3>

                <DataTable
                  data={inboundTrunks}
                  // @ts-expect-error - TanStack Table column type inference limitation
                  columns={inboundColumns}
                  emptyMessage="No results."
                  isLoading={isLoadingInboundTrunks}
                />
              </div>

              {/* Divider */}
              <Separator className="my-6" />

              {/* Twilio Origination Configuration Subsection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Twilio Origination Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Twilio trunks configured with origination URLs pointing to LiveKit inbound trunks.
                </p>

                <DataTable
                  data={twilioTrunks}
                  // @ts-expect-error - TanStack Table column type inference limitation
                  columns={twilioOriginationColumns}
                  emptyMessage="No Twilio trunks configured with origination URLs."
                  isLoading={isLoadingTwilioTrunks}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialogs */}
      <InboundTrunkDialog
        open={isCreateInboundDialogOpen}
        onOpenChange={(open) => {
          setIsCreateInboundDialogOpen(open);
          if (!open) setEditingTrunk(null);
        }}
        trunk={editingTrunk ?? undefined}
      />

      <TwilioTrunkDialog
        open={isTwilioTrunkDialogOpen}
        onOpenChange={(open) => {
          setIsTwilioTrunkDialogOpen(open);
          if (!open) setEditingTwilioTrunk(null);
        }}
        trunk={editingTwilioTrunk ?? undefined}
      />
    </div>
  );
}

