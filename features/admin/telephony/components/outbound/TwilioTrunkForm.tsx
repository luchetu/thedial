"use client";

import { useState, useEffect } from "react";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTwilioCredentialLists } from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import type {
  TwilioCredentialListMode,
} from "@/features/admin/telephony/types";

interface TwilioTrunkFormValues extends Record<string, unknown> {
  friendlyName: string;
  terminationSipDomain: string;
  originationSipUri?: string;
  credentialListMode: TwilioCredentialListMode;
  credentialListSid?: string;
  credentialListName?: string;
  username?: string;
  password?: string;
}

export interface TwilioTrunkFormPayload {
  friendlyName: string;
  terminationSipDomain: string;
  originationSipUri?: string;
  credentialMode: TwilioCredentialListMode;
  credentialListSid?: string;
  credentialListName?: string;
  username?: string;
  password?: string;
}

interface TwilioTrunkFormProps {
  defaultValues?: Partial<TwilioTrunkFormValues>;
  onSubmit: (values: TwilioTrunkFormPayload) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const TwilioTrunkForm = ({
  defaultValues = {
    friendlyName: "",
    terminationSipDomain: "",
    originationSipUri: "",
    credentialListMode: "create",
    credentialListSid: "",
    credentialListName: "",
    username: "",
    password: "",
  },
  onSubmit,
  isLoading = false,
  submitLabel = "Create Twilio Trunk",
}: TwilioTrunkFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Fetch credential lists to determine if "existing" option should be shown
  const { data: credentialLists = [], isLoading: isLoadingCredentialLists } = useTwilioCredentialLists();
  const hasCredentialLists = credentialLists.length > 0;
  
  // Auto-set to "create" mode if no credential lists exist
  const initialMode = hasCredentialLists 
    ? ((defaultValues?.credentialListMode as TwilioCredentialListMode) || "create")
    : "create";
  
  const [credentialListMode, setCredentialListMode] = useState<TwilioCredentialListMode>(initialMode);
  
  // Update mode if credential lists become available/unavailable
  useEffect(() => {
    if (!hasCredentialLists && credentialListMode === "existing") {
      setCredentialListMode("create");
      form.setFieldValue("credentialListMode", "create");
      form.setFieldValue("credentialListSid", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCredentialLists, credentialListMode]);

  const form = useForm<TwilioTrunkFormValues>({
    defaultValues: {
      friendlyName: defaultValues?.friendlyName || "",
      terminationSipDomain: defaultValues?.terminationSipDomain || "",
      originationSipUri: defaultValues?.originationSipUri || "",
      credentialListMode: initialMode,
      credentialListSid: defaultValues?.credentialListSid || "",
      credentialListName: defaultValues?.credentialListName || "",
      username: defaultValues?.username || "",
      password: defaultValues?.password || "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        console.log("[TwilioTrunkForm] raw values", values);
        const credentialMode = values.credentialListMode;
        const payload: TwilioTrunkFormPayload = {
          friendlyName: values.friendlyName.trim(),
          terminationSipDomain: values.terminationSipDomain.trim(),
          originationSipUri: values.originationSipUri?.toString().trim() || undefined,
          credentialMode,
          credentialListSid:
            credentialMode === "existing"
              ? String(values.credentialListSid || "").trim() || undefined
              : undefined,
          credentialListName:
            credentialMode === "create"
              ? values.credentialListName?.toString().trim() || undefined
              : undefined,
          username:
            credentialMode === "create"
              ? values.username?.toString().trim() || undefined
              : undefined,
          password:
            credentialMode === "create"
              ? values.password?.toString().trim() || undefined
              : undefined,
        };

        console.log("[TwilioTrunkForm] normalized payload", payload);

        if (credentialMode === "create") {
          await onSubmit(payload);
          return;
        }

        if (!payload.credentialListSid) {
          console.warn("[TwilioTrunkForm] credentialListSid missing while mode is existing.");
          return;
        }

        await onSubmit(payload);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Something went wrong");
      }
    },
  });

  const logFormState = () => {
    const canSubmit = form.state.canSubmit;
    const errors = form.state.fieldMeta;
    console.log("[TwilioTrunkForm] canSubmit", canSubmit);
    console.log("[TwilioTrunkForm] field meta", errors);
  };

  return (
    <Form<TwilioTrunkFormValues>
      onSubmit={() => {
        logFormState();
        form.handleSubmit();
      }}
    >
      <div className="space-y-6">
        {/* Friendly Name */}
        <form.Field
          name="friendlyName"
          validators={{
            onChange: ({ value }) => {
              const stringValue = String(value || "");
              if (!stringValue || stringValue.trim() === "")
                return "This field is required";
              if (stringValue.trim().length < 2)
                return "Must be at least 2 characters";
              return undefined;
            },
          }}
        >
          {(field) => (
            <FormField
              field={field}
              name="friendlyName"
              label="Trunk Name"
              placeholder="e.g., Production Twilio Trunk"
              required
              error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
            />
          )}
        </form.Field>

          {/* Termination SIP Domain */}
          <form.Field
            name="terminationSipDomain"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "")
                  return "Termination SIP domain is required";
                if (!stringValue.includes("."))
                  return "Enter a valid SIP domain (e.g., mytrunk.pstn.twilio.com)";
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                field={field}
                name="terminationSipDomain"
                label="Termination SIP Domain"
                placeholder="my-trunk.pstn.twilio.com"
                required
                error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
              />
            )}
          </form.Field>

