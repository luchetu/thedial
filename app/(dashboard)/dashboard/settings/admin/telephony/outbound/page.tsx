"use client";

import { useMemo, useState } from "react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PhoneOutgoing } from "lucide-react";
import type { TwilioTrunk, OutboundTrunk } from "@/features/admin/telephony/types";
import { PageHeader } from "@/components/ui/page-header";
import { CreateButtonWithDropdown } from "@/components/ui/create-button-dropdown";
import { DataTable } from "@/components/ui/data-table";
import { TwilioTrunkDialog } from "@/features/admin/telephony/components/outbound/TwilioTrunkDialog";
import { OutboundTrunkDialog } from "@/features/admin/telephony/components/outbound/OutboundTrunkDialog";
import { getTwilioTrunkColumns, getLiveKitOutboundTrunkColumns } from "@/features/admin/telephony/components/outbound/columns";
import { StatsGrid } from "@/components/ui/stat-card";
import { useTwilioTrunks } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import { useOutboundTrunks } from "@/features/admin/telephony/hooks/useOutboundTrunks";
import { WaveLoader } from "@/components/ui/wave-loader";

export default function OutboundTrunksPage() {
  const [isCreateTwilioDialogOpen, setIsCreateTwilioDialogOpen] = useState(false);
  const [isCreateLiveKitDialogOpen, setIsCreateLiveKitDialogOpen] = useState(false);
  const [editingTwilioTrunk, setEditingTwilioTrunk] = useState<TwilioTrunk | null>(null);
  const [editingLiveKitTrunk, setEditingLiveKitTrunk] = useState<OutboundTrunk | null>(null);

  const {
    data: twilioTrunkData,
    isLoading: isLoadingTwilioTrunks,
    error: twilioTrunkError,
  } = useTwilioTrunks();

  const {
    data: outboundTrunkData,
    isLoading: isLoadingOutboundTrunks,
    error: outboundTrunkError,
  } = useOutboundTrunks();

  const twilioTrunks = useMemo(() => twilioTrunkData ?? [], [twilioTrunkData]);
  const livekitTrunks = useMemo(() => outboundTrunkData ?? [], [outboundTrunkData]);

  const isLoading =
    (isLoadingTwilioTrunks || isLoadingOutboundTrunks) &&
    twilioTrunks.length === 0 &&
    livekitTrunks.length === 0;

  const summary = useMemo(() => {
    const totalTwilioTrunks = twilioTrunks.length;
    const totalOutboundTrunks = livekitTrunks.length;
    const firstSipDomain = livekitTrunks.find((trunk) => trunk.twilioSipAddress)?.twilioSipAddress;
    const sipUri = firstSipDomain ? `sip:${firstSipDomain}` : "Not configured";

    return {
      totalTwilioTrunks,
      totalOutboundTrunks,
      sipUri,
    };
  }, [twilioTrunks, livekitTrunks]);

  const handleEditTwilioTrunk = (trunk: TwilioTrunk) => {
    setEditingTwilioTrunk(trunk);
    setIsCreateTwilioDialogOpen(true);
  };

  const handleDeleteTwilioTrunk = (trunk: TwilioTrunk) => {
    // TODO: Implement delete confirmation with API call
    console.log("Delete Twilio trunk:", trunk);
  };

  const handleEditLiveKitTrunk = (trunk: OutboundTrunk) => {
    setEditingLiveKitTrunk(trunk);
    setIsCreateLiveKitDialogOpen(true);
  };

  const handleDeleteLiveKitTrunk = (trunk: OutboundTrunk) => {
    // TODO: Implement delete confirmation with API call
    console.log("Delete LiveKit trunk:", trunk);
  };

  const twilioColumns = getTwilioTrunkColumns({
    onEdit: handleEditTwilioTrunk,
    onDelete: handleDeleteTwilioTrunk,
  });

  const livekitColumns = getLiveKitOutboundTrunkColumns({
    onEdit: handleEditLiveKitTrunk,
    onDelete: handleDeleteLiveKitTrunk,
  });

  if (twilioTrunkError || outboundTrunkError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {twilioTrunkError?.message || outboundTrunkError?.message || "Failed to load telephony data."}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <WaveLoader className="text-primary" />
        <span>Loading telephony data...</span>
      </div>
    );
  }

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
        <PageHeader
          title="Outbound"
          icon={PhoneOutgoing}
          action={
            <CreateButtonWithDropdown
              options={[
                {
                  label: "Twilio trunk",
                  onClick: () => setIsCreateTwilioDialogOpen(true),
                },
                {
                  label: "LiveKit trunk",
                  onClick: () => setIsCreateLiveKitDialogOpen(true),
                },
              ]}
            />
          }
        />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <StatsGrid
              stats={[
                { title: "Total Twilio trunks", value: summary.totalTwilioTrunks },
                { title: "Total outbound trunks", value: summary.totalOutboundTrunks },
                { 
                  title: "SIP URI", 
                  value: summary.sipUri,
                  customValue: (
                    <div className="text-sm font-mono truncate" title={summary.sipUri}>
                      {summary.sipUri}
                    </div>
                  ),
                },
              ]}
              columns={3}
            />

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Trunks</h3>
                <DataTable
                  data={twilioTrunks}
                  // @ts-expect-error - TanStack Table column type inference limitation
                  columns={twilioColumns}
                  emptyMessage={isLoadingTwilioTrunks ? "Loading Twilio trunks..." : "No results."}
                />
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">LiveKit Outbound Trunks</h3>
                <DataTable
                  data={livekitTrunks}
                  // @ts-expect-error - TanStack Table column type inference limitation
                  columns={livekitColumns}
                  emptyMessage={isLoadingOutboundTrunks ? "Loading outbound trunks..." : "No results."}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TwilioTrunkDialog
        open={isCreateTwilioDialogOpen}
        onOpenChange={(open) => {
          setIsCreateTwilioDialogOpen(open);
          if (!open) setEditingTwilioTrunk(null);
        }}
        trunk={editingTwilioTrunk}
      />

      <OutboundTrunkDialog
        open={isCreateLiveKitDialogOpen}
        onOpenChange={(open) => {
          setIsCreateLiveKitDialogOpen(open);
          if (!open) setEditingLiveKitTrunk(null);
        }}
        trunk={editingLiveKitTrunk}
      />
    </div>
  );
}
