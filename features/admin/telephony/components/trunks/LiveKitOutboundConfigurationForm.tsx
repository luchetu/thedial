"use client";

import { useState, useEffect } from "react";
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
import { useTwilioTrunks } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import { useTwilioTrunk } from "@/features/admin/telephony/hooks/useTwilioTrunks";
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
}

export function LiveKitOutboundConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
}: LiveKitOutboundConfigurationFormProps) {
  const [outboundNumberInput, setOutboundNumberInput] = useState("");
  const [showOutboundPassword, setShowOutboundPassword] = useState(false);
  
  const outboundNumberMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.outboundNumberMode);
  const outboundNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const nums = state.values.outboundNumbers;
    return Array.isArray(nums) ? nums : [];
  });
  const twilioTrunkSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioTrunkSid);
  const credentialListSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioCredentialListSid);
  const credentialSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.twilioCredentialSid);

  // Fetch Twilio trunks
  const { data: twilioTrunks = [], isLoading: isLoadingTwilioTrunks } = useTwilioTrunks();
  
  // Fetch selected Twilio trunk details to get credential list
  const { data: selectedTwilioTrunk } = useTwilioTrunk(twilioTrunkSid || "", {
    enabled: !!twilioTrunkSid,
  });

  // Fetch credentials from the credential list
  const { data: credentials = [], isLoading: isLoadingCredentials } = useTwilioCredentials(
    credentialListSid || "",
    { enabled: !!credentialListSid }
  );

  // When Twilio trunk is selected, update credential list SID and auto-fill SIP address
  useEffect(() => {
    if (selectedTwilioTrunk) {
      if (selectedTwilioTrunk.credentialListSid) {
        form.setFieldValue("twilioCredentialListSid", selectedTwilioTrunk.credentialListSid);
      }
      // Auto-fill SIP address from Twilio trunk's termination domain
      const sipAddress = selectedTwilioTrunk.domainName || selectedTwilioTrunk.terminationSipDomain;
      if (sipAddress) {
        form.setFieldValue("address", sipAddress);
      }
      // When switching to Twilio trunk, clear LiveKit credentials (user will select Twilio credential)
      // Don't clear password here - wait until credential is selected
    }
  }, [selectedTwilioTrunk, form]);

  // When credential is selected, replace LiveKit credentials with Twilio credential
  // This also runs when credentials are loaded and a credentialSid is already set (editing scenario)
  useEffect(() => {
    if (credentialSid && credentials.length > 0) {
      const selectedCredential = credentials.find((c) => c.sid === credentialSid);
      if (selectedCredential) {
        // Always auto-fill username from Twilio credential
        form.setFieldValue("authUsername", selectedCredential.username);
        
        // Get current password from form
        const currentPwd = form.getFieldValue("authPassword");
        const currentPwdStr = typeof currentPwd === "string" && currentPwd.trim() !== "" ? currentPwd : "";
        
        // Only clear password if it's different from what we expect
        // If editing and password is already set, keep it (it might be the correct Twilio password)
        // If switching credentials, clear it so user enters the new credential's password
        const currentUsername = form.getFieldValue("authUsername");
        if (currentUsername !== selectedCredential.username && currentPwdStr) {
          // Different credential selected - clear password
          form.setFieldValue("authPassword", "");
          console.log("[LiveKitOutboundConfig] Twilio credential selected (different):", {
            credentialUsername: selectedCredential.username,
            previousUsername: currentUsername,
            message: "Different credential selected. Password cleared - user must enter new credential password.",
          });
        } else {
          console.log("[LiveKitOutboundConfig] Twilio credential selected:", {
            credentialUsername: selectedCredential.username,
            hasPassword: !!currentPwdStr,
            message: "Username auto-filled from Twilio credential.",
          });
        }
      }
    }
  }, [credentialSid, credentials, form]);

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
            Configure SIP credentials and phone numbers for outbound calls. Select a Twilio trunk to use credentials from its credential list, or enter credentials manually.
          </p>
        </div>
      )}

      {/* Twilio Trunk Selection */}
      <form.Field name="twilioTrunkSid">
        {(field) => (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Twilio Trunk <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={field.state.value ? String(field.state.value) : undefined}
              onValueChange={(value) => {
                field.handleChange(value || undefined);
                // Clear credential selection when trunk changes
                form.setFieldValue("twilioCredentialSid", undefined);
                form.setFieldValue("twilioCredentialListSid", undefined);
                // Clear username when selecting a trunk, but preserve password if it exists
                if (value) {
                  form.setFieldValue("authUsername", "");
                  // Don't clear password - preserve existing password from trunk data
                }
              }}
              disabled={isLoading || isLoadingTwilioTrunks}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Twilio trunk (optional - leave empty for manual entry)" />
              </SelectTrigger>
              <SelectContent>
                {twilioTrunks.map((trunk) => (
                  <SelectItem key={trunk.id} value={trunk.id}>
                    {trunk.friendlyName} ({trunk.domainName || trunk.terminationSipDomain})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a Twilio trunk to use credentials from its credential list, or leave empty to enter credentials manually below.
            </p>
          </div>
        )}
      </form.Field>

      {/* Credential Selection (only shown when Twilio trunk is selected) */}
      {twilioTrunkSid && credentialListSid && (
        <form.Field
          name="twilioCredentialSid"
          validators={{
            onChange: ({ value }) => {
              if (!value || String(value).trim() === "") {
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
                Select a credential from the Twilio trunk&apos;s credential list. The username will be auto-filled, but you&apos;ll need to enter the password below (Twilio API doesn&apos;t return passwords for security).
              </p>
            </div>
          )}
        </form.Field>
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

      {/* Manual Credential Entry (only shown when no Twilio trunk is selected) */}
      {!twilioTrunkSid && (
        <>
          <form.Field
            name="authUsername"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Username is required";
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
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Password is required";
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

      {/* Credential Entry when Twilio trunk is selected (username auto-filled, password required) */}
      {twilioTrunkSid && credentialSid && (
        <>
          <form.Field name="authUsername">
            {(field) => (
              <FormField
                field={field}
                name="authUsername"
                label="SIP Username (from selected credential)"
                placeholder="Auto-filled from selected credential"
                required
                disabled={true}
                error={undefined}
              />
            )}
          </form.Field>

          <form.Field
            name="authPassword"
            validators={{
              onBlur: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Password is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  SIP Password (from selected credential) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <input
                    type={showOutboundPassword ? "text" : "password"}
                    value={String(field.state.value || "")}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                    placeholder="Enter password for the selected credential"
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
                  Enter the password for the selected credential. These are the same credentials stored in the Twilio credential list - LiveKit will use them to authenticate with Twilio when making outbound calls. Twilio API doesn&apos;t return passwords for security reasons, so you need to enter it manually.
                </p>
              </div>
            )}
          </form.Field>
        </>
      )}

      {/* Show username and password fields when Twilio trunk is selected but no credential selected yet (editing scenario) */}
      {twilioTrunkSid && !credentialSid && (
        <>
          <form.Field
            name="authUsername"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Username is required";
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
              onBlur: ({ value }) => {
                const stringValue = String(value || "");
                if (!stringValue || stringValue.trim() === "") return "Password is required";
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

