"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper } from "@/components/ui/data-table";
import { countryCodes } from "@/lib/constants/countryCodes";
import { formatDate } from "@/lib/utils/date";
import type { PlanRoutingProfile, RoutingProfile } from "@/features/admin/telephony/types";

const columnHelper = createColumnHelper<PlanRoutingProfile>();
const countryLookup = new Map(countryCodes.map((country) => [country.code, country]));

type PlanRoutingProfileColumnHandlers = {
  onEdit?: (mapping: PlanRoutingProfile) => void;
  onDelete?: (mapping: PlanRoutingProfile) => void;
  routingProfiles?: RoutingProfile[];
};

const formatCountry = (countryCode?: string) => {
  if (!countryCode) return "—";
  const normalized = countryCode.toUpperCase();
  const match = countryLookup.get(normalized);
  if (!match) {
    return normalized;
  }
  return `${match.flag || ""} ${normalized}`.trim();
};

export function getPlanRoutingProfileColumns({
  onEdit,
  onDelete,
  routingProfiles = [],
}: PlanRoutingProfileColumnHandlers = {}) {
  // Create a map for quick routing profile lookup
  const routingProfileMap = new Map(routingProfiles.map((profile) => [profile.id, profile]));

  return [
    columnHelper.accessor("planCode", {
      header: "Plan Code",
      enableSorting: true,
      cell: (info) => (
        <span className="font-mono text-xs uppercase font-medium">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("routingProfileId", {
      header: "Routing Profile",
      enableSorting: true,
      cell: (info) => {
        const profileId = info.getValue();
        const profile = routingProfileMap.get(profileId);
        if (profile) {
          return (
            <div className="space-y-1">
              <p className="font-medium text-sm">{profile.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{profileId}</p>
            </div>
          );
        }
        return (
          <span className="font-mono text-xs text-muted-foreground">{profileId}</span>
        );
      },
    }),
    columnHelper.accessor((row) => row.region ?? row.country ?? "", {
      id: "location",
      header: "Country/Region",
      cell: (info) => {
        const mapping = info.row.original;
        if (mapping.region) {
          return <Badge variant="outline">Region: {mapping.region}</Badge>;
        }
        if (mapping.country) {
          return <span className="text-sm">{formatCountry(mapping.country)}</span>;
        }
        return <span className="text-muted-foreground">—</span>;
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      enableSorting: true,
      cell: (info) => (
        <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const mapping = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(mapping)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
            >
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete?.(mapping)}>
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];
}

