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
      
      // Determine credential mode based on whether Twilio credentials are used
      const hasTwilioCredential = !!(config.twilioTrunkSid || config.twilioCredentialSid || config.twilioCredentialListSid);
      baseValues.livekitCredentialMode = hasTwilioCredential ? "existing" : "create";
      
      // Set Twilio credential references if they exist
      if (config.twilioTrunkSid) baseValues.twilioTrunkSid = String(config.twilioTrunkSid);
      if (config.twilioCredentialListSid) baseValues.twilioCredentialListSid = String(config.twilioCredentialListSid);
      if (config.twilioCredentialSid) baseValues.twilioCredentialSid = String(config.twilioCredentialSid);
      
      console.log("[LiveKitOutboundConfig] defaultValues - metadata:", {
        configKeys: Object.keys(config),
        hasAuthPassword: !!config.authPassword,
        hasTwilioPassword: !!config.twilioPassword,
        hasPasswordEnc: !!config.authPasswordEnc,
        authPasswordType: typeof authPassword,
        authPasswordLength: typeof authPassword === "string" ? authPassword.length : 0,
        hasTwilioCredential,
        credentialMode: baseValues.livekitCredentialMode,
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
    } else {
      // Default to "create" mode if no metadata
      baseValues.livekitCredentialMode = "create";
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
      livekitCredentialMode: defaultValues.livekitCredentialMode || "create",
      authUsername: defaultValues.authUsername || "",
      authPassword: defaultValues.authPassword || "",
      twilioTrunkSid: defaultValues.twilioTrunkSid,
      twilioCredentialListSid: defaultValues.twilioCredentialListSid,
      twilioCredentialSid: defaultValues.twilioCredentialSid,
    },
    onSubmit: async (values) => {
      try {
        // Configure trunk (LiveKit Outbound-specific fields)
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

        await configureMutation.mutateAsync({
          id: trunk.id,
          data: configRequest,
        });
        
        toastSuccess("Trunk configuration updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        const err = error as Error;
        
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
        
        toastError(`Failed to update trunk configuration: ${errorMessage}`);
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
      
      if (typeof address === "string") {
        form.setFieldValue("address", address);
        console.log("[LiveKitOutboundConfig] Set address from metadata:", address);
      } else {
        console.log("[LiveKitOutboundConfig] No address found in metadata, keys:", Object.keys(config));
      }
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
      
      // Set credential mode and Twilio references if they exist
      const hasTwilioCredential = !!(config.twilioTrunkSid || config.twilioCredentialSid || config.twilioCredentialListSid);
      if (hasTwilioCredential) {
        form.setFieldValue("livekitCredentialMode", "existing");
        if (config.twilioTrunkSid) form.setFieldValue("twilioTrunkSid", String(config.twilioTrunkSid));
        if (config.twilioCredentialListSid) form.setFieldValue("twilioCredentialListSid", String(config.twilioCredentialListSid));
        if (config.twilioCredentialSid) form.setFieldValue("twilioCredentialSid", String(config.twilioCredentialSid));
        console.log("[LiveKitOutboundConfig] Set credential mode to 'existing' with Twilio references");
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
      <Form<TrunkFormValues> onSubmit={() => {
        console.log("[LiveKitOutboundConfigurationDialog] Form submit button clicked");
        console.log("[LiveKitOutboundConfigurationDialog] Form canSubmit:", form.state.canSubmit);
        console.log("[LiveKitOutboundConfigurationDialog] Form fieldMeta:", form.state.fieldMeta);
        console.log("[LiveKitOutboundConfigurationDialog] Form values:", form.state.values);
        
        // Log all fields with errors
        Object.entries(form.state.fieldMeta).forEach(([fieldName, meta]) => {
          if (meta && 'errors' in meta && Array.isArray(meta.errors) && meta.errors.length > 0) {
            console.log(`[LiveKitOutboundConfigurationDialog] Field "${fieldName}" has errors:`, meta.errors);
          }
        });
        
        form.handleSubmit();
      }}>
        <div className="space-y-6">
          <LiveKitOutboundConfigurationForm 
            form={form} 
            isLoading={isLoading} 
            showTitle={false}
            trunkId={trunk.id}
            isEditMode={true}
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

