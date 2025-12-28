"use client";

import { useCallback, useMemo, useState } from "react";
import { Link2, Plus, X } from "lucide-react";
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
import { WaveLoader } from "@/components/ui/wave-loader";
import { StatsGrid } from "@/components/ui/stat-card";
import { toastError, toastSuccess } from "@/lib/toast";
import { getPlanRoutingProfileColumns } from "@/features/admin/telephony/components/plan-routing-profiles/columns";
import { PlanRoutingProfileDialog } from "@/features/admin/telephony/components/plan-routing-profiles/PlanRoutingProfileDialog";
import {
  usePlanRoutingProfiles,
  useDeletePlanRoutingProfile,
} from "@/features/admin/telephony/hooks/usePlanRoutingProfiles";
import { usePlans } from "@/features/admin/telephony/hooks/usePlans";
import { useRoutingProfiles } from "@/features/admin/telephony/hooks/useRoutingProfiles";
import type { PlanRoutingProfile } from "@/features/admin/telephony/types";

export default function PlanRoutingProfilesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<PlanRoutingProfile | null>(null);
  const [planFilter, setPlanFilter] = useState("");

  const filters = useMemo(
    () => ({
      planCode: planFilter.trim() || undefined,
    }),
    [planFilter]
  );

  const {
    data: mappingsData,
    isLoading,
    error,
  } = usePlanRoutingProfiles(filters.planCode);
  const mappings = useMemo(() => mappingsData ?? [], [mappingsData]);

  const deletePlanRoutingProfile = useDeletePlanRoutingProfile();

  const { data: plansData = [] } = usePlans();
  const { data: routingProfilesData = [] } = useRoutingProfiles();

  const handleCreate = useCallback(() => {
    setEditingMapping(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditMapping = useCallback((mapping: PlanRoutingProfile) => {
    setEditingMapping(mapping);
    setIsDialogOpen(true);
  }, []);

  const handleDeleteMapping = useCallback((mapping: PlanRoutingProfile) => {
    if (!mapping?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete the mapping for plan "${mapping.planCode}"?`
    );
    if (!confirmed) return;

    deletePlanRoutingProfile.mutate(mapping.id, {
      onSuccess: () => {
        toastSuccess("Plan routing profile mapping deleted");
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete mapping: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [deletePlanRoutingProfile]);

  const columns = useMemo(
    () =>
      getPlanRoutingProfileColumns({
        onEdit: handleEditMapping,
        onDelete: handleDeleteMapping,
        routingProfiles: routingProfilesData,
      }),
    [handleEditMapping, handleDeleteMapping, routingProfilesData]
  );

  const stats = useMemo(() => {
    const uniquePlans = new Set(mappings.map((m) => m.planCode)).size;
    const uniqueProfiles = new Set(mappings.map((m) => m.routingProfileId)).size;
    const uniqueCountries = new Set(
      mappings.map((m) => m.country).filter(Boolean)
    ).size;
    const uniqueRegions = new Set(
      mappings.map((m) => m.region).filter(Boolean)
    ).size;

    return {
      totalMappings: mappings.length,
      uniquePlans,
      uniqueProfiles,
      uniqueCountries,
      uniqueRegions,
    };
  }, [mappings]);

  const resetFilters = useCallback(() => {
    setPlanFilter("");
  }, []);

  const activeFilters = [
    filters.planCode ? { label: "Plan", value: filters.planCode } : null,
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
                  <Link2 className="h-6 w-6" />
                  Plan Routing Profile Mappings
                </h1>
              </div>
              <Button onClick={handleCreate} variant="secondary" className="flex items-center gap-2">
                <Plus className="size-4" />
                Create mapping
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error.message || "Failed to load plan routing profile mappings"}
              </div>
            )}

            <StatsGrid
              stats={[
                { title: "Total mappings", value: stats.totalMappings },
                { title: "Plans", value: stats.uniquePlans },
                { title: "Routing profiles", value: stats.uniqueProfiles },
                { title: "Countries/Regions", value: stats.uniqueCountries + stats.uniqueRegions },
              ]}
              columns={4}
            />

            <div className="space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planRoutingProfilesPlanFilter">Plan filter</Label>
                  <Input
                    id="planRoutingProfilesPlanFilter"
                    value={planFilter}
                    onChange={(event) => setPlanFilter(event.target.value.toUpperCase())}
                    placeholder="PLAN_CODE"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Plan routing profile mappings</h3>
                </div>

                {isLoading && mappings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
                    <WaveLoader className="text-primary" />
                    <span>Loading mappings…</span>
                  </div>
                ) : (
                  <DataTable
                    data={mappings}
                    // @ts-expect-error - TanStack Table column type inference limitation
                    columns={columns}
                    emptyMessage={
                      isLoading ? "Loading mappings…" : "No plan routing profile mappings found."
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <PlanRoutingProfileDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingMapping(null);
            }
          }}
          mapping={editingMapping}
          plans={plansData}
          routingProfiles={routingProfilesData}
        />
      </div>
    </div>
  );
}

