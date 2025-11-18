"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  useCreateRoutingProfile,
  useUpdateRoutingProfile,
} from "@/features/admin/telephony/hooks/useRoutingProfiles";
import {
  RoutingProfileForm,
  type RoutingProfileFormSubmission,
} from "@/features/admin/telephony/components/routing-profiles/RoutingProfileForm";
import type {
  RoutingProfile,
  CreateRoutingProfileRequest,
  UpdateRoutingProfileRequest,
  Plan,
  OutboundTrunk,
  InboundTrunk,
  DispatchRule,
} from "@/features/admin/telephony/types";

interface RoutingProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: RoutingProfile | null;
  plans?: Plan[];
  outboundTrunks?: OutboundTrunk[];
  inboundTrunks?: InboundTrunk[];
  dispatchRules?: DispatchRule[];
}

const mapCreatePayload = (
  values: RoutingProfileFormSubmission
): CreateRoutingProfileRequest => ({
  name: values.name,
  planCode: values.planCode,
  country: values.country,
  outboundProvider: values.outboundProvider,
  outboundTrunkRef: values.outboundTrunkRef,
  outboundProviderConfig: values.outboundProviderConfig,
  inboundProvider: values.inboundProvider,
  inboundTrunkRef: values.inboundTrunkRef,
  inboundProviderConfig: values.inboundProviderConfig,
  dispatchProvider: values.dispatchProvider,
  dispatchRuleRef: values.dispatchRuleRef,
  dispatchMetadata: values.dispatchMetadata,
  complianceRequirements: values.complianceRequirements,
  recordingPolicy: values.recordingPolicy,
});

const mapUpdatePayload = (
  values: RoutingProfileFormSubmission
): UpdateRoutingProfileRequest => ({
  name: values.name,
  planCode: values.planCode,
  country: values.country,
  outboundProvider: values.outboundProvider,
  outboundTrunkRef: values.outboundTrunkRef,
  outboundProviderConfig: values.outboundProviderConfig,
  inboundProvider: values.inboundProvider,
  inboundTrunkRef: values.inboundTrunkRef,
  inboundProviderConfig: values.inboundProviderConfig,
  dispatchProvider: values.dispatchProvider,
  dispatchRuleRef: values.dispatchRuleRef,
  dispatchMetadata: values.dispatchMetadata,
  complianceRequirements: values.complianceRequirements,
  recordingPolicy: values.recordingPolicy,
});

export const RoutingProfileDialog = ({
  open,
  onOpenChange,
  profile,
  plans = [],
  outboundTrunks = [],
  inboundTrunks = [],
  dispatchRules = [],
}: RoutingProfileDialogProps) => {
  const createRoutingProfile = useCreateRoutingProfile();
  const updateRoutingProfile = useUpdateRoutingProfile();

  const isEditMode = Boolean(profile);

  const handleSubmit = async (values: RoutingProfileFormSubmission) => {
    try {
      if (isEditMode && profile) {
        const payload = mapUpdatePayload(values);
        await updateRoutingProfile.mutateAsync({ id: profile.id, data: payload });
        toastSuccess("Routing profile updated successfully");
      } else {
        const payload = mapCreatePayload(values);
        await createRoutingProfile.mutateAsync(payload);
        toastSuccess("Routing profile created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save routing profile");
      throw err;
    }
  };

  const isSubmitting = createRoutingProfile.isPending || updateRoutingProfile.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-3xl pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "Edit routing profile" : "Create routing profile"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update routing, compliance, and recording defaults for this plan/country combination."
              : "Define routing behavior, provider integrations, and compliance rules for a plan/country."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 pr-6 pb-8">
          <RoutingProfileForm
            key={profile?.id ?? "new"}
            profile={profile ?? undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel={isEditMode ? "Save changes" : "Create routing profile"}
            plans={plans.map((plan) => ({ code: plan.code, name: plan.name }))}
            outboundTrunks={outboundTrunks.map((trunk) => ({
              id: trunk.id,
              label: trunk.name,
              description: trunk.trunkId,
            }))}
            inboundTrunks={inboundTrunks.map((trunk) => ({
              id: trunk.id,
              label: trunk.name,
              description: trunk.trunkId,
            }))}
            dispatchRules={dispatchRules.map((rule) => ({
              id: rule.id,
              label: rule.name,
              description: rule.ruleId ?? undefined,
            }))}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

