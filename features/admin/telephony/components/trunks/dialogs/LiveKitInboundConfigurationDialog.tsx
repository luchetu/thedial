"use client";

import { useMemo, useEffect } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { LiveKitInboundConfigurationForm } from "../LiveKitInboundConfigurationForm";
import { useConfigureTrunk, useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import type { Trunk, ConfigureTrunkRequest } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";
import { toastError, toastSuccess } from "@/lib/toast";

interface LiveKitInboundConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk: Trunk;
  onSuccess?: () => void;
}

export function LiveKitInboundConfigurationDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: LiveKitInboundConfigurationDialogProps) {
  const configureMutation = useConfigureTrunk();
  
  const { data: fullTrunkData } = useTrunk(trunk.id, {
    enabled: open,
  });
  
  const defaultValues = useMemo<Partial<TrunkFormValues>>(() => {
    const baseValues: Partial<TrunkFormValues> = {
      name: trunk.name,
      type: trunk.type,
      direction: trunk.direction,
      status: trunk.status,
    };
    
    if (fullTrunkData?.metadata) {
      const config = fullTrunkData.metadata as Record<string, unknown>;
      const inboundNumbers = config.inboundNumbers || config.numbers;
      const allowedNumbers = config.allowedNumbers;
      const allowedAddresses = config.allowedAddresses;
      const inboundAuthUsername = config.inboundAuthUsername || config.authUsername;
      const inboundAuthPassword = config.inboundAuthPassword || config.authPassword;
      const krispEnabled = config.krispEnabled;
      
      if (Array.isArray(inboundNumbers)) {
        baseValues.inboundNumberMode = inboundNumbers.length === 0 ? "any" : "specific";
        baseValues.inboundNumbers = inboundNumbers;
      }
      if (Array.isArray(allowedNumbers)) {
        baseValues.allowedNumbers = allowedNumbers;
        baseValues.restrictAllowedNumbers = allowedNumbers.length > 0;
      }
      if (Array.isArray(allowedAddresses)) baseValues.allowedAddresses = allowedAddresses;
      if (typeof inboundAuthUsername === "string") baseValues.inboundAuthUsername = inboundAuthUsername;
      if (typeof inboundAuthPassword === "string") baseValues.inboundAuthPassword = inboundAuthPassword;
      if (typeof krispEnabled === "boolean") baseValues.krispEnabled = krispEnabled;
    }
    
    return baseValues;
  }, [trunk, fullTrunkData]);

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues.name || "",
      type: "livekit_inbound",
      direction: defaultValues.direction || "inbound",
      status: defaultValues.status || "active",
      inboundNumberMode: defaultValues.inboundNumberMode || "any",
      inboundNumbers: defaultValues.inboundNumbers || [],
      allowedNumbers: defaultValues.allowedNumbers || [],
      allowedAddresses: defaultValues.allowedAddresses || [],
      inboundAuthUsername: defaultValues.inboundAuthUsername || "",
      inboundAuthPassword: defaultValues.inboundAuthPassword || "",
      krispEnabled: defaultValues.krispEnabled || false,
      restrictAllowedNumbers: (defaultValues.allowedNumbers?.length ?? 0) > 0,
    },
    onSubmit: async (values) => {
      try {
        const inboundNumbers = values.inboundNumbers || [];

        // Configure trunk (LiveKit Inbound-specific fields)
        const configRequest: ConfigureTrunkRequest = {
          inboundNumbers: inboundNumbers,
          allowedNumbers: values.restrictAllowedNumbers ? values.allowedNumbers : [],
          krispEnabled: values.krispEnabled,
        };

        await configureMutation.mutateAsync({
          id: trunk.id,
          data: configRequest,
        });
        
        toastSuccess("Trunk configuration updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        const err = error as Error;
        toastError(`Failed to update trunk configuration: ${err.message}`);
        throw error;
      }
    },
  });

  const isLoading = configureMutation.isPending;

  // Update form values when configuration data loads
  useEffect(() => {
    if (fullTrunkData?.metadata) {
      const config = fullTrunkData.metadata as Record<string, unknown>;
      const inboundNumbers = config.inboundNumbers || config.numbers;
      const allowedNumbers = config.allowedNumbers;
      const krispEnabled = config.krispEnabled;
      
      if (Array.isArray(inboundNumbers)) {
        form.setFieldValue("inboundNumbers", inboundNumbers);
      }
      if (Array.isArray(allowedNumbers)) {
        form.setFieldValue("allowedNumbers", allowedNumbers);
        form.setFieldValue("restrictAllowedNumbers", allowedNumbers.length > 0);
      }
      if (typeof krispEnabled === "boolean") form.setFieldValue("krispEnabled", krispEnabled);
    }
  }, [fullTrunkData?.metadata, form]);

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure LiveKit Inbound Trunk"
      description="Update LiveKit inbound trunk configuration settings below."
    >
      <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
        <div className="space-y-6">
          <LiveKitInboundConfigurationForm 
            form={form} 
            isLoading={isLoading} 
            showTitle={false}
          />
          
          <div className="pt-4 border-t">
            <FormSubmitButton loading={isLoading} variant="secondary">
              Update Configuration
            </FormSubmitButton>
          </div>
        </div>
      </Form>
    </BaseTrunkDialog>
  );
}

