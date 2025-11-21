"use client";

import { useMemo, useEffect } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { AddTwilioConfigurationForm } from "../TwilioConfigurationForm";
import { useConfigureTrunk, useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { useTwilioTrunk } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import type { Trunk, ConfigureTrunkRequest } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";
import { toastError, toastSuccess } from "@/lib/toast";

interface TwilioConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk: Trunk;
  onSuccess?: () => void;
}

export function TwilioConfigurationDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: TwilioConfigurationDialogProps) {
  const configureMutation = useConfigureTrunk();
  
  const { data: fullTrunkData } = useTrunk(trunk.id, {
    enabled: open,
  });
  
  const twilioTrunkSid = fullTrunkData?.externalId || trunk.externalId;
  
  const { data: twilioTrunk } = useTwilioTrunk(twilioTrunkSid || "", {
    enabled: open && !!twilioTrunkSid,
  });
  
  const defaultValues = useMemo<Partial<TrunkFormValues>>(() => {
    const baseValues: Partial<TrunkFormValues> = {
      name: trunk.name,
      type: trunk.type,
      direction: trunk.direction,
      status: trunk.status,
    };
    
    if (twilioTrunk) {
      baseValues.terminationSipDomain = twilioTrunk.terminationSipDomain || twilioTrunk.domainName;
      if (twilioTrunk.originationSipUri != null) {
        baseValues.originationSipUri = twilioTrunk.originationSipUri;
      }
      if (twilioTrunk.credentialListSid) {
        baseValues.credentialMode = "existing";
        baseValues.credentialListSid = twilioTrunk.credentialListSid;
        baseValues.credentialListName = twilioTrunk.credentialListName || undefined;
      } else {
        baseValues.credentialMode = "create";
      }
    }
    
    return baseValues;
  }, [trunk, twilioTrunk]);

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues.name || "",
      type: "twilio",
      direction: "outbound",
      status: defaultValues.status || "active",
      terminationSipDomain: defaultValues.terminationSipDomain || "",
      originationSipUri: defaultValues.originationSipUri || "",
      credentialMode: defaultValues.credentialMode || "create",
      credentialListSid: defaultValues.credentialListSid || "",
      credentialListName: defaultValues.credentialListName || "",
      twilioUsername: defaultValues.twilioUsername || "",
      twilioPassword: defaultValues.twilioPassword || "",
    },
    onSubmit: async (values) => {
      try {
        const configRequest: ConfigureTrunkRequest = {
          terminationSipDomain: values.terminationSipDomain.trim(),
        };
        
        if (values.originationSipUri?.trim()) {
          configRequest.originationSipUri = values.originationSipUri.trim();
        }
        
        configRequest.credentialMode = values.credentialMode;
        if (values.credentialMode === "existing" && values.credentialListSid) {
          configRequest.credentialListSid = values.credentialListSid.trim();
        } else {
          configRequest.credentialListName = values.credentialListName.trim() || undefined;
          configRequest.twilioUsername = values.twilioUsername.trim() || undefined;
          configRequest.twilioPassword = values.twilioPassword.trim() || undefined;
        }

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

  // Update form values when Twilio trunk data loads
  useEffect(() => {
    if (twilioTrunk) {
      form.setFieldValue("terminationSipDomain", twilioTrunk.terminationSipDomain || twilioTrunk.domainName || "");
      if (twilioTrunk.originationSipUri != null) {
        form.setFieldValue("originationSipUri", twilioTrunk.originationSipUri);
      }
      if (twilioTrunk.credentialListSid) {
        form.setFieldValue("credentialMode", "existing");
        form.setFieldValue("credentialListSid", twilioTrunk.credentialListSid);
        form.setFieldValue("credentialListName", twilioTrunk.credentialListName || "");
      } else {
        form.setFieldValue("credentialMode", "create");
      }
    }
  }, [twilioTrunk, form]);

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure Twilio Trunk"
      description="Update Twilio trunk configuration settings below."
    >
      <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
        <div className="space-y-6">
          <AddTwilioConfigurationForm
            key={`twilio-config-${trunk.id}-${twilioTrunk?.id || "loading"}`}
            form={form}
            isLoading={isLoading}
            showTitle={false}
            isEditMode={true}
            twilioTrunkSid={twilioTrunkSid}
            existingCredentialListSid={twilioTrunk?.credentialListSid}
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

