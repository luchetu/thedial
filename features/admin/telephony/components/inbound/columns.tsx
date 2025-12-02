"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper } from "@/components/ui/data-table";
import type { InboundTrunk, DispatchRule, TwilioTrunk } from "@/features/admin/telephony/types";
import { formatDate } from "@/lib/utils/date";
import { Edit, Trash2 } from "lucide-react";

const inboundColumnHelper = createColumnHelper<InboundTrunk>();
const dispatchRuleColumnHelper = createColumnHelper<DispatchRule>();
const twilioOriginationColumnHelper = createColumnHelper<TwilioTrunk>();

interface InboundTrunkActionsProps {
  onEdit?: (trunk: InboundTrunk) => void;
  onDelete?: (trunk: InboundTrunk) => void;
}

interface DispatchRuleActionsProps {
  onEdit?: (rule: DispatchRule) => void;
  onDelete?: (rule: DispatchRule) => void;
}

interface TwilioOriginationActionsProps {
  onEdit?: (trunk: TwilioTrunk) => void;
}

export function getInboundTrunkColumns({ onEdit, onDelete }: InboundTrunkActionsProps = {}) {
  return [
    inboundColumnHelper.accessor("trunkId", {
      header: "Trunk ID",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    inboundColumnHelper.accessor("name", {
      header: "Trunk name",
      cell: (info) => info.getValue(),
    }),
    inboundColumnHelper.accessor("numbers", {
      header: "Numbers",
      cell: (info) => {
        const numbers = info.getValue();
        if (numbers.length === 0) return "All Numbers";
        return `${numbers.length} number${numbers.length !== 1 ? "s" : ""}`;
      },
    }),
    inboundColumnHelper.accessor("sipAddress", {
      header: "SIP Address",
      cell: (info) => (
        <span className="font-mono text-sm">{info.getValue() || "-"}</span>
      ),
    }),
    inboundColumnHelper.accessor("authUsername", {
      header: "Auth user",
      cell: (info) => {
        const username = info.getValue();
        return username ? <span className="font-mono text-sm">{username}</span> : "-";
      },
    }),
    inboundColumnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = (info.getValue() || "unknown").toLowerCase();
        const isActive = status === "active";
        return (
          <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    }),
    inboundColumnHelper.accessor("krispEnabled", {
      header: "Krisp",
      cell: (info) => (info.getValue() ? "Enabled" : "Disabled"),
    }),
    inboundColumnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    inboundColumnHelper.display({
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

export function getDispatchRuleColumns({ onEdit, onDelete }: DispatchRuleActionsProps = {}) {
  return [
    dispatchRuleColumnHelper.accessor("ruleId", {
      header: "Rule ID",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    dispatchRuleColumnHelper.accessor("name", {
      header: "Rule name",
      cell: (info) => info.getValue(),
    }),
    dispatchRuleColumnHelper.accessor("type", {
      header: "Type",
      cell: (info) => {
        const type = info.getValue();
        const typeColors = {
          individual: "bg-blue-100 text-blue-700",
          direct: "bg-green-100 text-green-700",
          callee: "bg-purple-100 text-purple-700",
        };
        return (
          <Badge className={typeColors[type] || "bg-gray-100 text-gray-700"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
    }),
    dispatchRuleColumnHelper.accessor("trunkIds", {
      header: "Trunks",
      cell: (info) => {
        const trunkIds = info.getValue();
        if (!trunkIds || trunkIds.length === 0) return "All trunks";
        return `${trunkIds.length} trunk${trunkIds.length !== 1 ? "s" : ""}`;
      },
    }),
    dispatchRuleColumnHelper.accessor("agentName", {
      header: "Agent",
      cell: (info) => info.getValue() || "-",
    }),
    dispatchRuleColumnHelper.accessor("autoDispatch", {
      header: "Auto-dispatch",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    }),
    dispatchRuleColumnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    dispatchRuleColumnHelper.display({
      id: "actions",
      enableColumnFilter: false, // Disable filtering for actions column
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const rule = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(rule)}
                title="Edit SIP dispatch rule"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(rule)}
                className="text-destructive hover:text-destructive"
                title="Delete SIP dispatch rule"
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

export function getTwilioOriginationColumns({ onEdit }: TwilioOriginationActionsProps = {}) {
  return [
    twilioOriginationColumnHelper.accessor("id", {
      header: "Trunk ID",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    twilioOriginationColumnHelper.accessor("friendlyName", {
      header: "Trunk name",
      cell: (info) => info.getValue(),
    }),
    twilioOriginationColumnHelper.accessor("domainName", {
      header: "Domain",
      cell: (info) => <span className="font-mono">{info.getValue()}</span>,
    }),
    twilioOriginationColumnHelper.display({
      id: "origination",
      header: "Origination",
      cell: () => (
        <span className="text-muted-foreground text-sm">Configured</span>
      ),
    }),
    twilioOriginationColumnHelper.accessor("createdAt", {
      header: "Created at",
      cell: (info) => (
        <span className="text-muted-foreground">{formatDate(info.getValue())}</span>
      ),
    }),
    twilioOriginationColumnHelper.display({
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
          </div>
        );
      },
    }),
  ];
}

