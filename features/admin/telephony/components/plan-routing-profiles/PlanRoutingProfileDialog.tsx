"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  useCreatePlanRoutingProfile,
  useUpdatePlanRoutingProfile,
} from "@/features/admin/telephony/hooks/usePlanRoutingProfiles";
import {
  PlanRoutingProfileForm,
  type PlanRoutingProfileFormSubmission,
} from "@/features/admin/telephony/components/plan-routing-profiles/PlanRoutingProfileForm";
import type {
  PlanRoutingProfile,
  Plan,
  RoutingProfile,
  UpdatePlanRoutingProfileRequest,
} from "@/features/admin/telephony/types";

interface PlanRoutingProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mapping?: PlanRoutingProfile | null;
  plans?: Plan[];
  routingProfiles?: RoutingProfile[];
  initialPlanCode?: string;
}

const mapUpdatePayload = (
  values: PlanRoutingProfileFormSubmission
): UpdatePlanRoutingProfileRequest => ({
  routingProfileId: values.routingProfileId || undefined,
  country: values.country && values.country.trim() ? values.country.trim().toUpperCase() : undefined,
  region: values.region && values.region.trim() ? values.region.trim() : undefined,
});

export const PlanRoutingProfileDialog = ({
  open,
  onOpenChange,
  mapping,
  plans = [],
  routingProfiles = [],
  initialPlanCode,
}: PlanRoutingProfileDialogProps) => {
  const createPlanRoutingProfile = useCreatePlanRoutingProfile();
  const updatePlanRoutingProfile = useUpdatePlanRoutingProfile();

  const isEditMode = Boolean(mapping);

  const handleSubmit = async (values: PlanRoutingProfileFormSubmission) => {
    try {
      if (isEditMode && mapping) {
        const payload = mapUpdatePayload(values);
        await updatePlanRoutingProfile.mutateAsync({ id: mapping.id, data: payload });
        toastSuccess("Plan routing profile mapping updated successfully");
      } else {
        await createPlanRoutingProfile.mutateAsync(values);
        toastSuccess("Plan routing profile mapping created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save mapping");
      throw err;
    }
  };

  const isSubmitting = createPlanRoutingProfile.isPending || updatePlanRoutingProfile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit plan routing profile mapping" : "Create plan routing profile mapping"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the routing profile mapping for this plan."
              : "Link a routing profile to a plan for specific country or region."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <PlanRoutingProfileForm
            key={mapping?.id ?? "new"}
            mapping={mapping ?? undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel={isEditMode ? "Save changes" : "Create mapping"}
            plans={plans.map((plan) => ({ code: plan.code, name: plan.name }))}
            routingProfiles={routingProfiles}
            initialPlanCode={initialPlanCode}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

