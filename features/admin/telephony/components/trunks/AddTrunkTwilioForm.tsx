"use client";

import { useState, useEffect } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrunkBasicInfoForm } from "./TrunkBasicInfoForm";
import { useTwilioCredentialLists } from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import { useCreateTrunk, useUpdateTrunk, useConfigureTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { OriginationURLsSection } from "./OriginationURLsSection";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { toastError, toastSuccess } from "@/lib/toast";

interface AddTrunkTwilioFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
  trunkId?: string;
  twilioTrunkSid?: string; // Twilio trunk SID (externalId) for managing origination URLs
}

export function AddTrunkTwilioForm({
  defaultValues,
  onSubmit,
  isLoading: externalLoading = false,
  submitLabel = "Create Trunk",
  isEditMode = false,
  trunkId,
  twilioTrunkSid,
}: AddTrunkTwilioFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTwilioPassword, setShowTwilioPassword] = useState(false);
  
  const createMutation = useCreateTrunk();
  const updateMutation = useUpdateTrunk();
  const configureMutation = useConfigureTrunk();

  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending || configureMutation.isPending;

  // Fetch credential lists from API
  const { data: credentialLists = [], isLoading: isLoadingCredentialLists } = useTwilioCredentialLists();
  const hasCredentialLists = credentialLists.length > 0;

  // Debug: Log defaultValues received
  console.log("[AddTrunkTwilioForm] defaultValues received:", defaultValues);
  console.log("[AddTrunkTwilioForm] defaultValues.originationSipUri:", defaultValues?.originationSipUri);

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: "twilio",
      direction: "outbound",
      externalId: defaultValues?.externalId || "",
      status: defaultValues?.status || "active",
      terminationSipDomain: defaultValues?.terminationSipDomain || "",
      originationSipUri: defaultValues?.originationSipUri || "",
      credentialMode: defaultValues?.credentialMode || "create",
      credentialListSid: defaultValues?.credentialListSid || "",
      credentialListName: defaultValues?.credentialListName || "",
      twilioUsername: defaultValues?.twilioUsername || "",
      twilioPassword: defaultValues?.twilioPassword || "",
    },
    onSubmit: async (values) => {
      try {
        let trunkIdToUse = trunkId;

        // Step 1: Create or update trunk registry (basic info only)
        if (isEditMode && trunkIdToUse) {
          const request: UpdateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: "outbound",
            provider: "twilio",
            status: values.status,
          };

          await updateMutation.mutateAsync({
            id: trunkIdToUse,
            data: request,
          });
          toastSuccess("Trunk updated successfully");
        } else {
          const request: CreateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: "outbound",
            provider: "twilio",
            status: values.status,
          };

          const trunk = await createMutation.mutateAsync(request);
          trunkIdToUse = trunk.id;
          toastSuccess("Trunk created successfully");
        }

        // Step 2: Configure trunk (Twilio-specific fields)
        if (trunkIdToUse) {
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
            id: trunkIdToUse,
            data: configRequest,
          });
          toastSuccess(isEditMode ? "Trunk configuration updated successfully" : "Trunk configured successfully");
          onSubmit?.();
        }
      } catch (error) {
        const err = error as Error;
        toastError(`Failed to ${isEditMode ? "update" : "create"} trunk: ${err.message}`);
        throw error;
      }
    },
  });

  const credentialMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.credentialMode);

  // Auto-set to "create" mode if no credential lists exist and currently set to "existing"
  useEffect(() => {
    if (!hasCredentialLists && credentialMode === "existing") {
      form.setFieldValue("credentialMode", "create");
      form.setFieldValue("credentialListSid", "");
    }
  }, [hasCredentialLists, credentialMode, form]);

  // Ensure type is always "twilio" for this form
  useEffect(() => {
    form.setFieldValue("type", "twilio");
    form.setFieldValue("direction", "outbound");
  }, [form]);

  // Update form values when defaultValues change (e.g., when twilioTrunk data loads)
  useEffect(() => {
    console.log("[AddTrunkTwilioForm] useEffect triggered with defaultValues:", defaultValues);
    if (defaultValues) {
      if (defaultValues.terminationSipDomain !== undefined) {
        console.log("[AddTrunkTwilioForm] Setting terminationSipDomain:", defaultValues.terminationSipDomain);
        form.setFieldValue("terminationSipDomain", defaultValues.terminationSipDomain || "");
      }
      if ("originationSipUri" in defaultValues) {
        const originationValue = defaultValues.originationSipUri ?? "";
        console.log("[AddTrunkTwilioForm] Setting originationSipUri:", originationValue, "(from defaultValues:", defaultValues.originationSipUri, ")");
        form.setFieldValue("originationSipUri", originationValue);
        // Also log the current form value after setting
        setTimeout(() => {
          const currentValue = form.getFieldValue("originationSipUri");
          console.log("[AddTrunkTwilioForm] Form value after setFieldValue:", currentValue);
        }, 100);
      }
      if (defaultValues.credentialMode !== undefined) {
        console.log("[AddTrunkTwilioForm] Setting credentialMode:", defaultValues.credentialMode);
        form.setFieldValue("credentialMode", defaultValues.credentialMode || "create");
      }
      if (defaultValues.credentialListSid !== undefined) {
        console.log("[AddTrunkTwilioForm] Setting credentialListSid:", defaultValues.credentialListSid);
        form.setFieldValue("credentialListSid", defaultValues.credentialListSid || "");
      }
      if (defaultValues.credentialListName !== undefined) {
        console.log("[AddTrunkTwilioForm] Setting credentialListName:", defaultValues.credentialListName);
        form.setFieldValue("credentialListName", defaultValues.credentialListName || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.terminationSipDomain, defaultValues?.originationSipUri, defaultValues?.credentialMode, defaultValues?.credentialListSid, defaultValues?.credentialListName]);

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate basic info before proceeding
      const name = form.getFieldValue("name");
      if (!name || (typeof name === "string" && name.trim() === "")) {
        return;
      }
      setCurrentStep(1);
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
        {/* Step Indicator - Only show in create mode */}
        {!isEditMode && (
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
        )}

        {/* Step Content */}
        {isEditMode ? (
          // Edit mode: Show only basic info form
          <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
        ) : (
          // Create mode: Show steps
          <>
            {currentStep === 0 && (
              <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Twilio Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure Twilio Elastic SIP Trunk and credential list.
                  </p>
                </div>

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
            )}
          </>
        )}

        {/* Navigation Buttons */}
        {isEditMode ? (
          // Edit mode: Just show submit button
          <div className="pt-4 border-t">
            <FormSubmitButton loading={isLoading} variant="secondary">
              {submitLabel}
            </FormSubmitButton>
          </div>
        ) : (
          // Create mode: Show step navigation
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
            </div>
            <div className="flex items-center gap-2">
              {currentStep === 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {currentStep === 1 && (
                <FormSubmitButton loading={isLoading} variant="secondary">
                  {submitLabel}
                </FormSubmitButton>
              )}
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}

