"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { TwilioOriginationURL } from "@/features/admin/telephony/types";

interface GetOriginationURLColumnsParams {
  onEdit: (url: TwilioOriginationURL) => void;
  onDelete: (url: TwilioOriginationURL) => void;
}

export function getOriginationURLColumns({
  onEdit,
  onDelete,
}: GetOriginationURLColumnsParams): ColumnDef<TwilioOriginationURL>[] {
  return [
    {
      accessorKey: "friendlyName",
      header: "Name",
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.friendlyName}</div>;
      },
    },
    {
      accessorKey: "sipUrl",
      header: "SIP URL",
      cell: ({ row }) => {
        return <div className="font-mono text-sm">{row.original.sipUrl}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        return <div className="text-sm">{row.original.priority}</div>;
      },
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => {
        return <div className="text-sm">{row.original.weight}</div>;
      },
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge variant={row.original.enabled ? "default" : "secondary"}>
            {row.original.enabled ? "Enabled" : "Disabled"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const url = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onEdit(url)}
              title="Edit origination URL"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onDelete(url)}
              className="text-destructive hover:text-destructive"
              title="Delete origination URL"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

