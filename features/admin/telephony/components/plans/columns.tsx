"use client";

import { Button } from "@/components/ui/button";
import { createColumnHelper } from "@/components/ui/data-table";
import type { Plan } from "@/features/admin/telephony/types";

const columnHelper = createColumnHelper<Plan>();
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

interface PlanColumnActionsProps {
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

export function getPlanColumns({ onEdit, onDelete }: PlanColumnActionsProps = {}) {
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
    columnHelper.group({
      id: "allowances",
      header: "Allowances",
      columns: [
        columnHelper.accessor("includedRealtimeMinutes", {
          id: "realtime",
          header: "Realtime",
          cell: (info) => formatMinutes("min", info.getValue()),
        }),
        columnHelper.accessor("includedTranscriptionMinutes", {
          id: "transcription",
          header: "Transcription",
          cell: (info) => formatMinutes("min", info.getValue()),
        }),
        columnHelper.accessor("includedAiMinutes", {
          id: "ai",
          header: "AI",
          cell: (info) => formatMinutes("min", info.getValue()),
        }),
      ],
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
      header: () => <div className="text-right">Actions</div>,
      cell: (info) => {
        const plan = info.row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(plan)}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(plan)}
            >
              Delete
            </Button>
          </div>
        );
      },
    }),
  ];
}
