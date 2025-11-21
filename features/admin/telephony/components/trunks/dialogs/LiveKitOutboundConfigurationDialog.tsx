"use client";

import { useMemo, useEffect } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { LiveKitOutboundConfigurationForm } from "../LiveKitOutboundConfigurationForm";
import { useConfigureTrunk, useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import type { Trunk, ConfigureTrunkRequest } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";
import { toastError, toastSuccess } from "@/lib/toast";

interface LiveKitOutboundConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk: Trunk;
  onSuccess?: () => void;
}

export function LiveKitOutboundConfigurationDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: LiveKitOutboundConfigurationDialogProps) {
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
      // Check multiple possible field names for address
      const address = config.address || config.sip_domain || config.twilioSipAddress || config.twilioSipDomain;
      // Check multiple possible field names for numbers
      const numbers = config.numbers || config.outboundNumbers;
      // Check multiple possible field names for username
      const authUsername = config.authUsername || config.username || config.twilioUsername || config.twilioSipUsername;
      // Backend now decrypts and returns password as authPassword in metadata
      const authPassword = config.authPassword || config.twilioPassword;
      
      console.log("[LiveKitOutboundConfig] defaultValues - metadata:", {
        configKeys: Object.keys(config),
        hasAuthPassword: !!config.authPassword,
        hasTwilioPassword: !!config.twilioPassword,
        hasPasswordEnc: !!config.authPasswordEnc,
        authPasswordType: typeof authPassword,
        authPasswordLength: typeof authPassword === "string" ? authPassword.length : 0,
      });
      
      if (typeof address === "string") baseValues.address = address;
      if (Array.isArray(numbers)) {
        baseValues.outboundNumberMode = numbers.includes("*") || numbers.length === 0 ? "any" : "specific";
        baseValues.outboundNumbers = numbers.filter((n) => n !== "*");
      }
      if (typeof authUsername === "string") baseValues.authUsername = authUsername;
      // Set password if available (backend now decrypts it for us)
      if (typeof authPassword === "string" && authPassword.trim() !== "") {
        console.log("[LiveKitOutboundConfig] Setting password in defaultValues");
        baseValues.authPassword = authPassword;
      }
    }
    
    return baseValues;
  }, [trunk, fullTrunkData]);

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues.name || "",
      type: "livekit_outbound",
      direction: "outbound",
      status: defaultValues.status || "active",
      outboundNumberMode: defaultValues.outboundNumberMode || "any",
      outboundNumbers: defaultValues.outboundNumbers || [],
      address: defaultValues.address || "",
      authUsername: defaultValues.authUsername || "",
      authPassword: defaultValues.authPassword || "",
    },
    onSubmit: async (values) => {
      try {
        // Configure trunk (LiveKit Outbound-specific fields)
        const configRequest: ConfigureTrunkRequest = {
          address: values.address.trim(),
          numbers: values.outboundNumberMode === "any" ? ["*"] : values.outboundNumbers,
          authUsername: values.authUsername.trim(),
          // Only include password if it's been changed (not empty)
          authPassword: values.authPassword.trim() || undefined,
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
      // Check multiple possible field names for address
      const address = config.address || config.sip_domain || config.twilioSipAddress || config.twilioSipDomain;
      // Check multiple possible field names for numbers
      const numbers = config.numbers || config.outboundNumbers;
      // Check multiple possible field names for username
      const authUsername = config.authUsername || config.username || config.twilioUsername || config.twilioSipUsername;
      // Backend now decrypts and returns password as authPassword in metadata
      const authPassword = config.authPassword || config.twilioPassword;
      
      console.log("[LiveKitOutboundConfig] Loading trunk data:", {
        fullMetadata: config,
        metadataKeys: Object.keys(config),
        address,
        authUsername,
        hasPassword: !!authPassword,
        passwordLength: typeof authPassword === "string" ? authPassword.length : 0,
        authPasswordValue: typeof authPassword === "string" ? "***" : authPassword,
        hasPasswordEnc: !!config.authPasswordEnc,
        hasPassword_enc: !!config.password_enc,
      });
      
      if (typeof address === "string") form.setFieldValue("address", address);
      if (Array.isArray(numbers)) {
        form.setFieldValue("outboundNumberMode", numbers.includes("*") || numbers.length === 0 ? "any" : "specific");
        form.setFieldValue("outboundNumbers", numbers.filter((n) => n !== "*"));
      }
      if (typeof authUsername === "string") form.setFieldValue("authUsername", authUsername);
      // Set password if available (backend now decrypts it and returns as authPassword in metadata)
      if (typeof authPassword === "string" && authPassword.trim() !== "") {
        console.log("[LiveKitOutboundConfig] Setting password in form, length:", authPassword.length);
        form.setFieldValue("authPassword", authPassword);
      } else {
        console.log("[LiveKitOutboundConfig] No password found in metadata");
      }
    } else {
      console.log("[LiveKitOutboundConfig] No metadata in fullTrunkData");
    }
  }, [fullTrunkData?.metadata, form]);

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure LiveKit Outbound Trunk"
      description="Update LiveKit outbound trunk configuration settings below."
    >
      <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
        <div className="space-y-6">
          <LiveKitOutboundConfigurationForm 
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

