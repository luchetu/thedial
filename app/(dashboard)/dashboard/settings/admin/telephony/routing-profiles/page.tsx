"use client";

import { useCallback, useMemo, useState } from "react";
import { GitBranch, Plus, X } from "lucide-react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { StatsGrid } from "@/components/ui/stat-card";
import { toastError, toastSuccess } from "@/lib/toast";
import { countryCodes } from "@/lib/constants/countryCodes";
import { getRoutingProfileColumns } from "@/features/admin/telephony/components/routing-profiles/columns";
import { RoutingProfileDialog } from "@/features/admin/telephony/components/routing-profiles/RoutingProfileDialog";
import {
  useRoutingProfiles,
  useDeleteRoutingProfile,
} from "@/features/admin/telephony/hooks/useRoutingProfiles";
import { usePlans } from "@/features/admin/telephony/hooks/usePlans";
import { useTrunks } from "@/features/admin/telephony/hooks/useTrunks";
import { useDispatchRules } from "@/features/admin/telephony/hooks/useDispatchRules";
import type { RoutingProfile } from "@/features/admin/telephony/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RoutingProfilesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RoutingProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<RoutingProfile | null>(null);
  const [countryFilter, setCountryFilter] = useState("");

  const filters = useMemo(
    () => ({
      country: countryFilter.trim() || undefined,
    }),
    [countryFilter]
  );

  const {
    data: routingProfilesData,
    isLoading,
    error,
  } = useRoutingProfiles(filters);
  const routingProfiles = useMemo(() => routingProfilesData ?? [], [routingProfilesData]);

  const deleteRoutingProfile = useDeleteRoutingProfile();

  const { data: plansData = [] } = usePlans();

  // Fetch trunks using unified API
  const { data: outboundTrunksData = [] } = useTrunks({
    provider: "livekit",
    type: "livekit_outbound",
  });
  const { data: inboundTrunksData = [] } = useTrunks({
    provider: "livekit",
    type: "livekit_inbound",
  });

  const { data: dispatchRulesData = [] } = useDispatchRules();

  // Convert unified trunks to the format expected by RoutingProfileDialog
  // The dialog expects OutboundTrunk[] and InboundTrunk[] format
  const outboundTrunksForDialog = useMemo(() => {
    return outboundTrunksData.map((trunk) => ({
      id: trunk.id, // Internal UUID
      name: trunk.name,
      trunkId: trunk.externalId || trunk.id, // LiveKit trunk ID (externalId) or fallback to UUID
      numbers: [],
      twilioTrunkId: "",
      twilioSipAddress: "",
      twilioSipUsername: "",
    }));
  }, [outboundTrunksData]);

  const inboundTrunksForDialog = useMemo(() => {
    return inboundTrunksData.map((trunk) => ({
      id: trunk.id, // Internal UUID
      name: trunk.name,
      trunkId: trunk.externalId || trunk.id, // LiveKit trunk ID (externalId) or fallback to UUID
      numbers: [],
    }));
  }, [inboundTrunksData]);

  const handleCreate = useCallback(() => {
    setEditingProfile(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditProfile = useCallback((profile: RoutingProfile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteProfile = useCallback((profile: RoutingProfile) => {
    if (!profile?.id) return;
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!profileToDelete?.id) return;

    deleteRoutingProfile.mutate(profileToDelete.id, {
      onSuccess: () => {
        toastSuccess("Routing profile deleted");
        setDeleteDialogOpen(false);
        setProfileToDelete(null);
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete routing profile: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [profileToDelete, deleteRoutingProfile]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
  }, []);

  const columns = useMemo(
    () =>
      getRoutingProfileColumns({
        onEdit: handleEditProfile,
        onDelete: handleDeleteProfile,
      }),
    [handleEditProfile, handleDeleteProfile]
  );

  const stats = useMemo(() => {
    const uniqueCountries = new Set(
      routingProfiles.map((rp) => rp.country).filter(Boolean)
    );
    const uniqueRegions = new Set(
      routingProfiles.map((rp) => rp.region).filter(Boolean)
    );
    const inboundEnabled = routingProfiles.filter((profile) => profile.inboundProvider).length;

    return {
      totalProfiles: routingProfiles.length,
      uniqueCountries: uniqueCountries.size,
      uniqueRegions: uniqueRegions.size,
      inboundEnabled,
    };
  }, [routingProfiles]);

  const resetFilters = () => {
    setCountryFilter("");
  };

  const activeFilters = [
    filters.country ? { label: "Country", value: filters.country } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <GitBranch className="h-6 w-6" />
                  Routing Profiles
                </h1>
              </div>
              <Button onClick={handleCreate} variant="secondary" className="flex items-center gap-2">
                <Plus className="size-4" />
                Create profile
              </Button>
            </div>
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error.message || "Failed to load routing profiles"}
              </div>
            )}

            <StatsGrid
              stats={[
                { title: "Total profiles", value: stats.totalProfiles },
                { title: "Countries", value: stats.uniqueCountries },
                { title: "Regions", value: stats.uniqueRegions },
                { title: "Inbound configured", value: stats.inboundEnabled },
              ]}
              columns={4}
            />

            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routingProfilesCountryFilter">Country filter</Label>
                  <Input
                    id="routingProfilesCountryFilter"
                    value={countryFilter}
                    onChange={(event) => setCountryFilter(event.target.value.toUpperCase())}
                    placeholder="US"
                    maxLength={2}
                    list="routing-profile-countries"
                    className="uppercase"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary-outline" size="sm" onClick={resetFilters}>
                    <X className="size-4" />
                    Clear filters
                  </Button>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <Badge key={filter.label} variant="secondary">
                      {filter.label}: {filter.value}
                    </Badge>
                  ))}
                </div>
              )}

              <datalist id="routing-profile-countries">
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </datalist>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Routing profiles</h3>
                </div>

                <DataTable
                  data={routingProfiles}
                  // @ts-expect-error - TanStack Table column type inference limitation
                  columns={columns}
                  emptyMessage="No routing profiles found."
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoutingProfileDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingProfile(null);
          }
        }}
        profile={editingProfile}
        plans={plansData}
        outboundTrunks={outboundTrunksForDialog}
        inboundTrunks={inboundTrunksForDialog}
        dispatchRules={dispatchRulesData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Routing Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the routing profile &quot;{profileToDelete?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

