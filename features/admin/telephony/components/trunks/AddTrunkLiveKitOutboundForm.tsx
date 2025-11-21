"use client";

import { useState } from "react";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { TrunkBasicInfoForm } from "./TrunkBasicInfoForm";
import { LiveKitOutboundConfigurationForm } from "./LiveKitOutboundConfigurationForm";
import { useCreateTrunk, useUpdateTrunk, useConfigureTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { toastError, toastSuccess } from "@/lib/toast";

interface AddTrunkLiveKitOutboundFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
  trunkId?: string;
}

export function AddTrunkLiveKitOutboundForm({
  defaultValues,
  onSubmit,
  isLoading: externalLoading = false,
  submitLabel = "Create Trunk",
  isEditMode = false,
  trunkId,
}: AddTrunkLiveKitOutboundFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const createMutation = useCreateTrunk();
  const updateMutation = useUpdateTrunk();
  const configureMutation = useConfigureTrunk();

  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending || configureMutation.isPending;

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: "livekit_outbound",
      direction: "outbound",
      externalId: defaultValues?.externalId || "",
      status: defaultValues?.status || "active",
      outboundNumberMode: defaultValues?.outboundNumberMode || "any",
      outboundNumbers: defaultValues?.outboundNumbers || [],
      address: defaultValues?.address || "",
      authUsername: defaultValues?.authUsername || "",
      authPassword: defaultValues?.authPassword || "",
    },
    onSubmit: async (values) => {
      try {
        let trunkIdToUse = trunkId;

        // Step 1: Create or update trunk registry (basic info only)
        if (isEditMode && trunkIdToUse) {
          const request: UpdateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: "outbound",
            provider: "livekit",
            status: values.status,
          };

          await updateMutation.mutateAsync({
            id: trunkIdToUse,
            data: request,
          });
          toastSuccess("Trunk updated successfully");
        } else {
          const request: CreateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: "outbound",
            provider: "livekit",
            status: values.status,
          };

          const trunk = await createMutation.mutateAsync(request);
          trunkIdToUse = trunk.id;
          toastSuccess("Trunk created successfully");
        }

        // Step 2: Configure trunk (LiveKit Outbound-specific fields)
        if (trunkIdToUse) {
          const configRequest: ConfigureTrunkRequest = {
            address: values.address.trim(),
            numbers: values.outboundNumberMode === "any" ? ["*"] : values.outboundNumbers,
            authUsername: values.authUsername.trim(),
            authPassword: values.authPassword.trim(),
          };

          await configureMutation.mutateAsync({
            id: trunkIdToUse,
            data: configRequest,
          });
          toastSuccess(isEditMode ? "Trunk configuration updated successfully" : "Trunk configured successfully");
          onSubmit?.();
        }
      } catch (error) {
        const err = error as Error;
        toastError(`Failed to ${isEditMode ? "update" : "create"} trunk: ${err.message}`);
        throw error;
      }
    },
  });

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate basic info before proceeding
      const name = form.getFieldValue("name");
      if (!name || (typeof name === "string" && name.trim() === "")) {
        return;
      }
      setCurrentStep(1);
    }
  };

  return (
    <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        {/* Step Indicator - Only show in create mode */}
        {!isEditMode && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 0 ? "border-primary bg-primary text-primary-foreground" : "border-muted"
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className={`h-1 w-12 transition-colors ${
                currentStep >= 1 ? "bg-primary" : "bg-muted"
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= 1 ? "border-primary bg-primary text-primary-foreground" : "border-muted"
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        {isEditMode ? (
          // Edit mode: Show only basic info form
          <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
        ) : (
          // Create mode: Show steps
          <>
            {currentStep === 0 && (
              <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
            )}

            {currentStep === 1 && (
              <LiveKitOutboundConfigurationForm form={form} isLoading={isLoading} showTitle={true} />
            )}
          </>
        )}

        {/* Navigation Buttons */}
        {isEditMode ? (
          // Edit mode: Just show submit button
          <div className="pt-4 border-t">
            <FormSubmitButton loading={isLoading} variant="secondary">
              {submitLabel}
            </FormSubmitButton>
          </div>
        ) : (
          // Create mode: Show step navigation
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {/* No back button needed for step 0 */}
            </div>
            <div className="flex items-center gap-2">
              {currentStep === 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {currentStep === 1 && (
                <FormSubmitButton loading={isLoading} variant="secondary">
                  {submitLabel}
                </FormSubmitButton>
              )}
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}

