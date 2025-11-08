"use client";

import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
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
import type {
  CreateOutboundTrunkRequest,
  CreateTwilioTrunkRequest,
  TwilioCredentialListMode,
} from "@/features/admin/telephony/types";

interface OutboundTrunkFormValues extends Record<string, unknown> {
  name: string;
  numberMode: "any" | "specific"; // "any" = ["*"], "specific" = array of numbers
  numbers: string[]; // Only used when numberMode is "specific"
  trunkSelectionMode: "existing" | "create" | "direct"; // How to connect to Twilio
  twilioTrunkId?: string; // Use existing Twilio trunk
  createTwilioTrunk?: {
    friendlyName: string;
    terminationSipDomain: string;
    credentialListMode: TwilioCredentialListMode;
    credentialListSid?: string;
    credentialListName?: string;
    username?: string;
    password?: string;
  }; // Create new Twilio trunk
  directSIPDomain?: string; // Direct credentials (legacy)
  directUsername?: string;
  directPassword?: string;
}

interface OutboundTrunkFormProps {
  defaultValues?: Partial<OutboundTrunkFormValues>;
  onSubmit: (values: CreateOutboundTrunkRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  availableTwilioTrunks?: Array<{ id: string; friendlyName: string }>; // For selecting existing trunks
}

// E.164 format: +[country code][number] (e.g., +14155551234, +442071234567)
const e164Pattern = /^\+[1-9]\d{1,14}$/;

export const OutboundTrunkForm = ({
  defaultValues = {
    name: "",
    numberMode: "any",
    numbers: [],
    trunkSelectionMode: "existing",
    twilioTrunkId: "",
    directSIPDomain: "",
    directUsername: "",
    directPassword: "",
    createTwilioTrunk: {
      friendlyName: "",
      terminationSipDomain: "",
      credentialListMode: "create",
      credentialListSid: "",
      credentialListName: "",
      username: "",
      password: "",
    },
  },
  onSubmit,
  isLoading = false,
  submitLabel = "Create Outbound Trunk",
  availableTwilioTrunks = [],
}: OutboundTrunkFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [numberInput, setNumberInput] = useState("");
  const [numberMode, setNumberMode] = useState<"any" | "specific">(
    (defaultValues?.numberMode as "any" | "specific") || "any"
  );
  const [trunkSelectionMode, setTrunkSelectionMode] = useState<"existing" | "create" | "direct">(
    (defaultValues?.trunkSelectionMode as "existing" | "create" | "direct") || "existing"
  );
  const [showCreateTwilioPassword, setShowCreateTwilioPassword] = useState(false);
  const [showDirectPassword, setShowDirectPassword] = useState(false);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, "");
    // Ensure it starts with +
    if (!cleaned.startsWith("+")) {
      return cleaned.length > 0 ? `+${cleaned}` : "";
    }
    return cleaned;
  };

  const form = useForm<OutboundTrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      numberMode: defaultValues?.numberMode || "any",
      numbers: defaultValues?.numbers || [],
      trunkSelectionMode: defaultValues?.trunkSelectionMode || "existing",
      twilioTrunkId: defaultValues?.twilioTrunkId || "",
      createTwilioTrunk:
        defaultValues?.createTwilioTrunk || {
          friendlyName: "",
          terminationSipDomain: "",
          credentialListMode: "create",
          credentialListSid: "",
          credentialListName: "",
          username: "",
          password: "",
        },
      directSIPDomain: defaultValues?.directSIPDomain || "",
      directUsername: defaultValues?.directUsername || "",
      directPassword: defaultValues?.directPassword || "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const mode = values.trunkSelectionMode;
        const request: CreateOutboundTrunkRequest = {
          name: values.name.trim(),
          numbers: values.numberMode === "any" ? ["*"] : values.numbers || [],
          mode,
        };

        // Handle Twilio trunk connection
        if (mode === "existing" && values.twilioTrunkId) {
          request.twilioTrunkId = values.twilioTrunkId;
        } else if (mode === "create" && values.createTwilioTrunk) {
          const createConfig = values.createTwilioTrunk;
          const twilioTrunk: CreateTwilioTrunkRequest = {
            friendlyName: createConfig.friendlyName.trim(),
            terminationSipDomain: createConfig.terminationSipDomain.trim(),
            credentialMode: createConfig.credentialListMode,
            credentialListSid:
              createConfig.credentialListMode === "existing"
                ? String(createConfig.credentialListSid || "").trim() || undefined
                : undefined,
            credentialListName:
              createConfig.credentialListMode === "create"
                ? createConfig.credentialListName?.trim() || undefined
                : undefined,
            username:
              createConfig.credentialListMode === "create"
                ? createConfig.username?.trim() || undefined
                : undefined,
            password:
              createConfig.credentialListMode === "create"
                ? createConfig.password?.trim() || undefined
                : undefined,
          };
          request.createTwilioTrunk = twilioTrunk;
        } else if (mode === "direct") {
          request.directSIPDomain = values.directSIPDomain?.trim() || undefined;
          request.directUsername = values.directUsername?.trim() || undefined;
          request.directPassword = values.directPassword?.trim() || undefined;
        }

        await onSubmit(request);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Something went wrong");
      }
    },
  });

  const numbers = useStore(form.store, (state) => {
    const nums = state.values.numbers;
    return Array.isArray(nums) ? nums : [];
  });

  const handleAddNumber = () => {
    const formatted = formatPhoneNumber(numberInput);
    if (formatted && e164Pattern.test(formatted)) {
      const currentNumbers = form.getFieldValue("numbers");
      const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
      if (!numsArray.includes(formatted)) {
        form.setFieldValue("numbers", [...numsArray, formatted]);
        setNumberInput("");
      }
    }
  };

  const handleRemoveNumber = (numberToRemove: string) => {
    const currentNumbers = form.getFieldValue("numbers");
    const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
    form.setFieldValue("numbers", numsArray.filter((n: string) => n !== numberToRemove));
  };

  return (
    <Form<OutboundTrunkFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        {/* Name */}
        <form.Field
          name="name"
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
              name="name"
              label="Trunk Name"
              placeholder="e.g., Production Outbound"
              required
              error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
            />
          )}
        </form.Field>

        {/* Numbers Configuration */}
        <div className="space-y-4">
          <form.Field
            name="numberMode"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "This field is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Numbers</Label>
                <RadioGroup
                  value={String(field.state.value || "any")}
                  onValueChange={(value) => {
                    const newMode = value as "any" | "specific";
                    field.handleChange(newMode);
                    setNumberMode(newMode);
                    if (newMode === "any") {
                      form.setFieldValue("numbers", []);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="any" id="numberMode-any" />
                    <Label htmlFor="numberMode-any" className="font-normal cursor-pointer">
                      All Numbers (Wildcard)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="numberMode-specific" />
                    <Label htmlFor="numberMode-specific" className="font-normal cursor-pointer">
                      Specific Numbers
                    </Label>
                  </div>
                </RadioGroup>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Specific Numbers Input */}
          {numberMode === "specific" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={numberInput}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    setNumberInput(formatted);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNumber();
                    }
                  }}
                  placeholder="+14155551234"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddNumber}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                  disabled={!numberInput || !e164Pattern.test(formatPhoneNumber(numberInput))}
                >
                  Add
                </button>
              </div>
              {numbers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {numbers.map((number) => (
                    <div
                      key={number}
                      className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm"
                    >
                      <span className="font-mono">{number}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNumber(number)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Enter phone numbers in E.164 format (e.g., +14155551234, +442071234567)
              </p>
            </div>
          )}
        </div>

        {/* Twilio Trunk Connection */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <h3 className="text-sm font-semibold mb-1">Twilio Trunk Connection</h3>
            <p className="text-xs text-muted-foreground">
              Choose how to connect this LiveKit trunk to Twilio.
            </p>
          </div>

          <form.Field
            name="trunkSelectionMode"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "This field is required";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Connection Method</Label>
                <RadioGroup
                  value={String(field.state.value || "existing")}
                  onValueChange={(value) => {
                    const newMode = value as "existing" | "create" | "direct";
                    field.handleChange(newMode);
                    setTrunkSelectionMode(newMode);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="trunkMode-existing" />
                    <Label htmlFor="trunkMode-existing" className="font-normal cursor-pointer">
                      Use Existing Twilio Trunk
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="create" id="trunkMode-create" />
                    <Label htmlFor="trunkMode-create" className="font-normal cursor-pointer">
                      Create New Twilio Trunk
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="trunkMode-direct" />
                    <Label htmlFor="trunkMode-direct" className="font-normal cursor-pointer">
                      Direct Credentials (Legacy)
                    </Label>
                  </div>
                </RadioGroup>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Existing Twilio Trunk Selection */}
          {trunkSelectionMode === "existing" && (
            <form.Field
              name="twilioTrunkId"
              validators={{
                onChange: ({ value }) => {
                  if (!value || String(value).trim() === "")
                    return "Please select a Twilio trunk";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Twilio Trunk
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={String(field.state.value || "")}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Twilio trunk" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTwilioTrunks.length > 0 ? (
                        availableTwilioTrunks.map((trunk) => (
                          <SelectItem key={trunk.id} value={trunk.id}>
                            {trunk.friendlyName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-trunks" disabled>
                          No Twilio trunks available
                        </SelectItem>
                      )}
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
          )}

          {/* Create New Twilio Trunk */}
          {trunkSelectionMode === "create" && (
            <div className="space-y-4 border rounded-md p-4 bg-muted/30">
              <div>
                <h4 className="text-sm font-medium mb-1">New Twilio Trunk Details</h4>
                <p className="text-xs text-muted-foreground">
                  A new Twilio Elastic SIP Trunk will be created and associated with this LiveKit trunk.
                </p>
              </div>

              <form.Field
                name="createTwilioTrunk"
                validators={{
                  onChange: ({ value }) => {
                    const trunk =
                      (value as {
                        friendlyName?: string;
                        terminationSipDomain?: string;
                        credentialListMode?: TwilioCredentialListMode;
                        credentialListSid?: string;
                      }) || {};
                    const friendlyName = trunk.friendlyName || "";
                    if (!friendlyName || friendlyName.trim() === "")
                      return "Twilio trunk name is required";
                    if (friendlyName.trim().length < 2)
                      return "Must be at least 2 characters";
                    const terminationDomain = trunk.terminationSipDomain || "";
                    if (!terminationDomain || terminationDomain.trim() === "")
                      return "Termination SIP domain is required";
                    if (!terminationDomain.includes("."))
                      return "Termination SIP domain must be a valid domain";
                    if ((trunk.credentialListMode || "create") === "existing") {
                      const sid = trunk.credentialListSid || "";
                      if (!sid || sid.trim() === "")
                        return "Credential List SID is required";
                      if (!sid.startsWith("CL"))
                        return "Credential List SID must start with 'CL'";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const trunk =
                    (field.state.value as {
                      friendlyName?: string;
                      terminationSipDomain?: string;
                      credentialListMode?: TwilioCredentialListMode;
                      credentialListSid?: string;
                      credentialListName?: string;
                      username?: string;
                      password?: string;
                    }) || {};
                  const credentialListMode = trunk.credentialListMode || "create";
                  return (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Twilio Trunk Name
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={trunk.friendlyName || ""}
                          onChange={(e) => {
                            field.handleChange({
                              ...trunk,
                              friendlyName: e.target.value,
                            });
                          }}
                          onBlur={field.handleBlur}
                          placeholder="e.g., Production Twilio Trunk"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Termination SIP Domain
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          value={trunk.terminationSipDomain || ""}
                          onChange={(e) => {
                            field.handleChange({
                              ...trunk,
                              terminationSipDomain: e.target.value,
                            });
                          }}
                          placeholder="my-trunk.pstn.twilio.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Credential Source</Label>
                        <RadioGroup
                          value={credentialListMode}
                          onValueChange={(value) => {
                            field.handleChange({
                              ...trunk,
                              credentialListMode: value as TwilioCredentialListMode,
                            });
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="existing" id="create-trunk-credential-existing" />
                            <Label
                              htmlFor="create-trunk-credential-existing"
                              className="font-normal cursor-pointer"
                            >
                              Use Existing Credential List
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="create" id="create-trunk-credential-create" />
                            <Label
                              htmlFor="create-trunk-credential-create"
                              className="font-normal cursor-pointer"
                            >
                              Create New Credential List
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {credentialListMode === "existing" ? (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Credential List SID
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={trunk.credentialListSid || ""}
                            onChange={(e) => {
                              field.handleChange({
                                ...trunk,
                                credentialListSid: e.target.value,
                              });
                            }}
                            placeholder="CLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Credential List Name (Optional)</Label>
                            <Input
                              value={trunk.credentialListName || ""}
                              onChange={(e) => {
                                field.handleChange({
                                  ...trunk,
                                  credentialListName: e.target.value,
                                });
                              }}
                              placeholder="Auto-generated if not provided"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Username (Optional)</Label>
                            <Input
                              value={trunk.username || ""}
                              onChange={(e) => {
                                field.handleChange({
                                  ...trunk,
                                  username: e.target.value,
                                });
                              }}
                              placeholder="Auto-generated if not provided"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Password (Optional)</Label>
                            <div className="relative">
                              <input
                                type={showCreateTwilioPassword ? "text" : "password"}
                                value={trunk.password || ""}
                                onChange={(e) => {
                                  field.handleChange({
                                    ...trunk,
                                    password: e.target.value,
                                  });
                                }}
                                className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                                placeholder="Auto-generated if not provided"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCreateTwilioPassword(!showCreateTwilioPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                {showCreateTwilioPassword ? (
                                  <span className="text-xs text-muted-foreground">Hide</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Show</span>
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {!field.state.meta.isValid && (
                        <p className="text-sm text-destructive" role="alert">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            </div>
          )}

          {/* Direct Credentials (Legacy) */}
          {trunkSelectionMode === "direct" && (
            <div className="space-y-4 border rounded-md p-4 bg-muted/30">
              <div>
                <h4 className="text-sm font-medium mb-1">Direct SIP Credentials</h4>
                <p className="text-xs text-muted-foreground">
                  Enter Twilio SIP trunk credentials directly. This is a legacy method.
                </p>
              </div>

              <form.Field
                name="directSIPDomain"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || "");
                    if (!stringValue || stringValue.trim() === "")
                      return "This field is required";
                    if (!stringValue.includes("."))
                      return "Must be a valid domain (e.g., abc123.pstn.twilio.com)";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <FormField
                    field={field}
                    name="directSIPDomain"
                    label="SIP Trunk Address"
                    placeholder="abc123.pstn.twilio.com"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="directUsername"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || "");
                    if (!stringValue || stringValue.trim() === "")
                      return "This field is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <FormField
                    field={field}
                    name="directUsername"
                    label="SIP Username"
                    placeholder="livekit-prod"
                    required
                    error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="directPassword"
                validators={{
                  onChange: ({ value }) => {
                    const stringValue = String(value || "");
                    if (!stringValue || stringValue.trim() === "")
                      return "This field is required";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      SIP Password
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        type={showDirectPassword ? "text" : "password"}
                        value={String(field.state.value || "")}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDirectPassword(!showDirectPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showDirectPassword ? (
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
            </div>
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
}

