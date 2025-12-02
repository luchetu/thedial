"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { TwilioCredential } from "@/features/admin/telephony/types";

interface GetCredentialColumnsParams {
  onEdit: (credential: TwilioCredential) => void;
  onDelete: (credential: TwilioCredential) => void;
}

export function getCredentialColumns({
  onEdit,
  onDelete,
}: GetCredentialColumnsParams): ColumnDef<TwilioCredential>[] {
  return [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        return <div className="font-medium font-mono">{row.original.username}</div>;
      },
    },
    {
      accessorKey: "sid",
      header: "SID",
      cell: ({ row }) => {
        return <div className="font-mono text-sm text-muted-foreground">{row.original.sid}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const credential = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(credential)}
              title="Update password"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(credential)}
              className="text-destructive hover:text-destructive"
              title="Delete credential"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

