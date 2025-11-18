"use client";

import { useState } from "react";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WaveLoader } from "@/components/ui/wave-loader";
import { TrunkBasicInfoForm } from "./TrunkBasicInfoForm";
import { TrunkConfigurationForm } from "./TrunkConfigurationForm";
import { useCreateTrunk, useUpdateTrunk, useConfigureTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { getProviderFromType } from "./types";
import { toastError, toastSuccess } from "@/lib/toast";

interface TrunkMultiStepFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>; // Optional callback after successful creation/update
  isLoading?: boolean;
  submitLabel?: string;
  lockType?: boolean; // If true, lock the type field (type is pre-selected)
  isEditMode?: boolean; // If true, update existing trunk instead of creating
  trunkId?: string; // Required if isEditMode is true
}

export function TrunkMultiStepForm({
  defaultValues,
  onSubmit,
  isLoading: externalLoading = false,
  submitLabel = "Create Trunk",
  lockType = false,
  isEditMode = false,
  trunkId,
}: TrunkMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [trunkIdState, setTrunkIdState] = useState<string | null>(isEditMode && trunkId ? trunkId : null);

  const createMutation = useCreateTrunk();
  const updateMutation = useUpdateTrunk();
  const configureMutation = useConfigureTrunk();

  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending || configureMutation.isPending;

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "twilio",
      direction: defaultValues?.direction || "outbound",
      externalId: defaultValues?.externalId || "",
      status: defaultValues?.status || "active",
      // LiveKit Outbound defaults
      outboundNumberMode: defaultValues?.outboundNumberMode || "any",
      outboundNumbers: defaultValues?.outboundNumbers || [],
      address: defaultValues?.address || "",
      authUsername: defaultValues?.authUsername || "",
      authPassword: defaultValues?.authPassword || "",
      // LiveKit Inbound defaults
      inboundNumberMode: defaultValues?.inboundNumberMode || "any",
      inboundNumbers: defaultValues?.inboundNumbers || [],
      allowedNumbers: defaultValues?.allowedNumbers || [],
      allowedAddresses: defaultValues?.allowedAddresses || [],
      inboundAuthUsername: defaultValues?.inboundAuthUsername || "",
      inboundAuthPassword: defaultValues?.inboundAuthPassword || "",
      krispEnabled: defaultValues?.krispEnabled || false,
      restrictAllowedNumbers: (defaultValues?.allowedNumbers?.length ?? 0) > 0,
      // Twilio defaults
      terminationSipDomain: defaultValues?.terminationSipDomain || "",
      credentialMode: defaultValues?.credentialMode || "create",
      credentialListSid: defaultValues?.credentialListSid || "",
      credentialListName: defaultValues?.credentialListName || "",
      twilioUsername: defaultValues?.twilioUsername || "",
      twilioPassword: defaultValues?.twilioPassword || "",
    },
    onSubmit: async (values) => {
      try {
        if (currentStep === 0) {
          // Step 1: Create or update trunk registry (basic info only)
          const provider = getProviderFromType(values.type);
          const direction = values.type === "twilio" ? "outbound" : values.direction;
          
          if (isEditMode && trunkIdState) {
            // Update existing trunk
            const request: UpdateTrunkRequest = {
              name: values.name,
              type: values.type,
              direction,
              provider,
              status: values.status,
            };

            await updateMutation.mutateAsync({
              id: trunkIdState,
              data: request,
            });
            toastSuccess("Trunk updated successfully");
            setCurrentStep(1); // Move to configuration step
          } else {
            // Create new trunk
            const request: CreateTrunkRequest = {
              name: values.name,
              type: values.type,
              direction,
              provider,
              status: values.status,
            };

            const trunk = await createMutation.mutateAsync(request);
            setTrunkIdState(trunk.id);
            toastSuccess("Trunk created successfully");
            setCurrentStep(1); // Move to configuration step
          }
        } else if (currentStep === 1 && trunkIdState) {
          // Step 2: Configure trunk (provider-specific fields)
          const configRequest: ConfigureTrunkRequest = {};

          if (values.type === "livekit_outbound") {
            configRequest.address = values.address.trim();
            configRequest.numbers = values.outboundNumberMode === "any" ? ["*"] : values.outboundNumbers;
            configRequest.authUsername = values.authUsername.trim();
            configRequest.authPassword = values.authPassword.trim();
          } else if (values.type === "livekit_inbound") {
            configRequest.inboundNumbers = values.inboundNumberMode === "any" ? [] : values.inboundNumbers;
            configRequest.allowedNumbers = values.restrictAllowedNumbers ? values.allowedNumbers : [];
            configRequest.allowedAddresses = values.allowedAddresses;
            if (values.inboundAuthUsername.trim()) {
              configRequest.inboundAuthUsername = values.inboundAuthUsername.trim();
            }
            if (values.inboundAuthPassword.trim()) {
              configRequest.inboundAuthPassword = values.inboundAuthPassword.trim();
            }
            configRequest.krispEnabled = values.krispEnabled;
          } else if (values.type === "twilio") {
            configRequest.terminationSipDomain = values.terminationSipDomain.trim();
            configRequest.credentialMode = values.credentialMode;
            if (values.credentialMode === "existing") {
              configRequest.credentialListSid = values.credentialListSid.trim();
            } else {
              configRequest.credentialListName = values.credentialListName.trim() || undefined;
              configRequest.twilioUsername = values.twilioUsername.trim() || undefined;
              configRequest.twilioPassword = values.twilioPassword.trim() || undefined;
            }
          }

          await configureMutation.mutateAsync({
            id: trunkIdState,
            data: configRequest,
          });
          toastSuccess(isEditMode ? "Trunk configuration updated successfully" : "Trunk configured successfully");
          onSubmit?.();
        }
      } catch (error) {
        const err = error as Error;
        if (currentStep === 0) {
          toastError(
            isEditMode
              ? `Failed to update trunk: ${err.message}`
              : `Failed to create trunk: ${err.message}`
          );
        } else {
          toastError(`Failed to ${isEditMode ? "update" : "configure"} trunk: ${err.message}`);
        }
        throw error; // Re-throw to prevent form submission
      }
    },
  });

  const totalSteps = 2;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    // Step 1: Submit basic info form
    if (currentStep === 0) {
      await form.handleSubmit();
      // If successful, handleSubmit will move to step 2
    } else {
      // Step 2: Just move forward (handled by form submit)
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
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
        {/* Step Indicator */}
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

        {/* Step Content */}
        {currentStep === 0 && (
          <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={lockType} />
        )}
        
        {currentStep === 1 && (
          <TrunkConfigurationForm form={form} isLoading={isLoading} showTitle={true} />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep === 0 && isEditMode && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
              >
                Skip to Configuration
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {isLastStep ? (
            <FormSubmitButton loading={isLoading} variant="secondary">
              {submitLabel}
            </FormSubmitButton>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <WaveLoader />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {currentStep === 0 ? (isEditMode ? "Update & Continue" : "Create & Continue") : "Next"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}

