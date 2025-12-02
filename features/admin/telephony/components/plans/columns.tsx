"use client";

import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@/components/ui/data-table";
import type { Plan } from "@/features/admin/telephony/types";
import { Edit, Eye, Trash2 } from "lucide-react";

const columnHelper = createColumnHelper<Plan>();
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

interface PlanColumnActionsProps {
  onView?: (plan: Plan) => void;
  onEdit?: (plan: Plan) => void;
  onDelete?: (plan: Plan) => void;
}

function formatCurrency(valueInCents: number) {
  if (Number.isNaN(valueInCents)) return "—";
  return currencyFormatter.format(valueInCents / 100);
}

function formatMinutes(label: string, minutes: number) {
  return `${minutes.toLocaleString()} ${label}`;
}

function formatCountries(countries: string[]) {
  if (!countries.length) return "All countries";
  if (countries.length <= 3) return countries.join(", ");
  return `${countries.slice(0, 3).join(", ")} +${countries.length - 3}`;
}

export function getPlanColumns({ onView, onEdit, onDelete }: PlanColumnActionsProps = {}) {
  return [
    columnHelper.accessor("code", {
      header: "Code",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue() ?? "—",
    }),
    columnHelper.accessor("monthlyPriceCents", {
      header: "Monthly",
      cell: (info) => (
        <span className="font-medium">{formatCurrency(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("includedPhoneNumbers", {
      header: "Numbers",
      cell: (info) => info.getValue().toLocaleString(),
    }),
    columnHelper.accessor("perNumberMonthlyPriceCents", {
      header: "Per-number",
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor("allowedCountries", {
      header: "Countries",
      cell: (info) => formatCountries(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      enableColumnFilter: false, // Disable filtering for actions column
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const plan = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(plan)}
                title="View description"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(plan)}
                title="Edit plan"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(plan)}
                className="text-destructive hover:text-destructive"
                title="Delete plan"
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
