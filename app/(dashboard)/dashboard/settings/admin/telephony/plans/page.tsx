"use client";

import { useCallback, useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatsGrid } from "@/components/ui/stat-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPlanColumns } from "@/features/admin/telephony/components/plans/columns";
import { PlanDialog } from "@/features/admin/telephony/components/plans/PlanDialog";
import { PlanDescriptionDialog } from "@/features/admin/telephony/components/plans/PlanDescriptionDialog";
import { usePlans, useDeletePlan } from "@/features/admin/telephony/hooks/usePlans";
import type { Plan } from "@/features/admin/telephony/types";
import { toastSuccess, toastError } from "@/lib/toast";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default function AdminPlansPage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [descriptionPlan, setDescriptionPlan] = useState<Plan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const {
    data: plansData,
    isLoading,
    error,
  } = usePlans();

  const deletePlan = useDeletePlan();

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

  const handleViewPlan = useCallback((plan: Plan) => {
    setDescriptionPlan(plan);
    setIsDescriptionOpen(true);
  }, []);

  const handleDeletePlan = useCallback((plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!planToDelete?.id) return;
    deletePlan.mutate(planToDelete.id, {
      onSuccess: () => {
        toastSuccess("Plan deleted");
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete plan: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [planToDelete, deletePlan]);

  const planColumns = useMemo(
    () =>
      getPlanColumns({
        onView: handleViewPlan,
        onEdit: handleEditPlan,
        onDelete: handleDeletePlan,
      }),
    [handleViewPlan, handleEditPlan, handleDeletePlan]
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {error.message || "Failed to load plans."}
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
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Layers className="h-6 w-6" />
                  Plans
                </h1>
              </div>
              <Button onClick={handleCreatePlan} variant="secondary" className="flex items-center gap-2">
                <Plus className="size-4" />
                Create plan
              </Button>
            </div>
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
                emptyMessage="No plans found."
                isLoading={isLoading}
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

      <PlanDescriptionDialog
        open={isDescriptionOpen}
        plan={descriptionPlan}
        onOpenChange={(open) => {
          setIsDescriptionOpen(open);
          if (!open) {
            setDescriptionPlan(null);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete plan &quot;{planToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPlanToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletePlan.isPending}
            >
              {deletePlan.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
