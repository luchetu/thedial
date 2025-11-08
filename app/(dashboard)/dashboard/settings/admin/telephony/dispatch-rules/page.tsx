"use client";

import { useEffect, useState } from "react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Route } from "lucide-react";
import type { DispatchRule } from "@/features/admin/telephony/types";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { DispatchRuleDialog } from "@/features/admin/telephony/components/dispatch-rules/DispatchRuleDialog";
import { getDispatchRuleColumns } from "@/features/admin/telephony/components/inbound/columns";
import { StatsGrid } from "@/components/ui/stat-card";
import { useDispatchRules, useDeleteDispatchRule } from "@/features/admin/telephony/hooks/useDispatchRules";
import { toastError, toastSuccess } from "@/lib/toast";

export default function DispatchRulesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DispatchRule | null>(null);

  const {
    data: dispatchRules = [],
    isLoading,
    isError,
    error,
  } = useDispatchRules();
  const deleteMutation = useDeleteDispatchRule();

  useEffect(() => {
    if (isError && error) {
      toastError(error.message || "Failed to load dispatch rules");
    }
  }, [isError, error]);

  // Handle actions
  const handleEditRule = (rule: DispatchRule) => {
    setEditingRule(rule);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteRule = (rule: DispatchRule) => {
    deleteMutation.mutate(rule.id, {
      onSuccess: () => {
        toastSuccess("Dispatch rule deleted");
      },
      onError: (mutationError) => {
        toastError(`Failed to delete dispatch rule: ${mutationError?.message || "Unknown error"}`);
      },
    });
  };

  // Get column definitions with handlers
  const dispatchRuleColumns = getDispatchRuleColumns({
    onEdit: handleEditRule,
    onDelete: handleDeleteRule,
  });

  // Calculate summary statistics
  const totalDispatchRules = dispatchRules.length;
  const individualRules = dispatchRules.filter((r) => r.type === "individual").length;
  const directRules = dispatchRules.filter((r) => r.type === "direct").length;
  const calleeRules = dispatchRules.filter((r) => r.type === "callee").length;

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <PageHeader
          title="Dispatch Rules"
          icon={Route}
          action={
            <Button
              variant="secondary"
              className="flex items-center gap-2 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create new
            </Button>
          }
        />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Summary Statistics */}
            <StatsGrid
              stats={[
                { title: "Total rules", value: totalDispatchRules },
                { title: "Individual", value: individualRules },
                { title: "Direct", value: directRules },
                { title: "Callee", value: calleeRules },
              ]}
              columns={4}
            />

            {/* Dispatch Rules Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dispatch Rules</h3>

              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading dispatch rules…</div>
              ) : (
              <DataTable
                data={dispatchRules}
                // @ts-expect-error - TanStack Table column type inference limitation
                columns={dispatchRuleColumns}
                emptyMessage="No dispatch rules found."
              />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <DispatchRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setEditingRule(null);
        }}
        rule={editingRule}
      />
    </div>
  );
}

