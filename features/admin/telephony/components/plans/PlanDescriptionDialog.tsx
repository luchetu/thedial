"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Description } from "@/components/ui/description";
import { JsonEditor } from "@/components/ui/json-editor";
import type { Plan } from "@/features/admin/telephony/types";
import { useMemo } from "react";

interface PlanDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const formatCurrency = (valueInCents?: number) => {
  if (typeof valueInCents !== "number" || Number.isNaN(valueInCents)) return "—";
  return currencyFormatter.format(valueInCents / 100);
};

const formatMinutes = (minutes?: number) => {
  if (typeof minutes !== "number" || Number.isNaN(minutes)) return "0 min";
  return `${minutes.toLocaleString()} min`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const PlanDescriptionDialog = ({
  open,
  onOpenChange,
  plan,
}: PlanDescriptionDialogProps) => {
  const jsonBlocks = useMemo(() => {
    if (!plan) {
      return {
        defaultRecordingPolicy: "",
        complianceFeatures: "",
        metadata: "",
      };
    }

    const safeStringify = (value: unknown) => {
      if (!value) return "";
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    };

    return {
      defaultRecordingPolicy: safeStringify(plan.defaultRecordingPolicy),
      complianceFeatures: safeStringify(plan.complianceFeatures),
      metadata: safeStringify(plan.metadata),
    };
  }, [plan]);

  if (!plan) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="max-w-none md:max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plan description</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <Description
            columns={3}
            items={[
              { label: "Code", value: <span className="font-mono">{plan.code}</span> },
              { label: "Name", value: plan.name || "—" },
              { label: "Billing product ID", value: plan.billingProductId || "—" },
              {
                label: "Monthly price",
                value: formatCurrency(plan.monthlyPriceCents),
              },
              {
                label: "Per-number price",
                value: formatCurrency(plan.perNumberMonthlyPriceCents),
              },
              {
                label: "Included numbers",
                value:
                  typeof plan.includedPhoneNumbers === "number"
                    ? plan.includedPhoneNumbers.toLocaleString()
                    : "0",
              },
              {
                label: "Included AI minutes",
                value: formatMinutes(plan.includedAiMinutes),
              },
              {
                label: "Included PSTN minutes",
                value: formatMinutes(plan.includedPstnMinutes),
              },
              {
                label: "Included realtime minutes",
                value: formatMinutes(plan.includedRealtimeMinutes),
              },
              {
                label: "Included transcription minutes",
                value: formatMinutes(plan.includedTranscriptionMinutes),
              },
              {
                label: "Allowed countries",
                value:
                  plan.allowedCountries && plan.allowedCountries.length > 0
                    ? plan.allowedCountries.join(", ")
                    : "All countries",
              },
              {
                label: "Default routing profile template",
                value: plan.defaultRoutingProfileTemplateId || "—",
              },
              {
                label: "Created at",
                value: formatDateTime(plan.createdAt),
              },
              {
                label: "Updated at",
                value: formatDateTime(plan.updatedAt),
              },
            ]}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Default recording policy (JSON)
              </p>
              <JsonEditor
                value={jsonBlocks.defaultRecordingPolicy}
                onChange={() => {
                  // read-only in this dialog
                }}
                height="180px"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Compliance features (JSON)
              </p>
              <JsonEditor
                value={jsonBlocks.complianceFeatures}
                onChange={() => {
                  // read-only in this dialog
                }}
                height="180px"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Metadata (JSON)
              </p>
              <JsonEditor
                value={jsonBlocks.metadata}
                onChange={() => {
                  // read-only in this dialog
                }}
                height="180px"
                className="bg-background"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


