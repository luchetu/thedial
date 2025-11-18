"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper } from "@/components/ui/data-table";
import { countryCodes } from "@/lib/constants/countryCodes";
import type { RoutingProfile } from "@/features/admin/telephony/types";
import { Trash2, Edit } from "lucide-react";

const columnHelper = createColumnHelper<RoutingProfile>();
const countryLookup = new Map(countryCodes.map((country) => [country.code, country]));

type RoutingProfileColumnHandlers = {
  onEdit?: (profile: RoutingProfile) => void;
  onDelete?: (profile: RoutingProfile) => void;
};

const formatOptional = (value?: string | null) => {
  if (!value) return "—";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
};

const formatCountry = (countryCode: string) => {
  const normalized = countryCode?.toUpperCase?.() ?? "";
  if (!normalized) return "—";
  const match = countryLookup.get(normalized);
  if (!match) {
    return normalized;
  }
  return `${match.flag || ""} ${normalized}`.trim();
};

export function getRoutingProfileColumns({
  onEdit,
  onDelete,
}: RoutingProfileColumnHandlers = {}) {
  return [
    columnHelper.accessor("name", {
      header: "Profile",
      enableSorting: true,
      cell: (info) => (
        <div className="space-y-1">
          <p className="font-medium leading-tight">{info.getValue()}</p>
          <p className="text-xs text-muted-foreground">
            {info.row.original.id}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.region ?? "", {
      id: "region",
      header: "Region",
      cell: (info) => {
        const region = info.getValue();
        if (!region) return "—";
        return <Badge variant="secondary">{region}</Badge>;
      },
    }),
    columnHelper.accessor("country", {
      header: "Country/Region",
      cell: (info) => {
        const profile = info.row.original;
        if (profile.region) {
          return <Badge variant="outline">Region: {profile.region}</Badge>;
        }
        return <span className="text-sm">{formatCountry(profile.country)}</span>;
      },
    }),
    columnHelper.accessor("outboundProvider", {
      header: "Outbound",
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit text-xs font-medium uppercase">
            {info.getValue()}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {formatOptional(info.row.original.outboundTrunkRef)}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.inboundProvider ?? "", {
      id: "inboundProvider",
      header: "Inbound",
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-xs uppercase">
            {formatOptional(info.getValue())}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {formatOptional(info.row.original.inboundTrunkRef)}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.dispatchProvider ?? "", {
      id: "dispatchProvider",
      header: "Dispatch",
      cell: (info) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-xs uppercase">
            {formatOptional(info.getValue())}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {formatOptional(info.row.original.dispatchRuleRef)}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const profile = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(profile)}
                title="Edit routing profile"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(profile)}
                className="text-destructive hover:text-destructive"
                title="Delete routing profile"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    }),
  ];
}