          {/* Origination SIP URI */}
          <form.Field name="originationSipUri">
            {(field) => (
              <div className="space-y-2">
                <FormField
                  field={field}
                  name="originationSipUri"
                  label="Origination SIP URI (Optional)"
                  placeholder="sip:my-project.sip.livekit.cloud"
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  LiveKit SIP URI for inbound calls. Leave empty if not configuring inbound calls.
                </p>
              </div>
            )}
          </form.Field>

          {/* Credentials Section - Required for outbound calls */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Credential List <span className="text-destructive">*</span></h3>
            <p className="text-xs text-muted-foreground">
              Required for outbound calls. Attach an existing Twilio credential list or create one with username/password credentials. LiveKit will use these credentials to authenticate with Twilio when making outbound calls.
            </p>
          </div>

          <form.Field
            name="credentialListMode"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Select a credential list option";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Credential Source</Label>
                <RadioGroup
                  value={String(field.state.value)}
                  onValueChange={(value) => {
                    const mode = value as "existing" | "create";
                    field.handleChange(mode);
                    setCredentialListMode(mode);
                    if (mode === "existing") {
                      form.setFieldValue("credentialListName", "");
                      form.setFieldValue("username", "");
                      form.setFieldValue("password", "");
                    } else {
                      form.setFieldValue("credentialListSid", "");
                    }
                  }}
                >
                  {hasCredentialLists && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="credential-list-existing" />
                      <Label htmlFor="credential-list-existing" className="font-normal cursor-pointer">
                        Use Existing Credential List {isLoadingCredentialLists && "(loading...)"}
                      </Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="credential-list-create" />
                    <Label htmlFor="credential-list-create" className="font-normal cursor-pointer">
                      Create New Credential List
                    </Label>
                  </div>
                  {!hasCredentialLists && !isLoadingCredentialLists && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No existing credential lists found. A new one will be created.
                    </p>
                  )}
                </RadioGroup>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {credentialListMode === "existing" ? (
            <form.Field
              name="credentialListSid"
              validators={{
                onChange: ({ value }) => {
                  const stringValue = String(value || "");
                  if (!stringValue || stringValue.trim() === "") {
                    return "Credential List SID is required";
                  }
                  if (!stringValue.startsWith("CL")) {
                    return "SID must start with 'CL'";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2 w-full my-4">
                  <Label htmlFor="credentialListSid" className="text-sm font-medium">
                    Twilio Credential List
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(field.state.value || "")}
                    onValueChange={(value) => field.handleChange(value)}
                    disabled={isLoadingCredentialLists}
                  >
                    <SelectTrigger 
                      id="credentialListSid" 
                      className="w-full"
                      aria-invalid={!field.state.meta.isValid}
                    >
                      <SelectValue placeholder={isLoadingCredentialLists ? "Loading credential lists..." : "Select a credential list"} />
                    </SelectTrigger>
                    <SelectContent>
                      {credentialLists.map((list) => (
                        <SelectItem key={list.sid} value={list.sid}>
                          <div className="flex flex-col">
                            <span>{list.friendlyName}</span>
                            <span className="text-xs text-muted-foreground">{list.sid}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!field.state.meta.isValid && (
                    <p className="text-sm text-destructive" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          ) : (
            <>
          <form.Field name="credentialListName">
            {(field) => (
              <div className="space-y-2">
                <FormField
                  field={field}
                  name="credentialListName"
                  label="Credential List Name"
                  placeholder="e.g., LiveKit-Outbound-Prod"
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated if left empty
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="username">
            {(field) => (
              <div className="space-y-2">
                <FormField
                  field={field}
                  name="username"
                  label="Username"
                  placeholder="e.g., livekit-prod-001"
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-generated if left empty
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Auto-generated if left empty"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <span className="text-xs text-muted-foreground">Hide</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Show</span>
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
            </>
          )}
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

