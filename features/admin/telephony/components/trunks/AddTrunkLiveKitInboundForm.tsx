"use client";

import { useState } from "react";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { TrunkRegistryForm } from "./TrunkRegistryForm";
import { TrunkStepper } from "./TrunkStepper";
import { LiveKitInboundConfigurationForm } from "./LiveKitInboundConfigurationForm";
import { useCreateTrunk, useUpdateTrunk, useConfigureTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { toastError, toastSuccess } from "@/lib/toast";

interface AddTrunkLiveKitInboundFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
  trunkId?: string;
}

export function AddTrunkLiveKitInboundForm({
  defaultValues,
  onSubmit,
  isLoading: externalLoading = false,
  submitLabel = "Create Trunk",
  isEditMode = false,
  trunkId,
}: AddTrunkLiveKitInboundFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [createdTrunkId, setCreatedTrunkId] = useState<string | null>(trunkId || null); // Store trunk ID from registry creation
  
  const createMutation = useCreateTrunk();
  const updateMutation = useUpdateTrunk();
  const configureMutation = useConfigureTrunk();

  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending || configureMutation.isPending;

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: "livekit_inbound",
      direction: "inbound",
      externalId: defaultValues?.externalId || "",
      status: defaultValues?.status || "active",
      inboundNumberMode: defaultValues?.inboundNumberMode || "any",
      inboundNumbers: defaultValues?.inboundNumbers || [],
      allowedNumbers: defaultValues?.allowedNumbers || [],
      allowedAddresses: defaultValues?.allowedAddresses || [],
      inboundAuthUsername: defaultValues?.inboundAuthUsername || "",
      inboundAuthPassword: defaultValues?.inboundAuthPassword || "",
      krispEnabled: defaultValues?.krispEnabled || false,
      restrictAllowedNumbers: (defaultValues?.allowedNumbers?.length ?? 0) > 0,
    },
    onSubmit: async (values) => {
      try {
        const trunkIdToUse = createdTrunkId || trunkId;

        if (!trunkIdToUse) {
          toastError("Trunk ID is missing. Please try again.");
          return;
        }

        // Edit mode: Update trunk registry
        if (isEditMode) {
          const request: UpdateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: "inbound",
            provider: "livekit",
            status: values.status,
          };

          await updateMutation.mutateAsync({
            id: trunkIdToUse,
            data: request,
          });
          toastSuccess("Trunk updated successfully");
          onSubmit?.();
          return;
        }

        // Create mode: Configure trunk (registry was already created in handleNext)
        const inboundNumbers = values.inboundNumberMode === "any" ? [] : values.inboundNumbers;
        const allowedAddresses = values.allowedAddresses || [];
        const authUsername = values.inboundAuthUsername.trim();
        const authPassword = values.inboundAuthPassword.trim();
        
        // Validate: When accepting any number, must have either auth credentials OR allowed addresses
        if (inboundNumbers.length === 0) {
          const hasAuth = authUsername !== "" && authPassword !== "";
          const hasAllowedAddresses = allowedAddresses.length > 0;
          if (!hasAuth && !hasAllowedAddresses) {
            toastError("When accepting calls to any number, you must provide either username and password for authentication or allowed IP addresses");
            return;
          }
        }

        const configRequest: ConfigureTrunkRequest = {
          inboundNumbers: inboundNumbers,
          allowedNumbers: values.restrictAllowedNumbers ? values.allowedNumbers : [],
          allowedAddresses: allowedAddresses,
          inboundAuthUsername: authUsername || undefined,
          inboundAuthPassword: authPassword || undefined,
          krispEnabled: values.krispEnabled,
        };

        await configureMutation.mutateAsync({
          id: trunkIdToUse,
          data: configRequest,
        });
        toastSuccess("Trunk configured successfully");
        onSubmit?.();
      } catch (error) {
        const err = error as Error;
        toastError(`Failed to ${isEditMode ? "update" : "configure"} trunk: ${err.message}`);
        throw error;
      }
    },
  });

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate basic info before proceeding
      const name = form.getFieldValue("name");
      if (!name || (typeof name === "string" && name.trim() === "")) {
        return;
      }

      // Create trunk registry when moving to step 1 (only in create mode)
      if (!isEditMode && !createdTrunkId) {
        try {
          const name = form.getFieldValue("name");
          const status = form.getFieldValue("status");
          
          const request: CreateTrunkRequest = {
            name: typeof name === "string" ? name : "",
            type: "livekit_inbound",
            direction: "inbound",
            provider: "livekit",
            status: (typeof status === "string" && (status === "active" || status === "inactive" || status === "pending")) ? status : "active",
          };

          const trunk = await createMutation.mutateAsync(request);
          setCreatedTrunkId(trunk.id);
          toastSuccess("Trunk registry created");
          setCurrentStep(1);
        } catch (error) {
          const err = error as Error;
          toastError(`Failed to create trunk registry: ${err.message}`);
          // Don't move to next step if creation fails
          return;
        }
      } else {
        // Already have trunk ID (edit mode or already created), just move to next step
        setCurrentStep(1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        {/* Step Indicator & Navigation - Only show in create mode */}
        {!isEditMode && (
          <TrunkStepper
            currentStep={currentStep}
            totalSteps={2}
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={!!form.getFieldValue("name")?.toString().trim()}
            canGoBack={currentStep > 0}
            isLoading={isLoading}
            submitButton={
              <FormSubmitButton loading={isLoading} variant="secondary">
                {submitLabel}
              </FormSubmitButton>
            }
          />
        )}

        {/* Step Content */}
        {isEditMode ? (
          // Edit mode: Show only basic info form
          <TrunkRegistryForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
        ) : (
          // Create mode: Show steps
          <>
            {currentStep === 0 && (
              <TrunkRegistryForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
            )}

            {currentStep === 1 && (
              <LiveKitInboundConfigurationForm form={form} isLoading={isLoading} showTitle={true} />
            )}
          </>
        )}

        {/* Submit Button - Only in edit mode */}
        {isEditMode && (
          <div className="pt-4 border-t">
            <FormSubmitButton loading={isLoading} variant="secondary">
              {submitLabel}
            </FormSubmitButton>
          </div>
        )}
      </div>
    </Form>
  );
}

