"use client";

import { useCallback, useMemo, useState } from "react";
import { Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WaveLoader } from "@/components/ui/wave-loader";
import { Separator } from "@/components/ui/separator";
import { toastError, toastSuccess } from "@/lib/toast";
import { getPlanRoutingProfileColumns } from "@/features/admin/telephony/components/plan-routing-profiles/columns";
import { PlanRoutingProfileDialog } from "@/features/admin/telephony/components/plan-routing-profiles/PlanRoutingProfileDialog";
import {
  usePlanRoutingProfiles,
  useDeletePlanRoutingProfile,
} from "@/features/admin/telephony/hooks/usePlanRoutingProfiles";
import { useRoutingProfiles } from "@/features/admin/telephony/hooks/useRoutingProfiles";
import type { PlanRoutingProfile, Plan } from "@/features/admin/telephony/types";
import { countryCodes } from "@/lib/constants/countryCodes";

const countryLookup = new Map(countryCodes.map((country) => [country.code, country]));

const formatCountry = (countryCode?: string) => {
  if (!countryCode) return "—";
  const normalized = countryCode.toUpperCase();
  const match = countryLookup.get(normalized);
  if (!match) {
    return normalized;
  }
  return `${match.flag || ""} ${normalized}`.trim();
};

interface PlanRoutingProfilesSectionProps {
  plan: Plan;
  plans?: Plan[];
}

export function PlanRoutingProfilesSection({
  plan,
  plans = [],
}: PlanRoutingProfilesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<PlanRoutingProfile | null>(null);

  const {
    data: mappingsData,
    isLoading,
    error,
  } = usePlanRoutingProfiles(plan.code);
  const mappings = useMemo(() => mappingsData ?? [], [mappingsData]);

  const { data: routingProfilesData = [] } = useRoutingProfiles();
  const deletePlanRoutingProfile = useDeletePlanRoutingProfile();

  const handleEdit = useCallback((mapping: PlanRoutingProfile) => {
    setEditingMapping(mapping);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((mapping: PlanRoutingProfile) => {
    if (!mapping?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete the mapping for "${formatCountry(mapping.country) || mapping.region || "this location"}"?`
    );
    if (!confirmed) return;

    deletePlanRoutingProfile.mutate(mapping.id, {
      onSuccess: () => {
        toastSuccess("Mapping deleted successfully");
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete mapping: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [deletePlanRoutingProfile]);

  // Enhanced columns with routing profile names (without planCode since we're on plan page)
  const columns = useMemo(
    () => {
      const baseColumns = getPlanRoutingProfileColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        routingProfiles: routingProfilesData,
      });

      // Filter out planCode column since we're on the plan page
      return baseColumns.filter((column) => column.id !== "planCode");
    },
    [routingProfilesData, handleEdit, handleDelete]
  );

  const handleCreate = useCallback(() => {
    setEditingMapping(null);
    setIsDialogOpen(true);
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {error.message || "Failed to load routing profile mappings"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Routing Profile Mappings
          </h4>
          <p className="text-xs text-muted-foreground">
            Configure which routing profiles are used for this plan by country or region
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCreate}>
          <Plus className="size-4" />
          Add mapping
        </Button>
      </div>

      <Separator />

      {isLoading && mappings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-sm text-muted-foreground">
          <WaveLoader className="text-primary" />
          <span>Loading mappings…</span>
        </div>
      ) : mappings.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          <p>No routing profile mappings configured for this plan.</p>
          <p className="mt-1">Add a mapping to specify which routing profile to use by country or region.</p>
        </div>
      ) : (
        <DataTable
          data={mappings}
          // @ts-expect-error - TanStack Table column type inference limitation
          columns={columns}
          emptyMessage="No mappings found"
        />
      )}

      <PlanRoutingProfileDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingMapping(null);
          }
        }}
        mapping={editingMapping}
        plans={plans}
        routingProfiles={routingProfilesData}
        initialPlanCode={plan.code}
      />
    </div>
  );
}

