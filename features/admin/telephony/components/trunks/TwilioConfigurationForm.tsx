"use client";

import { useState, useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, FormField } from "@/lib/forms";
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
import { OriginationURLsSection } from "./OriginationURLsSection";
import type { TrunkFormValues } from "./types";

interface AddTwilioConfigurationFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
  isEditMode?: boolean;
  twilioTrunkSid?: string; // Twilio trunk SID (externalId) for managing origination URLs
  existingCredentialListSid?: string; // Existing credential list SID to autofill when switching to "existing" mode
}

// Renamed to AddTwilioConfigurationForm for clarity
export function AddTwilioConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
  isEditMode = false,
  twilioTrunkSid,
  existingCredentialListSid,
}: AddTwilioConfigurationFormProps) {
  const [showTwilioPassword, setShowTwilioPassword] = useState(false);
  
  // Fetch credential lists from API
  const { data: credentialLists = [], isLoading: isLoadingCredentialLists } = useTwilioCredentialLists();
  const hasCredentialLists = credentialLists.length > 0;
  const credentialMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.credentialMode);
  
  // Auto-set to "create" mode if no credential lists exist and currently set to "existing"
  useEffect(() => {
    if (!hasCredentialLists && credentialMode === "existing") {
      form.setFieldValue("credentialMode", "create");
      form.setFieldValue("credentialListSid", "");
    }
  }, [hasCredentialLists, credentialMode, form]);

  // Autofill existing credential list SID when in edit mode and credentialMode is "existing"
  useEffect(() => {
    if (isEditMode && existingCredentialListSid && credentialMode === "existing") {
      const currentSid = form.getFieldValue("credentialListSid");
      if (!currentSid || String(currentSid).trim() === "") {
        form.setFieldValue("credentialListSid", existingCredentialListSid);
      }
    }
  }, [isEditMode, existingCredentialListSid, credentialMode, form]);

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Twilio Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure Twilio Elastic SIP Trunk and credential list.
          </p>
        </div>
      )}

      <form.Field
        name="terminationSipDomain"
        validators={{
          onChange: ({ value }) => {
            const stringValue = String(value || "");
            if (!stringValue || stringValue.trim() === "") return "Termination SIP domain is required";
            if (!stringValue.includes(".")) return "Must be a valid domain";
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
            disabled={isLoading}
            error={
              !field.state.meta.isValid
                ? field.state.meta.errors.join(", ")
                : undefined
            }
          />
        )}
      </form.Field>

      {/* Origination SIP URI: Show single field in CREATE mode, management section in EDIT mode */}
      {!isEditMode || !twilioTrunkSid ? (
        // CREATE mode: Show single field for initial setup
        <form.Field name="originationSipUri">
          {(field) => (
            <div className="space-y-2">
              <FormField
                field={field}
                name="originationSipUri"
                label="Origination SIP URI (Optional)"
                placeholder="sip:my-project.sip.livekit.cloud"
                disabled={isLoading}
                error={
                  !field.state.meta.isValid
                    ? field.state.meta.errors.join(", ")
                    : undefined
                }
              />
              <p className="text-xs text-muted-foreground">
                LiveKit SIP URI for inbound calls. Leave empty if not configuring inbound calls.
                After creating the trunk, you can manage multiple origination URLs with priority and weight in the edit view.
              </p>
            </div>
          )}
        </form.Field>
      ) : (
        // EDIT mode: Show management section for multiple URLs
        <OriginationURLsSection trunkSid={twilioTrunkSid} enabled={true} />
      )}

      <div className="space-y-4 border-t pt-4">
        <div>
          <h3 className="text-sm font-semibold mb-1">Credential List <span className="text-destructive">*</span></h3>
          <p className="text-xs text-muted-foreground">
            Required for outbound calls. Attach an existing Twilio credential list or create one with username/password credentials. LiveKit will use these credentials to authenticate with Twilio when making outbound calls.
          </p>
        </div>

        <form.Field
          name="credentialMode"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Credential mode is required";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Credential Source</Label>
              <RadioGroup
                value={String(field.state.value || "create")}
                onValueChange={(value) => {
                  const mode = value as "existing" | "create";
                  field.handleChange(mode);
                  if (mode === "existing") {
                    form.setFieldValue("credentialListName", "");
                    form.setFieldValue("twilioUsername", "");
                    form.setFieldValue("twilioPassword", "");
                    // Autofill existing credential list SID if available and field is empty
                    const currentSid = form.getFieldValue("credentialListSid");
                    if (existingCredentialListSid && (!currentSid || String(currentSid).trim() === "")) {
                      form.setFieldValue("credentialListSid", existingCredentialListSid);
                    }
                  } else {
                    form.setFieldValue("credentialListSid", "");
                  }
                }}
              >
                {hasCredentialLists && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="credential-mode-existing" />
                    <Label htmlFor="credential-mode-existing" className="font-normal cursor-pointer">
                      Use Existing Credential List {isLoadingCredentialLists && "(loading...)"}
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="credential-mode-create" />
                  <Label htmlFor="credential-mode-create" className="font-normal cursor-pointer">
                    Create New Credential List
                  </Label>
                </div>
                {!hasCredentialLists && !isLoadingCredentialLists && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No existing credential lists found. A new one will be created.
                  </p>
                )}
              </RadioGroup>
            </div>
          )}
        </form.Field>

        {credentialMode === "existing" ? (
          <form.Field
            name="credentialListSid"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") {
                  return "Credential List is required";
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
                  disabled={isLoading || isLoadingCredentialLists}
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
                <FormField
                  field={field}
                  name="credentialListName"
                  label="Credential List Name (Optional)"
                  placeholder="Auto-generated if not provided"
                  disabled={isLoading}
                />
              )}
            </form.Field>

            <form.Field name="twilioUsername">
              {(field) => (
                <FormField
                  field={field}
                  name="twilioUsername"
                  label="Username (Optional)"
                  placeholder="Auto-generated if not provided"
                  disabled={isLoading}
                />
              )}
            </form.Field>

            <form.Field name="twilioPassword">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password (Optional)</Label>
                  <div className="relative">
                    <input
                      type={showTwilioPassword ? "text" : "password"}
                      value={String(field.state.value || "")}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                      placeholder="Auto-generated if not provided"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowTwilioPassword(!showTwilioPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showTwilioPassword ? (
                        <span className="text-xs text-muted-foreground">Hide</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Show</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form.Field>
          </>
        )}
      </div>
    </div>
  );
}

