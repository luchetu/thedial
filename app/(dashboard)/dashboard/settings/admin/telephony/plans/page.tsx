"use client";

import { useCallback, useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WaveLoader } from "@/components/ui/wave-loader";
import { StatsGrid } from "@/components/ui/stat-card";
import { getPlanColumns } from "@/features/admin/telephony/components/plans/columns";
import { PlanDialog } from "@/features/admin/telephony/components/plans/PlanDialog";
import { usePlans } from "@/features/admin/telephony/hooks/usePlans";
import type { Plan } from "@/features/admin/telephony/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function AdminPlansPage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const {
    data: plansData,
    isLoading,
    error,
  } = usePlans();

  const plans = useMemo(() => plansData ?? [], [plansData]);

  const summary = useMemo(() => {
    if (plans.length === 0) {
      return {
        totalPlans: 0,
        averageMonthlyPrice: "$0.00",
        totalIncludedNumbers: 0,
      };
    }

    const totalMonthly = plans.reduce((total, plan) => total + plan.monthlyPriceCents, 0);

    return {
      totalPlans: plans.length,
      averageMonthlyPrice: currencyFormatter.format(totalMonthly / plans.length / 100),
      totalIncludedNumbers: plans.reduce(
        (total, plan) => total + plan.includedPhoneNumbers,
        0
      ),
    };
  }, [plans]);

  const handleCreatePlan = useCallback(() => {
    setEditingPlan(null);
    setIsPlanDialogOpen(true);
  }, []);

  const handleEditPlan = useCallback((plan: Plan) => {
    setEditingPlan(plan);
    setIsPlanDialogOpen(true);
  }, []);

  const handleDeletePlan = useCallback((plan: Plan) => {
    // TODO: Wire to delete confirmation + mutation
    console.debug("Delete plan", plan.id);
  }, []);

  const planColumns = useMemo(
    () =>
      getPlanColumns({
        onEdit: handleEditPlan,
        onDelete: handleDeletePlan,
      }),
    [handleEditPlan, handleDeletePlan]
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {error.message || "Failed to load plans."}
      </div>
    );
  }

  if (isLoading && plans.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <WaveLoader className="text-primary" />
        <span>Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <PageHeader
          title="Plans"
          icon={Layers}
          action={
            <Button variant="secondary" onClick={handleCreatePlan}>
              <Plus className="size-4" />
              Create plan
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <StatsGrid
              stats={[
                { title: "Total plans", value: summary.totalPlans },
                {
                  title: "Avg. monthly price",
                  value: summary.averageMonthlyPrice,
                },
                {
                  title: "Included numbers",
                  value: summary.totalIncludedNumbers.toLocaleString(),
                },
              ]}
              columns={3}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Plan catalog</h3>
              <DataTable
                data={plans}
                // @ts-expect-error - TanStack Table column type inference limitation
                columns={planColumns}
                emptyMessage={isLoading ? "Loading plans..." : "No plans found."}
              />
            </div>
          </div>
        </div>
      </div>

      <PlanDialog
        open={isPlanDialogOpen}
        plan={editingPlan}
        onOpenChange={(open) => {
          setIsPlanDialogOpen(open);
          if (!open) {
            setEditingPlan(null);
          }
        }}
      />
    </div>
  );
}
