"use client";

import { useEffect, useState } from "react";
import { useStore } from "@tanstack/react-form";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { CreateInboundTrunkRequest } from "@/features/admin/telephony/types";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InboundTrunkFormValues extends Record<string, unknown> {
  name: string;
  numberMode: "any" | "specific"; // "any" = [], "specific" = array of numbers
  numbers: string[]; // Only used when numberMode is "specific"
  allowedNumbers?: string[];
  allowedAddresses?: string[];
  krispEnabled?: boolean;
  authUsername?: string;
  authPassword?: string;
  metadata?: string;
  status?: string;
}

interface InboundTrunkFormProps {
  defaultValues?: Partial<InboundTrunkFormValues>;
  onSubmit: (values: CreateInboundTrunkRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

// E.164 format: +[country code][number] (e.g., +14155551234, +442071234567)
const e164Pattern = /^\+[1-9]\d{1,14}$/;

export const InboundTrunkForm = ({
  defaultValues = {
    name: "",
    numberMode: "any",
    numbers: [],
    allowedNumbers: [],
    allowedAddresses: [],
    krispEnabled: false,
    authUsername: "",
    metadata: "",
    status: "active",
  },
  onSubmit,
  isLoading = false,
  submitLabel = "Create Inbound Trunk",
}: InboundTrunkFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [numberInput, setNumberInput] = useState("");
  const [allowedNumberInput, setAllowedNumberInput] = useState(() =>
    Array.isArray(defaultValues?.allowedNumbers) ? defaultValues.allowedNumbers.join("\n") : ""
  );
  const [numberMode, setNumberMode] = useState<"any" | "specific">(
    (defaultValues?.numberMode as "any" | "specific") || "any"
  );
  const [restrictAllowedNumbers, setRestrictAllowedNumbers] = useState(
    (defaultValues?.allowedNumbers?.length ?? 0) > 0
  );
  const [metadataInput, setMetadataInput] = useState(
    typeof defaultValues?.metadata === "string" ? defaultValues.metadata : ""
  );

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, "");
    // Ensure it starts with +
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
      .filter((item) => item.length > 0);
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

  const form = useForm<InboundTrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      numberMode: defaultValues?.numberMode || "any",
      numbers: defaultValues?.numbers || [],
      allowedNumbers: defaultValues?.allowedNumbers || [],
      allowedAddresses: defaultValues?.allowedAddresses || [],
      krispEnabled: defaultValues?.krispEnabled || false,
      authUsername: defaultValues?.authUsername ?? "",
      authPassword: undefined,
      metadata: typeof defaultValues?.metadata === "string" ? defaultValues.metadata : "",
      status: defaultValues?.status || "active",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const allowedNumberList = restrictAllowedNumbers ? normalizeNumberList(allowedNumberInput) : [];
        const allowedAddressList = normalizeAddressList(values.allowedAddresses);

        const statusValue = typeof values.status === "string" && values.status.trim() !== ""
          ? values.status.trim().toLowerCase()
          : "active";

        let metadata: Record<string, string> | undefined;
        const metadataRaw = typeof values.metadata === "string" ? values.metadata.trim() : metadataInput.trim();
        if (metadataRaw) {
          try {
            const parsed = JSON.parse(metadataRaw) as Record<string, unknown>;
            if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
              throw new Error("Metadata must be a JSON object");
            }
            metadata = Object.entries(parsed).reduce<Record<string, string>>((acc, [key, val]) => {
              const trimmedKey = String(key).trim();
              if (trimmedKey.length === 0) {
                return acc;
              }
              acc[trimmedKey] = String(val);
              return acc;
            }, {});
            if (metadata && Object.keys(metadata).length === 0) {
              metadata = undefined;
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Invalid metadata";
            setSubmitError(message);
            return;
          }
        }

        const authUsername = typeof values.authUsername === "string" ? values.authUsername.trim() : "";
        const authPassword = typeof values.authPassword === "string" ? values.authPassword.trim() : "";

        const trunkNumbers = values.numberMode === "any" ? [] : values.numbers || [];

        const hasAuth = authUsername !== "" && authPassword !== "";
        const hasCallerRestriction = restrictAllowedNumbers && allowedNumberList.length > 0;
        const hasAddressRestriction = allowedAddressList.length > 0;

        if (trunkNumbers.length === 0 && !hasAuth && !hasCallerRestriction && !hasAddressRestriction) {
          setSubmitError(
            "Provide SIP auth credentials or restrict allowed numbers or IP addresses to satisfy LiveKit security requirements."
          );
          return;
        }

        const request: CreateInboundTrunkRequest = {
          name: values.name,
          numbers: trunkNumbers,
          allowedNumbers: restrictAllowedNumbers ? allowedNumberList : [],
          allowedAddresses: allowedAddressList,
          authUsername: authUsername !== "" ? authUsername : undefined,
          authPassword: authPassword !== "" ? authPassword : undefined,
          krispEnabled: Boolean(values.krispEnabled),
          metadata,
          status: statusValue,
        };

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

  useEffect(() => {
    if (!restrictAllowedNumbers) {
      setAllowedNumberInput("");
      form.setFieldValue("allowedNumbers", []);
    }
  }, [restrictAllowedNumbers, form]);

  return (
    <Form<InboundTrunkFormValues> onSubmit={form.handleSubmit}>
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
              placeholder="e.g., Production Inbound"
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
                      Accept Any Number (Recommended for scale)
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

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-blue-900">
                    {numberMode === "any"
                      ? "Accept Any Number (Recommended)"
                      : "Specific Numbers"}
                  </p>
                  <p className="text-blue-700">
                    {numberMode === "any"
                      ? "This trunk will accept calls to any phone number. Recommended for production as it scales to millions of numbers without managing individual numbers."
                      : "This trunk will only accept calls to the specified numbers. Use for testing or when you need to restrict which numbers can receive calls."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allowed Numbers (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="restrictAllowedNumbers"
              checked={restrictAllowedNumbers}
              onCheckedChange={(checked) => setRestrictAllowedNumbers(Boolean(checked))}
            />
            <Label htmlFor="restrictAllowedNumbers" className="text-sm font-medium cursor-pointer">
              Restrict caller numbers
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {restrictAllowedNumbers
              ? "Enter one allowed caller number per line. Leave disabled to accept calls from any number."
              : "Calls from any phone number will be accepted."}
          </p>
          {restrictAllowedNumbers && (
            <Textarea
              placeholder="+14155551234\n+15551234567"
              value={allowedNumberInput}
              onChange={(e) => {
                const raw = e.target.value;
                setAllowedNumberInput(raw);
                form.setFieldValue("allowedNumbers", normalizeNumberList(raw));
              }}
              className="min-h-[80px]"
            />
          )}
        </div>

        {/* Allowed Addresses (Optional) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Allowed IP Addresses (Optional)</Label>
          <p className="text-xs text-muted-foreground">
            Restrict which IP addresses can send calls to this trunk. Leave empty to accept calls from any IP.
          </p>
          <form.Field name="allowedAddresses">
            {(field) => (
              <Textarea
                placeholder="192.168.1.1\n192.168.1.2"
                value={Array.isArray(field.state.value) ? field.state.value.join("\n") : String(field.state.value || "")}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value
                      .split(/[\n\r]+/)
                      .map((line) => line.trim())
                      .filter((line) => line.length > 0)
                  )
                }
                className="min-h-[80px]"
              />
            )}
          </form.Field>
          <p className="text-xs text-muted-foreground">
            Enter one IP address per line.
          </p>
        </div>

        {/* Authentication */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Authentication</h3>
          <form.Field name="authUsername">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="authUsername">
                  Auth Username
                </Label>
                <Input
                  id="authUsername"
                  value={String(field.state.value || "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., inbound-user"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to disable SIP authentication.
                </p>
              </div>
            )}
          </form.Field>
          <form.Field name="authPassword">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="authPassword">
                  Auth Password
                </Label>
                <Input
                  id="authPassword"
                  type="password"
                  value={String(field.state.value || "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••"
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  Provide to set or rotate the SIP password. Leave blank to keep existing.
                </p>
              </div>
            )}
          </form.Field>
        </div>

        {/* Status */}
        <form.Field name="status">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={String(field.state.value || "active")}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        {/* Metadata */}
        <div className="space-y-2 border-t pt-4">
          <Label className="text-sm font-medium">Metadata (JSON, optional)</Label>
          <Textarea
            value={metadataInput}
            onChange={(e) => {
              const value = e.target.value;
              setMetadataInput(value);
              form.setFieldValue("metadata", value);
            }}
            placeholder='{{"queue":"support"}}'
            className="min-h-[100px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Provide a JSON object to attach metadata to inbound calls (e.g., additional routing context).
          </p>
        </div>

        {/* Krisp Enabled */}
        <form.Field name="krispEnabled">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={String(field.name)}
                checked={Boolean(field.state.value)}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <Label htmlFor={String(field.name)} className="text-sm font-medium cursor-pointer">
                Enable Krisp (Noise Cancellation)
              </Label>
            </div>
          )}
        </form.Field>

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

