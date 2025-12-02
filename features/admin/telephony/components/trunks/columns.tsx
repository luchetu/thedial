"use client";

import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@/components/ui/data-table";
import type { Trunk } from "@/features/admin/telephony/types";
import { formatDate } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";

const columnHelper = createColumnHelper<Trunk>();

interface TrunkColumnActionsProps {
  onEdit?: (trunk: Trunk) => void;
  onDelete?: (trunk: Trunk) => void;
  onConfigure?: (trunk: Trunk) => void;
  routingProfileCount?: Record<string, { outbound: number; inbound: number }>;
}

const getTypeLabel = (type: Trunk["type"]) => {
  switch (type) {
    case "twilio":
      return "Twilio";
    case "livekit_outbound":
      return "LiveKit Outbound";
    case "livekit_inbound":
      return "LiveKit Inbound";
    case "custom":
      return "Custom";
    default:
      return type;
  }
};

const getDirectionLabel = (direction: Trunk["direction"]) => {
  switch (direction) {
    case "outbound":
      return "Outbound";
    case "inbound":
      return "Inbound";
    case "bidirectional":
      return "Bidirectional";
    default:
      return direction;
  }
};

const getTypeBadge = (type: Trunk["type"]) => {
  const typeColors: Record<Trunk["type"], string> = {
    twilio: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
    livekit_outbound: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    livekit_inbound: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
    custom: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800",
  };
  return (
    <Badge variant="outline" className={typeColors[type]}>
      {getTypeLabel(type)}
    </Badge>
  );
};

const getDirectionBadge = (direction: Trunk["direction"]) => {
  const directionColors: Record<Trunk["direction"], string> = {
    outbound: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800",
    inbound: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800",
    bidirectional: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800",
  };
  return (
    <Badge variant="outline" className={directionColors[direction]}>
      {getDirectionLabel(direction)}
    </Badge>
  );
};

const getStatusBadge = (status: Trunk["status"]) => {
  const statusColors: Record<Trunk["status"], string> = {
    active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
    inactive: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
    pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  };
  return (
    <Badge variant="outline" className={statusColors[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function getTrunkColumns({ onEdit, onDelete, onConfigure, routingProfileCount }: TrunkColumnActionsProps = {}) {
  return [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <div className="font-medium">{info.getValue()}</div>
      ),
      filterFn: "includesString", // Case-insensitive string inclusion for name search
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => getTypeBadge(info.getValue()),
      filterFn: "equalsString", // Exact match for type
    }),
    columnHelper.accessor("direction", {
      header: "Direction",
      cell: (info) => getDirectionBadge(info.getValue()),
      filterFn: "equalsString", // Exact match for direction
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => getStatusBadge(info.getValue()),
      filterFn: "equalsString", // Exact match for status
    }),
    columnHelper.display({
      id: "usage",
      header: "Usage",
      cell: (info) => {
        const trunk = info.row.original;
        const usage = routingProfileCount?.[trunk.id];
        if (!usage) return <span className="text-muted-foreground">-</span>;
        const total = usage.outbound + usage.inbound;
        if (total === 0) return <span className="text-muted-foreground">0</span>;
        return (
          <div className="flex items-center gap-2">
            <span>{total}</span>
            {total > 0 && (
              <Link
                href={`/dashboard/settings/admin/telephony/trunks/${trunk.id}/routing-profiles`}
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        );
      },
      enableColumnFilter: false, // Disable filtering for usage column
    }),
    columnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => {
        const date = info.getValue();
        return date ? (
          <span className="text-muted-foreground">{formatDate(date)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
      enableColumnFilter: false, // Disable filtering for date column
    }),
    columnHelper.display({
      id: "actions",
      enableColumnFilter: false, // Disable filtering for actions column
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const trunk = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {onConfigure && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure(trunk)}
                title="Configure trunk"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(trunk)}
                title="Edit trunk"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(trunk)}
                className="text-destructive hover:text-destructive"
                title="Delete trunk"
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

