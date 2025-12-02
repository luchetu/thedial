"use client";

import { useState, useEffect, useMemo } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, FormField } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrunks } from "@/features/admin/telephony/hooks/useTrunks";
import { useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { useTwilioCredentials } from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import type { TrunkFormValues } from "./types";

// E.164 format: +[country code][number] (e.g., +14155551234, +442071234567)
const e164Pattern = /^\+[1-9]\d{1,14}$/;

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    return cleaned.length > 0 ? `+${cleaned}` : "";
  }
  return cleaned;
};

interface LiveKitOutboundConfigurationFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
  trunkId?: string; // LiveKit trunk ID for fetching stored password when editing
  isEditMode?: boolean; // Whether we're editing an existing trunk
}

export function LiveKitOutboundConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
  trunkId,
  isEditMode = false,
}: LiveKitOutboundConfigurationFormProps) {
  const [outboundNumberInput, setOutboundNumberInput] = useState("");
  const [showOutboundPassword, setShowOutboundPassword] = useState(false);
  
  const outboundNumberMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.outboundNumberMode);
  const outboundNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const nums = state.values.outboundNumbers;
    return Array.isArray(nums) ? nums : [];
  });
  const livekitCredentialMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.livekitCredentialMode || "create");
  const twilioTrunkSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioTrunkSid);
  const credentialListSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioCredentialListSid);
  const credentialSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioCredentialSid);

  // Fetch Twilio trunks using unified trunks API (same approach as credential lists page)
  const { data: trunksData = [], isLoading: isLoadingTwilioTrunks } = useTrunks({ 
    provider: "twilio", 
    type: "twilio" 
  });
  
  // Map unified Trunk[] to TwilioTrunk-like format for compatibility
  const twilioTrunks = useMemo(() => {
    return trunksData.map(trunk => ({
      id: trunk.externalId || trunk.id, // Use externalId (Twilio SID) as the ID
      friendlyName: trunk.name,
      domainName: "", // Will be populated from configuration if needed
      terminationSipDomain: "", // Will be populated from configuration if needed
      externalId: trunk.externalId,
      trunkId: trunk.id, // Store the trunk UUID for fetching configuration
    }));
  }, [trunksData]);
  
  // Fetch selected Twilio trunk details to get credential list
  // Find the trunk by externalId (Twilio SID) since that's what we store in the form
  const selectedTrunk = useMemo(() => {
    if (!twilioTrunkSid) return null;
    return trunksData.find(t => t.externalId === twilioTrunkSid);
  }, [twilioTrunkSid, trunksData]);
  
  // Fetch full Twilio trunk details including configuration
  const { data: selectedTrunkFull } = useTrunk(selectedTrunk?.id || "", {
    enabled: !!selectedTrunk?.id,
  });

  // Fetch LiveKit outbound trunk details to get stored password (for edit mode)
  const { data: liveKitTrunkData } = useTrunk(trunkId || "", {
    enabled: !!trunkId,
  });

  // Get stored password from LiveKit trunk configuration (for edit mode)
  const storedPassword = useMemo(() => {
    if (liveKitTrunkData?.metadata) {
      const metadata = liveKitTrunkData.metadata as Record<string, unknown>;
      // Backend decrypts and returns password as authPassword in metadata
      const pwd = metadata.authPassword as string | undefined;
      if (pwd && typeof pwd === "string" && pwd.trim() !== "") {
        return pwd;
      }
    }
    return undefined;
  }, [liveKitTrunkData]);

  // Fetch credentials from the credential list
  const { data: credentials = [], isLoading: isLoadingCredentials } = useTwilioCredentials(
    credentialListSid || "",
    { enabled: !!credentialListSid }
  );

  // Extract credential list SID from selected Twilio trunk metadata
  const credentialListSidFromTrunk = useMemo(() => {
    if (selectedTrunkFull?.metadata) {
      const metadata = selectedTrunkFull.metadata as Record<string, unknown>;
      return metadata?.credentialListSid as string | undefined;
    }
    return undefined;
  }, [selectedTrunkFull]);

  // When Twilio trunk is selected, update credential list SID and auto-fill SIP address
  useEffect(() => {
    if (selectedTrunkFull?.metadata) {
      // Extract configuration data from metadata (backend merges config into metadata)
      const metadata = selectedTrunkFull.metadata as Record<string, unknown>;
      // Get credential list SID from configuration
      const credentialListSid = metadata?.credentialListSid as string | undefined;
      if (credentialListSid) {
        form.setFieldValue("twilioCredentialListSid", credentialListSid);
      }
      // Auto-fill SIP address from Twilio trunk's termination domain
      const terminationDomain = (metadata?.terminationDomain || metadata?.termination_domain) as string | undefined;
      if (terminationDomain) {
        const currentAddress = form.getFieldValue("address");
        // Only set if address is empty or if we're in edit mode
        if (!currentAddress || String(currentAddress).trim() === "" || isEditMode) {
          form.setFieldValue("address", terminationDomain);
          console.log("[LiveKitOutboundConfig] Auto-filled address from Twilio trunk:", terminationDomain);
        }
      } else {
        console.log("[LiveKitOutboundConfig] No termination domain found in Twilio trunk metadata, keys:", Object.keys(metadata));
      }
      // When switching to Twilio trunk, clear LiveKit credentials (user will select Twilio credential)
      // Don't clear password here - wait until credential is selected
    }
  }, [selectedTrunkFull, form, isEditMode]);

  // For credential list selector, we only have one credential list per Twilio trunk
  // So we show it as a read-only field or just use the one from the trunk
  const credentialLists = useMemo(() => {
    if (credentialListSidFromTrunk) {
      return [{ sid: credentialListSidFromTrunk, friendlyName: "Credential List" }];
    }
    return [];
  }, [credentialListSidFromTrunk]);

  // When credential is selected, auto-fill username and password from Twilio credential
  // These are stored in form state for backend submission, but not shown to user
  // This also runs when credentials are loaded and a credentialSid is already set (editing scenario)
  useEffect(() => {
    if (credentialSid && credentials.length > 0 && livekitCredentialMode === "existing") {
      const selectedCredential = credentials.find((c) => c.sid === credentialSid);
      if (selectedCredential) {
        // Auto-fill username from Twilio credential (for backend)
        form.setFieldValue("authUsername", selectedCredential.username);
        
        // Auto-fill password from credential if available (backend fetches from local DB)
        // If password is not available, backend will require it and store it for future use
        if (selectedCredential.password) {
          form.setFieldValue("authPassword", selectedCredential.password);
          console.log("[LiveKitOutboundConfig] Twilio credential selected - username and password stored for backend:", {
            credentialUsername: selectedCredential.username,
            hasPassword: true,
          });
        } else {
          // Password not available - clear it, backend will handle the error
          form.setFieldValue("authPassword", "");
          console.log("[LiveKitOutboundConfig] Twilio credential selected - password not available in local DB:", {
            credentialUsername: selectedCredential.username,
            message: "Password not found. Backend will require it or fetch from credential update.",
          });
        }
        
        // Trigger re-validation to clear errors - validators will now return undefined since mode is "existing"
        // Use a small timeout to ensure form state is updated
        setTimeout(() => {
          form.validateField("authUsername", "change");
          form.validateField("authPassword", "change");
        }, 0);
      }
    }
  }, [credentialSid, credentials, livekitCredentialMode, form]);

  // Clear validation errors when switching to "existing" mode and credential is selected
  useEffect(() => {
    if (livekitCredentialMode === "existing" && credentialSid) {
      // When using existing credentials, authUsername and authPassword are auto-filled
      // Clear any validation errors for these fields
      setTimeout(() => {
        form.validateField("authUsername", "change");
        form.validateField("authPassword", "change");
      }, 0);
    }
  }, [livekitCredentialMode, credentialSid, form]);

  // Log form validation state for debugging
  useEffect(() => {
    const canSubmit = form.state.canSubmit;
    const fieldMeta = form.state.fieldMeta;
    const errorMap = form.state.errorMap;
    
    // Log all fields with errors
    const fieldsWithErrors: Record<string, string[]> = {};
    Object.entries(fieldMeta).forEach(([fieldName, meta]) => {
      if (meta && 'errors' in meta && Array.isArray(meta.errors) && meta.errors.length > 0) {
        fieldsWithErrors[fieldName] = meta.errors;
      }
    });
    
    if (Object.keys(fieldsWithErrors).length > 0 || !canSubmit) {
      console.log("[LiveKitOutboundConfigurationForm] Form validation state:", {
        canSubmit,
        fieldsWithErrors,
        errorMap,
        formValues: form.state.values,
        credentialMode: livekitCredentialMode,
      });
    }
  }, [form.state.canSubmit, form.state.fieldMeta, form.state.errorMap, form.state.values, livekitCredentialMode, form]);

  // When no credential is selected, show password from LiveKit trunk (for edit mode)
  useEffect(() => {
    if (!credentialSid && storedPassword && isEditMode) {
      // No credential selected - show password from LiveKit trunk if available
      const currentPwd = form.getFieldValue("authPassword");
      const currentPwdStr = typeof currentPwd === "string" && currentPwd.trim() !== "" ? currentPwd : "";
      
      // Only set if form doesn't already have a password
      if (!currentPwdStr) {
        form.setFieldValue("authPassword", storedPassword);
        console.log("[LiveKitOutboundConfig] No credential selected - password autofilled from LiveKit trunk");
      }
    }
  }, [credentialSid, storedPassword, isEditMode, form]);

  const handleAddOutboundNumber = () => {
    const formatted = formatPhoneNumber(outboundNumberInput);
    if (formatted && e164Pattern.test(formatted)) {
      const currentNumbers = form.getFieldValue("outboundNumbers");
      const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
      if (!numsArray.includes(formatted)) {
        form.setFieldValue("outboundNumbers", [...numsArray, formatted]);
        setOutboundNumberInput("");
      }
    }
  };

  const handleRemoveOutboundNumber = (numberToRemove: string) => {
    const currentNumbers = form.getFieldValue("outboundNumbers");
    const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
    form.setFieldValue("outboundNumbers", numsArray.filter((n: string) => n !== numberToRemove));
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">LiveKit Outbound Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure SIP credentials and phone numbers for outbound calls. Choose to use existing Twilio credentials or create new credentials.
          </p>
        </div>
      )}

      {/* Credential Mode Selection */}
      <form.Field
        name="livekitCredentialMode"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "This field is required";
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
                  // Clear manual credential fields when switching to existing
                  form.setFieldValue("authUsername", "");
                  form.setFieldValue("authPassword", "");
                } else {
                  // Clear Twilio credential fields when switching to create
                  form.setFieldValue("twilioTrunkSid", undefined);
                  form.setFieldValue("twilioCredentialListSid", undefined);
                  form.setFieldValue("twilioCredentialSid", undefined);
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="livekit-credential-mode-existing" />
                <Label htmlFor="livekit-credential-mode-existing" className="font-normal cursor-pointer">
                  Use Existing Credentials
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create" id="livekit-credential-mode-create" />
                <Label htmlFor="livekit-credential-mode-create" className="font-normal cursor-pointer">
                  Create New Credentials
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </form.Field>

      {/* Twilio Trunk Selection for Credentials (only shown when "existing" is selected) */}
      {livekitCredentialMode === "existing" && (
        <>
          <form.Field
            name="twilioTrunkSid"
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate if "existing" mode is selected
                if (currentMode === "existing" && (!value || String(value).trim() === "")) {
                  return "Please select a Twilio trunk";
                }
                return undefined;
              },
              onSubmit: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate on submit if "existing" mode is selected
                if (currentMode === "existing" && (!value || String(value).trim() === "")) {
                  return "Please select a Twilio trunk";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Twilio Trunk <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={String(field.state.value || "")}
                  onValueChange={(value) => {
                    field.handleChange(value || undefined);
                    // Clear credential list and credential when trunk changes
                    form.setFieldValue("twilioCredentialListSid", undefined);
                    form.setFieldValue("twilioCredentialSid", undefined);
              }}
              disabled={isLoading || isLoadingTwilioTrunks}
            >
              <SelectTrigger>
                    <SelectValue placeholder="Select a Twilio trunk" />
              </SelectTrigger>
              <SelectContent>
                {twilioTrunks.map((trunk) => (
                  <SelectItem key={trunk.id} value={trunk.id}>
                        {trunk.friendlyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Select a Twilio trunk to use its credentials for this LiveKit outbound trunk.
                </p>
              </div>
            )}
          </form.Field>

          {twilioTrunkSid && (
            <>
              <form.Field
                name="twilioCredentialListSid"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    // Check current credential mode and trunk from form state
                    const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                    const currentTrunkSid = fieldApi.form.getFieldValue("twilioTrunkSid");
                    // Only validate if "existing" mode and trunk is selected
                    if (currentMode === "existing" && currentTrunkSid && (!value || String(value).trim() === "")) {
                      return "Please select a credential list";
                    }
                    return undefined;
                  },
                  onSubmit: ({ value, fieldApi }) => {
                    // Check current credential mode and trunk from form state
                    const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                    const currentTrunkSid = fieldApi.form.getFieldValue("twilioTrunkSid");
                    // Only validate on submit if "existing" mode and trunk is selected
                    if (currentMode === "existing" && currentTrunkSid && (!value || String(value).trim() === "")) {
                      return "Please select a credential list";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Credential List <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={String(field.state.value || "")}
                      onValueChange={(value) => {
                        field.handleChange(value || undefined);
                        // Clear credential selection when list changes
                        form.setFieldValue("twilioCredentialSid", undefined);
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a credential list" />
                      </SelectTrigger>
                      <SelectContent>
                        {credentialLists.map((list) => (
                          <SelectItem key={list.sid} value={list.sid}>
                            {list.friendlyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                    {!field.state.meta.isValid && (
                      <p className="text-sm text-destructive" role="alert">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
            <p className="text-xs text-muted-foreground">
                      Select the credential list from the selected Twilio trunk.
            </p>
          </div>
        )}
      </form.Field>

        <form.Field
          name="twilioCredentialSid"
          validators={{
                  onChange: ({ value, fieldApi }) => {
                    // Check current credential mode, trunk, and credential list from form state
                    const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                    const currentTrunkSid = fieldApi.form.getFieldValue("twilioTrunkSid");
                    const currentCredentialListSid = fieldApi.form.getFieldValue("twilioCredentialListSid");
                    // Only validate if "existing" mode, trunk and credential list are selected
                    if (currentMode === "existing" && currentTrunkSid && currentCredentialListSid && (!value || String(value).trim() === "")) {
                      return "Please select a credential from the list";
                    }
                    return undefined;
                  },
                  onSubmit: ({ value, fieldApi }) => {
                    // Check current credential mode, trunk, and credential list from form state
                    const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                    const currentTrunkSid = fieldApi.form.getFieldValue("twilioTrunkSid");
                    const currentCredentialListSid = fieldApi.form.getFieldValue("twilioCredentialListSid");
                    // Only validate on submit if "existing" mode, trunk and credential list are selected
                    if (currentMode === "existing" && currentTrunkSid && currentCredentialListSid && (!value || String(value).trim() === "")) {
                return "Please select a credential from the list";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Credential <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(field.state.value || "")}
                onValueChange={(value) => {
                  field.handleChange(value || undefined);
                }}
                disabled={isLoading || isLoadingCredentials}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a credential" />
                </SelectTrigger>
                <SelectContent>
                  {credentials.map((credential) => (
                    <SelectItem key={credential.sid} value={credential.sid}>
                      {credential.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!field.state.meta.isValid && (
                <p className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                      Select a credential from the Twilio trunk&apos;s credential list. Username and password will be automatically fetched.
              </p>
            </div>
          )}
        </form.Field>
            </>
          )}
        </>
      )}

      {/* When Twilio trunk and credential are selected, show info message - no username/password fields needed */}
      {livekitCredentialMode === "existing" && twilioTrunkSid && credentialSid && (
        <div className="space-y-2 p-4 bg-muted/50 rounded-md border">
          <p className="text-sm font-medium">Using Twilio Credential</p>
          <p className="text-xs text-muted-foreground">
            Username and password will be automatically fetched from the selected Twilio credential and used to configure the LiveKit outbound trunk.
          </p>
        </div>
      )}

      <form.Field
        name="address"
        validators={{
          onChange: ({ value }) => {
            const stringValue = String(value || "");
            if (!stringValue || stringValue.trim() === "") return "SIP address is required";
            if (!stringValue.includes(".")) return "Must be a valid domain";
            return undefined;
          },
        }}
      >
        {(field) => (
          <FormField
            field={field}
            name="address"
            label="SIP Address"
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

      <form.Field
        name="outboundNumberMode"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "This field is required";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Numbers</Label>
            <RadioGroup
              value={String(field.state.value || "any")}
              onValueChange={(value) => {
                const newMode = value as "any" | "specific";
                field.handleChange(newMode);
                if (newMode === "any") {
                  form.setFieldValue("outboundNumbers", []);
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="outbound-numberMode-any" />
                <Label htmlFor="outbound-numberMode-any" className="font-normal cursor-pointer">
                  All Numbers (Wildcard)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="outbound-numberMode-specific" />
                <Label htmlFor="outbound-numberMode-specific" className="font-normal cursor-pointer">
                  Specific Numbers
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </form.Field>

      {outboundNumberMode === "specific" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="tel"
              value={outboundNumberInput}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setOutboundNumberInput(formatted);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOutboundNumber();
                }
              }}
              placeholder="+14155551234"
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleAddOutboundNumber}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              disabled={!outboundNumberInput || !e164Pattern.test(formatPhoneNumber(outboundNumberInput))}
            >
              Add
            </button>
          </div>
          {outboundNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {outboundNumbers.map((number) => (
                <div
                  key={number}
                  className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm"
                >
                  <span className="font-mono">{number}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutboundNumber(number)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Enter phone numbers in E.164 format (e.g., +14155551234)
          </p>
        </div>
      )}

      {/* Manual Credential Entry (only shown when "create" mode is selected) */}
      {livekitCredentialMode === "create" && (
        <>
          <form.Field
            name="authUsername"
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate if "create" mode is selected
                if (currentMode === "create") {
                  const stringValue = String(value || "");
                  if (!stringValue || stringValue.trim() === "") return "Username is required";
                }
                return undefined;
              },
              onSubmit: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate on submit if "create" mode is selected
                if (currentMode === "create") {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Username is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                field={field}
                name="authUsername"
                label="SIP Username"
                placeholder="livekit-user"
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

          <form.Field
            name="authPassword"
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate if "create" mode is selected
                if (currentMode === "create") {
                  const stringValue = String(value || "");
                  if (!stringValue || stringValue.trim() === "") return "Password is required";
                }
                return undefined;
              },
              onSubmit: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate on submit if "create" mode is selected
                if (currentMode === "create") {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Password is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  SIP Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <input
                    type={showOutboundPassword ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOutboundPassword(!showOutboundPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showOutboundPassword ? (
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

      {/* When Twilio trunk and credential are selected, show info message - no username/password fields needed */}
      {twilioTrunkSid && credentialSid && (
        <div className="space-y-2 p-4 bg-muted/50 rounded-md border">
          <p className="text-sm font-medium">Using Twilio Credential</p>
                <p className="text-xs text-muted-foreground">
            Username and password will be automatically fetched from the selected Twilio credential and used to configure the LiveKit outbound trunk.
                </p>
              </div>
      )}

      {/* Show username and password fields when Twilio trunk is selected but no credential selected yet (editing scenario) */}
      {/* Only show if credentialMode is "create" - if "existing", user should select a credential */}
      {livekitCredentialMode === "create" && twilioTrunkSid && !credentialSid && (
        <>
          <form.Field
            name="authUsername"
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate if "create" mode is selected
                if (currentMode === "create") {
                  const stringValue = String(value || "");
                  if (!stringValue || stringValue.trim() === "") return "Username is required";
                }
                return undefined;
              },
              onSubmit: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate on submit if "create" mode is selected
                if (currentMode === "create") {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Username is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormField
                field={field}
                name="authUsername"
                label="SIP Username"
                placeholder="Enter username or select a credential above"
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

          <form.Field
            name="authPassword"
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate if "create" mode is selected
                if (currentMode === "create") {
                  const stringValue = String(value || "");
                  if (!stringValue || stringValue.trim() === "") return "Password is required";
                }
                return undefined;
              },
              onSubmit: ({ value, fieldApi }) => {
                // Check current credential mode from form state
                const currentMode = fieldApi.form.getFieldValue("livekitCredentialMode") || "create";
                // Only validate on submit if "create" mode is selected
                if (currentMode === "create") {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Password is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  SIP Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <input
                    type={showOutboundPassword ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Enter password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOutboundPassword(!showOutboundPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showOutboundPassword ? (
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
                <p className="text-xs text-muted-foreground">
                  Select a credential from the list above to auto-fill the username, or enter the credentials manually.
                </p>
              </div>
            )}
          </form.Field>
        </>
      )}
    </div>
  );
}

