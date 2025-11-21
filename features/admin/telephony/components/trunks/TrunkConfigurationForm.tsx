"use client";

import { useStore } from "@tanstack/react-form";
import { useForm } from "@/lib/forms";
import { AddTwilioConfigurationForm } from "./TwilioConfigurationForm";
import { LiveKitOutboundConfigurationForm } from "./LiveKitOutboundConfigurationForm";
import { LiveKitInboundConfigurationForm } from "./LiveKitInboundConfigurationForm";
import { CustomConfigurationForm } from "./CustomConfigurationForm";
import type { TrunkFormValues } from "./types";

interface TrunkConfigurationFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
  isEditMode?: boolean;
  twilioTrunkSid?: string; // Twilio trunk SID for managing origination URLs
  existingCredentialListSid?: string; // Existing credential list SID to autofill when switching to "existing" mode
}

export function TrunkConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
  isEditMode = false,
  twilioTrunkSid,
  existingCredentialListSid,
}: TrunkConfigurationFormProps) {
  const trunkType = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.type);

  // Route to appropriate form component based on trunk type
  if (trunkType === "livekit_outbound") {
    return (
      <LiveKitOutboundConfigurationForm
        form={form}
        isLoading={isLoading}
        showTitle={showTitle}
      />
    );
  }

  if (trunkType === "livekit_inbound") {
    return (
      <LiveKitInboundConfigurationForm
        form={form}
        isLoading={isLoading}
        showTitle={showTitle}
      />
    );
  }

  if (trunkType === "twilio") {
    return (
      <AddTwilioConfigurationForm
        form={form}
        isLoading={isLoading}
        showTitle={showTitle}
        isEditMode={isEditMode}
        twilioTrunkSid={twilioTrunkSid}
        existingCredentialListSid={existingCredentialListSid}
      />
    );
  }

  // Custom trunk
  return <CustomConfigurationForm showTitle={showTitle} />;
}
