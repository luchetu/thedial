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
import { TwilioTrunkDialog } from "@/features/admin/telephony/components/trunks/dialogs/TwilioTrunkDialog";
import { LiveKitOutboundTrunkDialog } from "@/features/admin/telephony/components/trunks/dialogs/LiveKitOutboundTrunkDialog";
import { LiveKitInboundTrunkDialog } from "@/features/admin/telephony/components/trunks/dialogs/LiveKitInboundTrunkDialog";
import { CustomTrunkDialog } from "@/features/admin/telephony/components/trunks/dialogs/CustomTrunkDialog";
import { TwilioConfigurationDialog } from "@/features/admin/telephony/components/trunks/dialogs/TwilioConfigurationDialog";
import { LiveKitOutboundConfigurationDialog } from "@/features/admin/telephony/components/trunks/dialogs/LiveKitOutboundConfigurationDialog";
import { LiveKitInboundConfigurationDialog } from "@/features/admin/telephony/components/trunks/dialogs/LiveKitInboundConfigurationDialog";
import { CustomConfigurationDialog } from "@/features/admin/telephony/components/trunks/dialogs/CustomConfigurationDialog";
import {
  useTrunks,
  useDeleteTrunk,
  useRoutingProfilesForAllTrunks,
} from "@/features/admin/telephony/hooks/useTrunks";
import type { Trunk } from "@/features/admin/telephony/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ColumnFiltersState, ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrunksPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trunkToDelete, setTrunkToDelete] = useState<Trunk | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Trunk | null>(null);
  const [configuringTrunk, setConfiguringTrunk] = useState<Trunk | null>(null);
  const [initialTrunkType, setInitialTrunkType] = useState<Trunk["type"] | null>(null);

  const {
    data: trunksData,
    isLoading,
    error,
  } = useTrunks();
  const trunks = useMemo(() => trunksData ?? [], [trunksData]);

  const deleteTrunkMutation = useDeleteTrunk();

  // Fetch routing profiles for each trunk to show usage
  const routingProfileQueries = useRoutingProfilesForAllTrunks(trunks);

  const routingProfileCounts = useMemo(() => {
    const counts: Record<string, { outbound: number; inbound: number }> = {};
    trunks.forEach((trunk, index) => {
      const query = routingProfileQueries[index];
      if (query?.data) {
        counts[trunk.id] = {
          outbound: query.data.outbound.length,
          inbound: query.data.inbound.length,
        };
      } else {
      counts[trunk.id] = { outbound: 0, inbound: 0 };
      }
    });
    return counts;
  }, [trunks, routingProfileQueries]);

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

  const routingProfilesForDelete = trunkToDelete ? routingProfileCounts[trunkToDelete.id] : null;
  const canDelete = trunkToDelete && routingProfilesForDelete &&
    routingProfilesForDelete.outbound === 0 && routingProfilesForDelete.inbound === 0;

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-white flex flex-col">
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
            <div className="flex gap-4 items-end flex-wrap">
              <div className="space-y-2">
                <Label htmlFor="name-filter" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name-filter"
                  placeholder="Filter by name..."
                  value={(columnFilters.find((f) => f.id === "name")?.value as string) ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setColumnFilters((prev) => {
                      const newFilters = prev.filter((f) => f.id !== "name");
                      if (value) {
                        newFilters.push({ id: "name", value });
                      }
                      return newFilters;
                    });
                  }}
                  className="w-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direction-filter" className="text-sm font-medium">
                  Direction
                </Label>
                <Select
                  value={(columnFilters.find((f) => f.id === "direction")?.value as string) || undefined}
                  onValueChange={(value) => {
                    setColumnFilters((prev) => {
                      const newFilters = prev.filter((f) => f.id !== "direction");
                      if (value) {
                        newFilters.push({ id: "direction", value });
                      }
                      return newFilters;
                    });
                  }}
                >
                  <SelectTrigger id="direction-filter" className="w-[180px]">
                    <SelectValue placeholder="All directions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="bidirectional">Bidirectional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter" className="text-sm font-medium">
                  Type
                </Label>
                <Select
                  value={(columnFilters.find((f) => f.id === "type")?.value as string) || undefined}
                  onValueChange={(value) => {
                    setColumnFilters((prev) => {
                      const newFilters = prev.filter((f) => f.id !== "type");
                      if (value) {
                        newFilters.push({ id: "type", value });
                      }
                      return newFilters;
                    });
                  }}
                >
                  <SelectTrigger id="type-filter" className="w-[180px]">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="livekit_outbound">LiveKit Outbound</SelectItem>
                    <SelectItem value="livekit_inbound">LiveKit Inbound</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={(columnFilters.find((f) => f.id === "status")?.value as string) || undefined}
                  onValueChange={(value) => {
                    setColumnFilters((prev) => {
                      const newFilters = prev.filter((f) => f.id !== "status");
                      if (value) {
                        newFilters.push({ id: "status", value });
                      }
                      return newFilters;
                    });
                  }}
                >
                  <SelectTrigger id="status-filter" className="w-[180px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {columnFilters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium opacity-0">Clear</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setColumnFilters([])}
                    className="w-[180px]"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {isLoading && trunks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
                <WaveLoader className="text-primary" />
                <span>Loading trunks...</span>
              </div>
            ) : (
              <DataTable<Trunk>
              data={trunks}
                columns={columns as ColumnDef<Trunk>[]}
                emptyMessage="No trunks found."
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
            )}
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

      {/* Create/Edit Dialogs - Show appropriate dialog based on trunk type */}
      {isCreateDialogOpen && (
        <>
          {(editingTrunk?.type === "twilio" || initialTrunkType === "twilio") && (
            <TwilioTrunkDialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setEditingTrunk(null);
                  setInitialTrunkType(null);
                }
              }}
              trunk={editingTrunk || undefined}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {(editingTrunk?.type === "livekit_outbound" || initialTrunkType === "livekit_outbound") && (
            <LiveKitOutboundTrunkDialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setEditingTrunk(null);
                  setInitialTrunkType(null);
                }
              }}
              trunk={editingTrunk || undefined}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {(editingTrunk?.type === "livekit_inbound" || initialTrunkType === "livekit_inbound") && (
            <LiveKitInboundTrunkDialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  setEditingTrunk(null);
                  setInitialTrunkType(null);
                }
              }}
              trunk={editingTrunk || undefined}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {(editingTrunk?.type === "custom" || initialTrunkType === "custom") && (
            <CustomTrunkDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingTrunk(null);
            setInitialTrunkType(null);
          }
        }}
              trunk={editingTrunk || undefined}
        onSuccess={() => {
          // Query will automatically refetch
        }}
      />
          )}
        </>
      )}

      {/* Configure Dialogs - Show appropriate dialog based on trunk type */}
      {configuringTrunk && (
        <>
          {configuringTrunk.type === "twilio" && (
            <TwilioConfigurationDialog
              open={isConfigureDialogOpen}
              onOpenChange={(open) => {
                setIsConfigureDialogOpen(open);
                if (!open) {
                  setConfiguringTrunk(null);
                }
              }}
              trunk={configuringTrunk}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {configuringTrunk.type === "livekit_outbound" && (
            <LiveKitOutboundConfigurationDialog
              open={isConfigureDialogOpen}
              onOpenChange={(open) => {
                setIsConfigureDialogOpen(open);
                if (!open) {
                  setConfiguringTrunk(null);
                }
              }}
              trunk={configuringTrunk}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {configuringTrunk.type === "livekit_inbound" && (
            <LiveKitInboundConfigurationDialog
              open={isConfigureDialogOpen}
              onOpenChange={(open) => {
                setIsConfigureDialogOpen(open);
                if (!open) {
                  setConfiguringTrunk(null);
                }
              }}
              trunk={configuringTrunk}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
          {configuringTrunk.type === "custom" && (
            <CustomConfigurationDialog
              open={isConfigureDialogOpen}
              onOpenChange={(open) => {
                setIsConfigureDialogOpen(open);
                if (!open) {
                  setConfiguringTrunk(null);
                }
              }}
              trunk={configuringTrunk}
              onSuccess={() => {
                // Query will automatically refetch
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

