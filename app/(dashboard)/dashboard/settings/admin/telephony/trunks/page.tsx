"use client";

import { useCallback, useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { CreateButtonWithDropdown } from "@/components/ui/create-button-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { WaveLoader } from "@/components/ui/wave-loader";
import { StatsGrid } from "@/components/ui/stat-card";
import { toastError, toastSuccess } from "@/lib/toast";
import { getTrunkColumns } from "@/features/admin/telephony/components/trunks/columns";
import { TrunkDialog } from "@/features/admin/telephony/components/trunks/TrunkDialog";
import {
  useTrunks,
  useDeleteTrunk,
  useRoutingProfilesByTrunk,
} from "@/features/admin/telephony/hooks/useTrunks";
import type { Trunk, ListTrunksFilters } from "@/features/admin/telephony/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TrunksPage() {
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trunkToDelete, setTrunkToDelete] = useState<Trunk | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Trunk | null>(null);
  const [configuringTrunk, setConfiguringTrunk] = useState<Trunk | null>(null);
  const [initialTrunkType, setInitialTrunkType] = useState<Trunk["type"] | null>(null);

  const filters = useMemo<ListTrunksFilters>(
    () => ({
      direction: directionFilter !== "all" ? (directionFilter as "outbound" | "inbound" | "bidirectional") : undefined,
      type: typeFilter !== "all" ? (typeFilter as Trunk["type"]) : undefined,
      status: statusFilter !== "all" ? (statusFilter as Trunk["status"]) : undefined,
    }),
    [directionFilter, typeFilter, statusFilter]
  );

  const {
    data: trunksData,
    isLoading,
    error,
  } = useTrunks(filters);
  const trunks = useMemo(() => trunksData ?? [], [trunksData]);

  const deleteTrunkMutation = useDeleteTrunk();

  // Fetch routing profiles for each trunk to show usage
  const routingProfileCounts = useMemo(() => {
    const counts: Record<string, { outbound: number; inbound: number }> = {};
    trunks.forEach((trunk) => {
      counts[trunk.id] = { outbound: 0, inbound: 0 };
    });
    return counts;
  }, [trunks]);

  // Fetch routing profiles for the trunk being deleted
  const { data: routingProfilesData } = useRoutingProfilesByTrunk(
    trunkToDelete?.id || "",
    { enabled: !!trunkToDelete && deleteDialogOpen }
  );

  // Derive routing profiles count directly from query data
  const routingProfilesForDelete = useMemo(() => {
    if (!routingProfilesData || !trunkToDelete) return null;
    return {
      outbound: routingProfilesData.outbound.length,
      inbound: routingProfilesData.inbound.length,
    };
  }, [routingProfilesData, trunkToDelete]);

  const handleEdit = useCallback((trunk: Trunk) => {
    setEditingTrunk(trunk);
    setIsCreateDialogOpen(true);
  }, []);

  const handleDelete = useCallback((trunk: Trunk) => {
    setTrunkToDelete(trunk);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfigure = useCallback((trunk: Trunk) => {
    setConfiguringTrunk(trunk);
    setIsConfigureDialogOpen(true);
  }, []);

  const handleCreate = useCallback((type?: Trunk["type"]) => {
    setEditingTrunk(null);
    setInitialTrunkType(type || null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!trunkToDelete) return;

    deleteTrunkMutation.mutate(trunkToDelete.id, {
      onSuccess: () => {
        toastSuccess("Trunk deleted successfully");
        setDeleteDialogOpen(false);
        setTrunkToDelete(null);
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete trunk: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [trunkToDelete, deleteTrunkMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setTrunkToDelete(null);
  }, []);

  const columns = useMemo(
    () =>
      getTrunkColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onConfigure: handleConfigure,
        routingProfileCount: routingProfileCounts,
      }),
    [handleEdit, handleDelete, handleConfigure, routingProfileCounts]
  );

  const summary = useMemo(() => {
    const total = trunks.length;
    const active = trunks.filter((t) => t.status === "active").length;
    const outbound = trunks.filter((t) => t.direction === "outbound" || t.direction === "bidirectional").length;
    const inbound = trunks.filter((t) => t.direction === "inbound" || t.direction === "bidirectional").length;

    return {
      total,
      active,
      outbound,
      inbound,
    };
  }, [trunks]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {error?.message || "Failed to load trunks."}
      </div>
    );
  }

  if (isLoading && trunks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <WaveLoader className="text-primary" />
        <span>Loading trunks...</span>
      </div>
    );
  }

  const canDelete = trunkToDelete && routingProfilesForDelete && 
    routingProfilesForDelete.outbound === 0 && routingProfilesForDelete.inbound === 0;

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
          title="Trunks"
          icon={Phone}
          action={
            <CreateButtonWithDropdown
              buttonText="Create Trunk"
              options={[
                {
                  label: "Twilio",
                  onClick: () => handleCreate("twilio"),
                },
                {
                  label: "LiveKit Outbound",
                  onClick: () => handleCreate("livekit_outbound"),
                },
                {
                  label: "LiveKit Inbound",
                  onClick: () => handleCreate("livekit_inbound"),
                },
                {
                  label: "Custom",
                  onClick: () => handleCreate("custom"),
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
                { title: "Total trunks", value: summary.total },
                { title: "Active trunks", value: summary.active },
                { title: "Outbound trunks", value: summary.outbound },
                { title: "Inbound trunks", value: summary.inbound },
              ]}
              columns={4}
            />

            {/* Filters */}
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Direction</label>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All directions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All directions</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="bidirectional">Bidirectional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="livekit_outbound">LiveKit Outbound</SelectItem>
                    <SelectItem value="livekit_inbound">LiveKit Inbound</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DataTable
              data={trunks}
              // @ts-expect-error - TanStack Table column type inference limitation
              columns={columns}
              emptyMessage={isLoading ? "Loading trunks..." : "No trunks found."}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trunk</DialogTitle>
            <DialogDescription>
              {canDelete ? (
                <>
                  Are you sure you want to delete trunk &ldquo;{trunkToDelete?.name}&rdquo;? This action cannot be undone.
                </>
              ) : (
                <>
                  Cannot delete trunk &ldquo;{trunkToDelete?.name}&rdquo;. This trunk is being used by{" "}
                  {(routingProfilesForDelete?.outbound || 0) + (routingProfilesForDelete?.inbound || 0)} routing profile(s).
                  {routingProfilesForDelete?.outbound ? (
                    <div className="mt-2">
                      • {routingProfilesForDelete.outbound} outbound routing profile(s)
                    </div>
                  ) : null}
                  {routingProfilesForDelete?.inbound ? (
                    <div className="mt-2">
                      • {routingProfilesForDelete.inbound} inbound routing profile(s)
                    </div>
                  ) : null}
                  <div className="mt-2">
                    Please remove this trunk from all routing profiles before deleting it.
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancelDelete}>
              Cancel
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteTrunkMutation.isPending}
              >
                {deleteTrunkMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrunkDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingTrunk(null);
            setInitialTrunkType(null);
          }
        }}
        trunk={editingTrunk}
        initialType={initialTrunkType}
        onSuccess={() => {
          // Query will automatically refetch
        }}
      />

      {/* Configure Dialog */}
      <TrunkDialog
        open={isConfigureDialogOpen}
        onOpenChange={(open) => {
          setIsConfigureDialogOpen(open);
          if (!open) {
            setConfiguringTrunk(null);
          }
        }}
        trunk={configuringTrunk}
        configurationOnly={true}
        onSuccess={() => {
          // Query will automatically refetch
        }}
      />
    </div>
  );
}

