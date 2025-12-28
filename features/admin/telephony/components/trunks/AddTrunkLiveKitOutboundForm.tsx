"use client";

import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { TrunkRegistryForm } from "./TrunkRegistryForm";
import { TrunkStepper, TrunkStepperNavigation } from "./TrunkStepper";
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
  const [createdTrunkId, setCreatedTrunkId] = useState<string | null>(trunkId || null); // Store trunk ID from registry creation
  
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
      livekitCredentialMode: defaultValues?.livekitCredentialMode || "create",
      authUsername: defaultValues?.authUsername || "",
      authPassword: defaultValues?.authPassword || "",
      twilioTrunkSid: defaultValues?.twilioTrunkSid,
      twilioCredentialListSid: defaultValues?.twilioCredentialListSid,
      twilioCredentialSid: defaultValues?.twilioCredentialSid,
    },
    onSubmit: async (values) => {
      try {
        // Log form state and validation errors
        console.log("[AddTrunkLiveKitOutboundForm] Form submission attempt");
        console.log("[AddTrunkLiveKitOutboundForm] Form values:", values);
        console.log("[AddTrunkLiveKitOutboundForm] Form canSubmit:", form.state.canSubmit);
        console.log("[AddTrunkLiveKitOutboundForm] Form fieldMeta:", form.state.fieldMeta);
        console.log("[AddTrunkLiveKitOutboundForm] Form errorMap:", form.state.errorMap);
        
        // Log individual field errors
        Object.entries(form.state.fieldMeta).forEach(([fieldName, meta]) => {
          if (meta && 'errors' in meta && Array.isArray(meta.errors) && meta.errors.length > 0) {
            console.log(`[AddTrunkLiveKitOutboundForm] Field "${fieldName}" has errors:`, meta.errors);
          }
        });

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
            direction: "outbound",
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
        // If Twilio credential is selected, don't send username/password (backend will fetch from Twilio/local DB)
        const configRequest: ConfigureTrunkRequest = {
          address: values.address.trim(),
          numbers: values.outboundNumberMode === "any" ? ["*"] : values.outboundNumbers,
          // Only send username/password if "create" mode is selected (manual entry mode)
          // When "existing" mode is selected, backend fetches username from Twilio and password from local DB
          authUsername: values.livekitCredentialMode === "existing" ? undefined : (values.authUsername?.trim() || undefined),
          authPassword: values.livekitCredentialMode === "existing" ? undefined : (values.authPassword?.trim() || undefined),
          // Include Twilio credential references if "existing" mode is selected
          twilioTrunkSid: values.livekitCredentialMode === "existing" ? (values.twilioTrunkSid || undefined) : undefined,
          twilioCredentialListSid: values.livekitCredentialMode === "existing" ? (values.twilioCredentialListSid || undefined) : undefined,
          twilioCredentialSid: values.livekitCredentialMode === "existing" ? (values.twilioCredentialSid || undefined) : undefined,
        };

        console.log("[AddTrunkLiveKitOutboundForm] Config request:", configRequest);

        await configureMutation.mutateAsync({
          id: trunkIdToUse,
          data: configRequest,
        });
        toastSuccess("Trunk configured successfully");
        onSubmit?.();
      } catch (error) {
        const err = error as Error;
        console.error("[AddTrunkLiveKitOutboundForm] Submission error:", err);
        
        // Improve error message for credential-related errors
        let errorMessage = err.message;
        if (err.message.includes("password not found in local database") || 
            err.message.includes("password not found in local DB")) {
          errorMessage = "The selected credential's password is not stored in the local database. Please update the credential password in the credential list first, then try again.";
        } else if (err.message.includes("credential") && err.message.includes("not found")) {
          errorMessage = "The selected credential could not be found. Please verify the credential exists in Twilio and try again.";
        } else if (err.message.includes("twilioCredentialListSid is required")) {
          errorMessage = "Credential list is required when using an existing credential. Please select a credential list.";
        }
        
        toastError(`Failed to ${isEditMode ? "update" : "configure"} trunk: ${errorMessage}`);
        throw error;
      }
    },
  });

  // Reactive check for whether we can proceed to next step
  const canGoNext = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const name = state.values.name;
    return !!name?.toString().trim();
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
            type: "livekit_outbound",
            direction: "outbound",
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
        {/* Step Indicator - Only show in create mode */}
        {!isEditMode && (
          <TrunkStepper
            currentStep={currentStep}
            totalSteps={2}
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
              <LiveKitOutboundConfigurationForm 
                form={form} 
                isLoading={isLoading} 
                showTitle={true}
                trunkId={createdTrunkId || trunkId || undefined}
                isEditMode={isEditMode}
              />
            )}
          </>
        )}

        {/* Navigation Buttons - Only show in create mode */}
        {!isEditMode && (
          <TrunkStepperNavigation
            currentStep={currentStep}
            totalSteps={2}
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext}
            canGoBack={currentStep > 0}
            isLoading={isLoading}
            submitButton={
              <FormSubmitButton loading={isLoading} variant="secondary">
                {submitLabel}
              </FormSubmitButton>
            }
          />
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

