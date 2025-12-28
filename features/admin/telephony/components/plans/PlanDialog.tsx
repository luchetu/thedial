"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PlanForm, type PlanFormSubmission } from "@/features/admin/telephony/components/plans/PlanForm";
import { useCreatePlan, useUpdatePlan } from "@/features/admin/telephony/hooks/usePlans";
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
}

const ensureNumber = (value?: number) => (typeof value === "number" ? value : 0);

export const PlanDialog = ({ open, onOpenChange, plan }: PlanDialogProps) => {
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const isEditMode = Boolean(plan);

  const handleSubmit = async (values: PlanFormSubmission) => {
    try {
      if (isEditMode && plan) {
        const updatePayload: UpdatePlanRequest = {
          code: values.code !== plan.code ? values.code : undefined,
          name: values.name,
          billingProductId: values.billingProductId,
          monthlyPriceCents: values.monthlyPriceCents,
          monthlyCredits: values.monthlyCredits,
          rateVoiceMinCredits: values.rateVoiceMinCredits,
          rateAiTokenCredits: values.rateAiTokenCredits,
          perNumberMonthlyPriceCents: values.perNumberMonthlyPriceCents,
          includedRealtimeMinutes: values.includedRealtimeMinutes,
          includedTranscriptionMinutes: values.includedTranscriptionMinutes,
          includedPstnMinutes: values.includedPstnMinutes,
          includedAiMinutes: values.includedAiMinutes,
          includedPhoneNumbers: values.includedPhoneNumbers,
          allowedCountries: values.allowedCountries,
          defaultRoutingProfileTemplateId: values.defaultRoutingProfileTemplateId,
          defaultRecordingPolicy: values.defaultRecordingPolicy,
          complianceFeatures: values.complianceFeatures,
          metadata: values.metadata,
        };

        await updatePlan.mutateAsync({ id: plan.id, data: updatePayload });
        toastSuccess("Plan updated successfully");
      } else {
        const createPayload: CreatePlanRequest = {
          code: values.code,
          name: values.name,
          billingProductId: values.billingProductId,
          monthlyPriceCents: ensureNumber(values.monthlyPriceCents),
          perNumberMonthlyPriceCents: ensureNumber(values.perNumberMonthlyPriceCents),
          includedRealtimeMinutes: ensureNumber(values.includedRealtimeMinutes),
          includedTranscriptionMinutes: ensureNumber(values.includedTranscriptionMinutes),
          includedPstnMinutes: ensureNumber(values.includedPstnMinutes),
          includedAiMinutes: ensureNumber(values.includedAiMinutes),
          includedPhoneNumbers: ensureNumber(values.includedPhoneNumbers),
          allowedCountries: values.allowedCountries,
          defaultRoutingProfileTemplateId: values.defaultRoutingProfileTemplateId,
          defaultRecordingPolicy: values.defaultRecordingPolicy,
          complianceFeatures: values.complianceFeatures,
          metadata: values.metadata,
        };

        await createPlan.mutateAsync(createPayload);
        toastSuccess("Plan created successfully");
      }

      onOpenChange(false);
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save plan");
      throw err;
    }
  };

  const isLoading = createPlan.isPending || updatePlan.isPending;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onOpenChange(false);
        } else {
          onOpenChange(true);
        }
      }}
    >
      <SheetContent className="overflow-y-auto sm:max-w-3xl pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit plan" : "Create plan"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Adjust plan pricing, allowances, and compliance defaults."
              : "Define pricing, usage allowances, and compliance defaults for a new plan."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 pr-6 pb-8 space-y-8">
          <PlanForm
            key={plan?.id || "new"}
            plan={plan ?? undefined}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isEditMode ? "Save changes" : "Create plan"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
