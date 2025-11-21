"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Key, Pencil, Trash2 } from "lucide-react";
import type { TwilioCredentialList } from "@/features/admin/telephony/types";

interface GetCredentialListColumnsParams {
  onEdit: (credentialList: TwilioCredentialList) => void;
  onDelete: (credentialList: TwilioCredentialList) => void;
  onManageCredentials: (credentialList: TwilioCredentialList) => void;
}

export function getCredentialListColumns({
  onEdit,
  onDelete,
  onManageCredentials,
}: GetCredentialListColumnsParams): ColumnDef<TwilioCredentialList>[] {
  return [
    {
      accessorKey: "friendlyName",
      header: "Name",
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.friendlyName}</div>;
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
        const credentialList = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onManageCredentials(credentialList)}
              title="Manage credentials"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(credentialList)}
              title="Edit credential list"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(credentialList)}
              className="text-destructive hover:text-destructive"
              title="Delete credential list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

