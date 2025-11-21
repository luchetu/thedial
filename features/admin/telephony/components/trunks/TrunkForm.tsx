"use client";

import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { TrunkBasicInfoForm } from "./TrunkBasicInfoForm";
import { TrunkConfigurationForm } from "./TrunkConfigurationForm";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { getProviderFromType } from "./types";

interface TrunkFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit: (values: CreateTrunkRequest | UpdateTrunkRequest) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  mode?: "create" | "edit" | "configuration-only";
  lockType?: boolean; // If true, lock the type field (type is pre-selected)
  isEditMode?: boolean; // Pass through to configuration form
  twilioTrunkSid?: string; // Twilio trunk SID for managing origination URLs
  existingCredentialListSid?: string; // Existing credential list SID to autofill when switching to "existing" mode
}

export function TrunkForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Create Trunk",
  mode = "create",
  lockType = false,
  isEditMode = false,
  twilioTrunkSid,
  existingCredentialListSid,
}: TrunkFormProps) {
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
      const provider = getProviderFromType(values.type);
      // Twilio trunks are always outbound
      const direction = values.type === "twilio" ? "outbound" : values.direction;
      
      const request: CreateTrunkRequest | UpdateTrunkRequest = {
        name: values.name,
        type: values.type,
        direction,
        provider,
        externalId: values.externalId.trim() || undefined,
        status: values.status,
      };

      // Add type-specific fields
      if (values.type === "livekit_outbound") {
        request.address = values.address.trim();
        request.numbers = values.outboundNumberMode === "any" ? ["*"] : values.outboundNumbers;
        request.authUsername = values.authUsername.trim();
        request.authPassword = values.authPassword.trim();
      } else if (values.type === "livekit_inbound") {
        request.inboundNumbers = values.inboundNumbers || [];
        request.allowedNumbers = values.restrictAllowedNumbers ? values.allowedNumbers : [];
        request.krispEnabled = values.krispEnabled;
      } else if (values.type === "twilio") {
        request.terminationSipDomain = values.terminationSipDomain.trim();
        request.credentialMode = values.credentialMode;
        if (values.credentialMode === "existing") {
          request.credentialListSid = values.credentialListSid.trim();
        } else {
          request.credentialListName = values.credentialListName.trim() || undefined;
          request.twilioUsername = values.twilioUsername.trim() || undefined;
          request.twilioPassword = values.twilioPassword.trim() || undefined;
        }
      }

      await onSubmit(request);
    },
  });

  const showBasicInfo = mode !== "configuration-only";
  const showConfiguration = mode !== "create" || true; // Always show config, but can be skipped in multi-step

  return (
    <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        {showBasicInfo && (
          <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={mode === "edit"} lockType={lockType} />
        )}
        
        {showConfiguration && (
          <div className={showBasicInfo ? "border-t pt-6" : ""}>
            <TrunkConfigurationForm 
              form={form} 
              isLoading={isLoading} 
              showTitle={mode === "edit"} 
              isEditMode={isEditMode || mode === "edit" || mode === "configuration-only"}
              twilioTrunkSid={twilioTrunkSid}
              existingCredentialListSid={existingCredentialListSid}
            />
          </div>
        )}

        <div className="pt-4 border-t">
          <FormSubmitButton loading={isLoading} variant="secondary">
            {submitLabel}
          </FormSubmitButton>
        </div>
      </div>
    </Form>
  );
}
