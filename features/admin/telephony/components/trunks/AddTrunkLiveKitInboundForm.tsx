"use client";

import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { TrunkRegistryForm } from "./TrunkRegistryForm";
import { TrunkStepper, TrunkStepperNavigation } from "./TrunkStepper";
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
        console.log("[AddTrunkLiveKitInboundForm] onSubmit called");
        console.log("[AddTrunkLiveKitInboundForm] values parameter:", values);
        console.log("[AddTrunkLiveKitInboundForm] form.state.values:", form.state.values);
        
        const trunkIdToUse = createdTrunkId || trunkId;

        if (!trunkIdToUse) {
          console.error("[AddTrunkLiveKitInboundForm] ERROR: Trunk ID is missing");
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
        // Always use form.state.values to get the latest form state (values parameter may be stale)
        const formValues = form.state.values;
        
        // Get inbound numbers from form state
        const inboundNumbers = Array.isArray(formValues.inboundNumbers) ? formValues.inboundNumbers : [];
        const allowedAddresses = Array.isArray(formValues.allowedAddresses) ? formValues.allowedAddresses : [];
        const authUsername = (formValues.inboundAuthUsername || "").trim();
        const authPassword = (formValues.inboundAuthPassword || "").trim();
        
        console.log("[AddTrunkLiveKitInboundForm] Configuration submission - DETAILED LOG:", {
          "values.inboundNumbers": values?.inboundNumbers,
          "form.state.values.inboundNumbers": form.state.values.inboundNumbers,
          "formValues.inboundNumbers": formValues.inboundNumbers,
          "finalInboundNumbers": inboundNumbers,
          "inboundNumbersLength": inboundNumbers.length,
          "inboundNumbersType": typeof inboundNumbers,
          "isArray": Array.isArray(inboundNumbers),
          "allowedAddresses": allowedAddresses,
          "allowedAddressesLength": allowedAddresses.length,
          "authUsername": authUsername ? "***" : "(empty)",
          "authPassword": authPassword ? "***" : "(empty)",
          "hasAuth": authUsername !== "" && authPassword !== "",
          "hasAllowedAddresses": allowedAddresses.length > 0,
          "allFormValuesKeys": Object.keys(formValues),
        });
        
        // Validate: When accepting any number (no specific numbers), must have either auth credentials OR allowed addresses
        // When phone numbers are provided, auth is optional (phone numbers provide security)
        if (inboundNumbers.length === 0) {
          console.log("[AddTrunkLiveKitInboundForm] VALIDATION: No phone numbers provided, checking auth/addresses");
          const hasAuth = authUsername !== "" && authPassword !== "";
          const hasAllowedAddresses = allowedAddresses.length > 0;
          console.log("[AddTrunkLiveKitInboundForm] VALIDATION CHECK:", {
            hasAuth,
            hasAllowedAddresses,
            willFail: !hasAuth && !hasAllowedAddresses,
          });
          
          if (!hasAuth && !hasAllowedAddresses) {
            console.error("[AddTrunkLiveKitInboundForm] VALIDATION ERROR: No phone numbers, no auth, no allowed addresses");
            toastError("When accepting calls to any number, you must provide either username and password for authentication or allowed IP addresses");
            return;
          }
        } else {
          console.log("[AddTrunkLiveKitInboundForm] VALIDATION: Phone numbers provided, auth is optional");
        }

        const configRequest: ConfigureTrunkRequest = {
          inboundNumbers: inboundNumbers,
          allowedNumbers: formValues.restrictAllowedNumbers ? (Array.isArray(formValues.allowedNumbers) ? formValues.allowedNumbers : []) : [],
          allowedAddresses: allowedAddresses,
          // Only include auth credentials if both are provided
          inboundAuthUsername: (authUsername && authPassword) ? authUsername : undefined,
          inboundAuthPassword: (authUsername && authPassword) ? authPassword : undefined,
          krispEnabled: Boolean(formValues.krispEnabled),
        };

        console.log("[AddTrunkLiveKitInboundForm] Config request to backend:", {
          ...configRequest,
          inboundAuthUsername: configRequest.inboundAuthUsername ? "***" : undefined,
          inboundAuthPassword: configRequest.inboundAuthPassword ? "***" : undefined,
        });
        console.log("[AddTrunkLiveKitInboundForm] Backend requirements: All fields are optional (no validation on backend)");

        await configureMutation.mutateAsync({
          id: trunkIdToUse,
          data: configRequest,
        });
        console.log("[AddTrunkLiveKitInboundForm] Configuration successful");
        toastSuccess("Trunk configured successfully");
        onSubmit?.();
      } catch (error) {
        const err = error as Error;
        console.error("[AddTrunkLiveKitInboundForm] ERROR during submission:", err);
        console.error("[AddTrunkLiveKitInboundForm] Error stack:", err.stack);
        toastError(`Failed to ${isEditMode ? "update" : "configure"} trunk: ${err.message}`);
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
              <LiveKitInboundConfigurationForm form={form} isLoading={isLoading} showTitle={true} />
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

