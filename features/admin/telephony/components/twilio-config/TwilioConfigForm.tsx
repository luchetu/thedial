"use client";

import { useState } from "react";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Eye, EyeOff } from "lucide-react";
import type { UpdateTwilioConfigRequest } from "@/features/admin/telephony/types";

interface TwilioConfigFormValues extends Record<string, unknown> {
  accountSid: string;
  authToken: string;
  sipTrunkAddress: string;
  sipTrunkUsername: string;
  sipTrunkPassword: string;
  inboundVoiceWebhookUrl: string;
  inboundSmsWebhookUrl?: string;
}

interface TwilioConfigFormProps {
  defaultValues?: Partial<TwilioConfigFormValues>;
  onSubmit: (values: UpdateTwilioConfigRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}


export const TwilioConfigForm = ({
  defaultValues = {
    accountSid: "",
    authToken: "",
    sipTrunkAddress: "",
    sipTrunkUsername: "",
    sipTrunkPassword: "",
    inboundVoiceWebhookUrl: "",
    inboundSmsWebhookUrl: "",
  },
  onSubmit,
  isLoading = false,
  submitLabel = "Save Configuration",
}: TwilioConfigFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [showSipPassword, setShowSipPassword] = useState(false);

  const form = useForm<TwilioConfigFormValues>({
    defaultValues: {
      accountSid: defaultValues?.accountSid || "",
      authToken: defaultValues?.authToken || "",
      sipTrunkAddress: defaultValues?.sipTrunkAddress || "",
      sipTrunkUsername: defaultValues?.sipTrunkUsername || "",
      sipTrunkPassword: defaultValues?.sipTrunkPassword || "",
      inboundVoiceWebhookUrl: defaultValues?.inboundVoiceWebhookUrl || "",
      inboundSmsWebhookUrl: defaultValues?.inboundSmsWebhookUrl || "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        console.log("[TwilioConfigForm] submit values", values);
        const request: UpdateTwilioConfigRequest = {
          accountSid: values.accountSid || undefined,
          authToken: values.authToken || undefined,
          sipTrunkAddress: values.sipTrunkAddress?.trim() || undefined,
          sipTrunkUsername: values.sipTrunkUsername?.trim() || undefined,
          sipTrunkPassword: values.sipTrunkPassword?.trim() || undefined,
          inboundVoiceWebhookUrl: values.inboundVoiceWebhookUrl?.trim() || undefined,
          inboundSmsWebhookUrl: values.inboundSmsWebhookUrl?.trim() || undefined,
        };
        console.log("[TwilioConfigForm] request payload", request);

        await onSubmit(request);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Something went wrong");
      }
    },
  });

  return (
    <Form<TwilioConfigFormValues> onSubmit={form.handleSubmit}>
      <div className="space-y-6">
        {/* Twilio API Credentials */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Twilio API Credentials</h3>
            <p className="text-sm text-muted-foreground">
              Used for Twilio API calls (buying numbers, managing trunks, etc.)
            </p>
          </div>

          {/* Account SID */}
          <form.Field
            name="accountSid"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "")
                  return "This field is required";
                if (!stringValue.startsWith("AC"))
                  return "Account SID must start with 'AC'";
                if (stringValue.length < 34)
                  return "Account SID must be at least 34 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                field={field}
                name="accountSid"
                label="Account SID"
                placeholder="AC..."
                required
                error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
              />
            )}
          </form.Field>

          {/* Auth Token */}
          <form.Field
            name="authToken"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "")
                  return "This field is required";
                if (stringValue.length < 32)
                  return "Auth token must be at least 32 characters";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Auth Token
                  <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAuthToken ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Enter auth token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthToken(!showAuthToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showAuthToken ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* SIP Trunk Credentials */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">SIP Trunk Credentials</h3>
            <p className="text-sm text-muted-foreground">
              Default credentials for LiveKit outbound trunks to connect to Twilio. Can be overridden per-trunk.
            </p>
          </div>

          {/* SIP Trunk Address */}
          <form.Field name="sipTrunkAddress">
            {(field) => (
              <FormField
                field={field}
                name="sipTrunkAddress"
                label="SIP Trunk Address"
                placeholder="abc123.pstn.twilio.com"
              />
            )}
          </form.Field>

          {/* SIP Trunk Username */}
          <form.Field name="sipTrunkUsername">
            {(field) => (
              <FormField
                field={field}
                name="sipTrunkUsername"
                label="SIP Trunk Username"
                placeholder="livekit-prod"
              />
            )}
          </form.Field>

          {/* SIP Trunk Password */}
          <form.Field name="sipTrunkPassword">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">SIP Trunk Password</label>
                <div className="relative">
                  <input
                    type={showSipPassword ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSipPassword(!showSipPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showSipPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </form.Field>
        </div>

        {/* Webhook URLs */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Webhook URLs</h3>
            <p className="text-sm text-muted-foreground">
              Twilio calls these URLs when receiving inbound calls or SMS.
            </p>
          </div>

          {/* Inbound Voice Webhook URL */}
          <form.Field name="inboundVoiceWebhookUrl">
            {(field) => (
              <FormField
                field={field}
                name="inboundVoiceWebhookUrl"
                label="Inbound Voice Webhook URL"
                placeholder="https://example.com/api/calls/inbound"
              />
            )}
          </form.Field>

          {/* Inbound SMS Webhook URL */}
          <form.Field name="inboundSmsWebhookUrl">
            {(field) => (
              <FormField
                field={field}
                name="inboundSmsWebhookUrl"
                label="Inbound SMS Webhook URL"
                placeholder="https://example.com/api/sms/inbound"
              />
            )}
          </form.Field>
        </div>

        <FormSubmitButton
          className="w-full text-white"
          variant="secondary"
          size="lg"
          disabled={isLoading}
          loading={isLoading}
        >
          {submitLabel}
        </FormSubmitButton>

        {submitError && (
          <p className="text-sm text-destructive text-center" role="alert">
            {submitError}
          </p>
        )}
      </div>
    </Form>
  );
};

