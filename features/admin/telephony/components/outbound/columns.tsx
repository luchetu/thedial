"use client";

import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@/components/ui/data-table";
import type { TwilioTrunk, OutboundTrunk } from "@/features/admin/telephony/types";
import { formatDate } from "@/lib/utils/date";

const twilioColumnHelper = createColumnHelper<TwilioTrunk>();
const livekitColumnHelper = createColumnHelper<OutboundTrunk>();

interface TwilioColumnActionsProps {
  onEdit?: (trunk: TwilioTrunk) => void;
  onDelete?: (trunk: TwilioTrunk) => void;
}

interface LiveKitColumnActionsProps {
  onEdit?: (trunk: OutboundTrunk) => void;
  onDelete?: (trunk: OutboundTrunk) => void;
}

export function getTwilioTrunkColumns({ onEdit, onDelete }: TwilioColumnActionsProps = {}) {
  return [
    twilioColumnHelper.accessor("id", {
      header: "Trunk ID",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    twilioColumnHelper.accessor("friendlyName", {
      header: "Trunk name",
      cell: (info) => info.getValue(),
    }),
    twilioColumnHelper.accessor("domainName", {
      header: "Domain",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    twilioColumnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    twilioColumnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const trunk = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(trunk)}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(trunk)}
            >
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];
}

export function getLiveKitOutboundTrunkColumns({ onEdit, onDelete }: LiveKitColumnActionsProps = {}) {
  return [
    livekitColumnHelper.accessor("trunkId", {
      header: "Trunk ID",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    livekitColumnHelper.accessor("name", {
      header: "Trunk name",
      cell: (info) => info.getValue(),
    }),
    livekitColumnHelper.accessor("numbers", {
      header: "Numbers",
      cell: (info) => {
        const numbers = info.getValue();
        const isWildcard = numbers.includes("*");
        return isWildcard
          ? "All Numbers"
          : `${numbers.length} number${numbers.length !== 1 ? "s" : ""}`;
      },
    }),
    livekitColumnHelper.accessor("twilioSipAddress", {
      header: "SIP URI",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    livekitColumnHelper.accessor("twilioTrunkName", {
      header: "Twilio trunk",
      cell: (info) => {
        const trunk = info.row.original;
        return trunk.twilioTrunkName || trunk.twilioTrunkId;
      },
    }),
    livekitColumnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    livekitColumnHelper.display({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const trunk = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(trunk)}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(trunk)}
            >
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];
}

