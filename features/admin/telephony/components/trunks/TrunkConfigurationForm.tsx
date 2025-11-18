"use client";

import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, FormField } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const normalizeNumberList = (input: unknown): string[] => {
  const source = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(/\r?\n/)
    : [];
  return source
    .map((item) => formatPhoneNumber(String(item).trim()))
    .filter((item) => item.length > 0 && e164Pattern.test(item));
};

const normalizeAddressList = (input: unknown): string[] => {
  const source = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(/\r?\n/)
    : [];
  return source
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
};

interface TrunkConfigurationFormProps {
  form: ReturnType<typeof useForm<TrunkFormValues>>;
  isLoading?: boolean;
  showTitle?: boolean;
}

export function TrunkConfigurationForm({
  form,
  isLoading = false,
  showTitle = true,
}: TrunkConfigurationFormProps) {
  const trunkType = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.type);
  const [outboundNumberInput, setOutboundNumberInput] = useState("");
  const [inboundNumberInput, setInboundNumberInput] = useState("");
  const [allowedNumberInput, setAllowedNumberInput] = useState("");
  const [allowedAddressInput, setAllowedAddressInput] = useState("");
  const [showOutboundPassword, setShowOutboundPassword] = useState(false);
  const [showInboundPassword, setShowInboundPassword] = useState(false);
  const [showTwilioPassword, setShowTwilioPassword] = useState(false);
  const [credentialListOpen, setCredentialListOpen] = useState(false);

  const outboundNumberMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.outboundNumberMode);
  const inboundNumberMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.inboundNumberMode);
  const restrictAllowedNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.restrictAllowedNumbers);
  const credentialMode = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.credentialMode);
  
  // TODO: Fetch credential lists from API
  // For now, using empty array - can be populated with API call later
  // Example: const { data: credentialLists } = useTwilioCredentialLists();
  const credentialLists: Array<{ sid: string; friendlyName: string }> = [];
  const selectedCredentialListSid = useStore(form.store, (state: { values: TrunkFormValues }) => state.values.credentialListSid);
  const outboundNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const nums = state.values.outboundNumbers;
    return Array.isArray(nums) ? nums : [];
  });
  const inboundNumbers = useStore(form.store, (state: { values: TrunkFormValues }) => {
    const nums = state.values.inboundNumbers;
    return Array.isArray(nums) ? nums : [];
  });

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

  const handleAddInboundNumber = () => {
    const formatted = formatPhoneNumber(inboundNumberInput);
    if (formatted && e164Pattern.test(formatted)) {
      const currentNumbers = form.getFieldValue("inboundNumbers");
      const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
      if (!numsArray.includes(formatted)) {
        form.setFieldValue("inboundNumbers", [...numsArray, formatted]);
        setInboundNumberInput("");
      }
    }
  };

  const handleRemoveInboundNumber = (numberToRemove: string) => {
    const currentNumbers = form.getFieldValue("inboundNumbers");
    const numsArray = Array.isArray(currentNumbers) ? currentNumbers : [];
    form.setFieldValue("inboundNumbers", numsArray.filter((n: string) => n !== numberToRemove));
  };

  // LiveKit Outbound Configuration
  if (trunkType === "livekit_outbound") {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div>
            <h3 className="text-lg font-semibold mb-1">LiveKit Outbound Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure SIP credentials and phone numbers for outbound calls.
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
      </div>
    );
  }

  // LiveKit Inbound Configuration
  if (trunkType === "livekit_inbound") {
    return (
      <div className="space-y-4">
        {showTitle && (
          <div>
            <h3 className="text-lg font-semibold mb-1">LiveKit Inbound Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure phone numbers and security settings for inbound calls.
            </p>
          </div>
        )}

        <form.Field
          name="inboundNumberMode"
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
                    form.setFieldValue("inboundNumbers", []);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="inbound-numberMode-any" />
                  <Label htmlFor="inbound-numberMode-any" className="font-normal cursor-pointer">
                    Accept Any Number (Recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="inbound-numberMode-specific" />
                  <Label htmlFor="inbound-numberMode-specific" className="font-normal cursor-pointer">
                    Specific Numbers
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </form.Field>

        {inboundNumberMode === "specific" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="tel"
                value={inboundNumberInput}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setInboundNumberInput(formatted);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddInboundNumber();
                  }
                }}
                placeholder="+14155551234"
                className="flex-1"
              />
              <button
                type="button"
                onClick={handleAddInboundNumber}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                disabled={!inboundNumberInput || !e164Pattern.test(formatPhoneNumber(inboundNumberInput))}
              >
                Add
              </button>
            </div>
            {inboundNumbers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {inboundNumbers.map((number) => (
                  <div
                    key={number}
                    className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-sm"
                  >
                    <span className="font-mono">{number}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInboundNumber(number)}
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

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="restrictAllowedNumbers"
              checked={restrictAllowedNumbers}
              onCheckedChange={(checked) => {
                form.setFieldValue("restrictAllowedNumbers", Boolean(checked));
                if (!checked) {
                  setAllowedNumberInput("");
                  form.setFieldValue("allowedNumbers", []);
                }
              }}
            />
            <Label htmlFor="restrictAllowedNumbers" className="text-sm font-medium cursor-pointer">
              Restrict caller numbers
            </Label>
          </div>
          {restrictAllowedNumbers && (
            <Textarea
              placeholder="+14155551234\n+15551234567"
              value={allowedNumberInput}
              onChange={(e) => {
                setAllowedNumberInput(e.target.value);
                form.setFieldValue("allowedNumbers", normalizeNumberList(e.target.value));
              }}
              className="min-h-[80px]"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Allowed IP Addresses (Optional)</Label>
          <Textarea
            placeholder="192.168.1.1\n192.168.1.2"
            value={allowedAddressInput}
            onChange={(e) => {
              setAllowedAddressInput(e.target.value);
              form.setFieldValue("allowedAddresses", normalizeAddressList(e.target.value));
            }}
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            Enter one IP address per line. Leave empty to accept calls from any IP.
          </p>
        </div>

        <form.Field name="inboundAuthUsername">
          {(field) => (
            <FormField
              field={field}
              name="inboundAuthUsername"
              label="Auth Username (Optional)"
              placeholder="inbound-user"
              disabled={isLoading}
            />
          )}
        </form.Field>

        <form.Field name="inboundAuthPassword">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Auth Password (Optional)</Label>
              <div className="relative">
                <input
                  type={showInboundPassword ? "text" : "password"}
                  value={String(field.state.value || "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm pr-10"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowInboundPassword(!showInboundPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showInboundPassword ? (
                    <span className="text-xs text-muted-foreground">Hide</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Show</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="krispEnabled">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="krispEnabled"
                checked={Boolean(field.state.value)}
                onCheckedChange={(checked) => field.handleChange(checked)}
                disabled={isLoading}
              />
              <Label htmlFor="krispEnabled" className="text-sm font-medium cursor-pointer">
                Enable Krisp (Noise Cancellation)
              </Label>
            </div>
          )}
        </form.Field>
      </div>
    );
  }

  // Twilio Configuration
  if (trunkType === "twilio") {
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="credential-mode-existing" />
                  <Label htmlFor="credential-mode-existing" className="font-normal cursor-pointer">
                    Use Existing Credential List
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="credential-mode-create" />
                  <Label htmlFor="credential-mode-create" className="font-normal cursor-pointer">
                    Create New Credential List
                  </Label>
                </div>
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
            {(field) => {
              const selectedCredential = credentialLists.find(
                (cl) => cl.sid === String(field.state.value || "")
              );
              
              return (
                <div className="space-y-2">
                  <label htmlFor="credentialListSid" className="text-sm font-medium">
                    Credential List <span className="text-destructive">*</span>
                  </label>
                  <Popover open={credentialListOpen} onOpenChange={setCredentialListOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={credentialListOpen}
                        className="w-full justify-between"
                        disabled={isLoading}
                        id="credentialListSid"
                      >
                        {selectedCredential
                          ? selectedCredential.friendlyName
                          : "Select credential list..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search credential lists..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>
                            {credentialLists.length === 0
                              ? "No credential lists found. Create one in Twilio Console first."
                              : "No credential lists found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {credentialLists.map((credentialList) => (
                              <CommandItem
                                key={credentialList.sid}
                                value={`${credentialList.sid} ${credentialList.friendlyName}`}
                                onSelect={() => {
                                  const isSelected = String(field.state.value || "") === credentialList.sid;
                                  field.handleChange(isSelected ? "" : credentialList.sid);
                                  setCredentialListOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    String(field.state.value || "") === credentialList.sid
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{credentialList.friendlyName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {credentialList.sid}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {!field.state.meta.isValid && (
                    <p className="text-sm text-destructive" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Select an existing Twilio SIP credential list to use with this trunk.
                  </p>
                </div>
              );
            }}
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
    );
  }

  // Custom trunk - no additional configuration needed
  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold mb-1">Custom Trunk Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Custom trunks don&apos;t require additional configuration. You can configure them later.
          </p>
        </div>
      )}
    </div>
  );
}

