"use client";

import { LedgerEntry } from "@/features/billing/api";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface LedgerTableProps {
    entries: LedgerEntry[];
    loading?: boolean;
}

export const LedgerTable = ({ entries, loading }: LedgerTableProps) => {
    const columns: ColumnDef<LedgerEntry>[] = [
        {
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => <span className="text-muted-foreground">{format(new Date(row.original.created_at), "MMM d, yyyy h:mm a")}</span>
        },
        {
            accessorKey: "event_type",
            header: "Description",
            cell: ({ row }) => <span className="capitalize font-medium">{row.original.event_type.replace(/_/g, " ")}</span>
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = row.original.amount;
                const isPositive = amount > 0;
                return (
                    <div className={cn("flex items-center gap-1 font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                        {Math.abs(amount).toFixed(2)} Credits
                    </div>
                )
            }
        }
    ];

    if (loading) {
        return <DataTable columns={columns} data={[]} />;
    }

    return (
        <DataTable
            columns={columns}
            data={entries}
        />
    );
};
