"use client";

import { useMemo, useState } from "react";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/features/admin/telephony/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { countryCodes } from "@/lib/constants/countryCodes";
import { JsonEditor } from "@/components/ui/json-editor";
import { useRoutingProfiles } from "@/features/admin/telephony/hooks/useRoutingProfiles";

const envDefaultRoutingTemplateId =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_DEFAULT_ROUTING_PROFILE_TEMPLATE_ID ?? ""
    : "";

interface PlanFormValues extends Record<string, unknown> {
  code: string;
  name: string;
  billingProductId: string;
  monthlyPrice: string;
  perNumberMonthlyPrice: string;
  includedRealtimeMinutes: string;
  includedTranscriptionMinutes: string;
  includedPstnMinutes: string;
  includedAiMinutes: string;
  includedPhoneNumbers: string;
  allowedCountries: string[];
  defaultRoutingProfileTemplateId: string;
  defaultRecordingPolicy: string;
  complianceFeatures: string;
  metadata: string;
}

export interface PlanFormSubmission {
  code: string;
  name?: string;
  billingProductId?: string;
  monthlyPriceCents?: number;
  perNumberMonthlyPriceCents?: number;
  includedRealtimeMinutes?: number;
  includedTranscriptionMinutes?: number;
  includedPstnMinutes?: number;
  includedAiMinutes?: number;
  includedPhoneNumbers?: number;
  allowedCountries: string[];
  defaultRoutingProfileTemplateId?: string;
  defaultRecordingPolicy?: Record<string, unknown>;
  complianceFeatures?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface PlanFormProps {
  plan?: Plan | null;
  onSubmit: (payload: PlanFormSubmission) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const formatCentsToDollars = (cents?: number) => {
  if (typeof cents !== "number") return "";
  return (cents / 100).toFixed(2);
};

const normalizeString = (value: unknown) => {
  const stringValue = typeof value === "string" ? value : "";
  const trimmed = stringValue.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseCurrencyToCents = (value: string, fieldLabel: string) => {
  if (!value || value.trim() === "") return undefined;
  const normalized = value.replace(/,/g, "");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) {
    throw new Error(`${fieldLabel} must be a valid number`);
  }
  if (amount < 0) {
    throw new Error(`${fieldLabel} cannot be negative`);
  }
  return Math.round(amount * 100);
};

const parseInteger = (value: string, fieldLabel: string) => {
  if (!value || value.trim() === "") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldLabel} must be a valid number`);
  }
  if (parsed < 0) {
    throw new Error(`${fieldLabel} cannot be negative`);
  }
  return parsed;
};

const parseJsonObject = (value: string, fieldLabel: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error(`${fieldLabel} must be a JSON object`);
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message.includes(fieldLabel) ? message : `${fieldLabel} must be valid JSON`);
  }
};

const jsonValidator = ({ value }: { value: unknown }) => {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  try {
    JSON.parse(text);
    return undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return message;
  }
};

const splitCountries = (value: string) => {
  return value
    .split(/[\n,]+/)
    .map((country) => country.trim().toUpperCase())
    .filter((country) => country.length > 0);
};

const countryEmoji = (code: string) => {
  if (!code || code.length !== 2) return "";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((char) => base + char.charCodeAt(0) - 65)
  );
};

export const PlanForm = ({ plan, onSubmit, isLoading = false, submitLabel = "Create plan" }: PlanFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: routingProfilesData = [], isLoading: isRoutingProfilesLoading } = useRoutingProfiles();

  const routingProfileTemplates = useMemo(() => {
    return [...routingProfilesData].sort((a, b) => {
      // Sort by country/region first, then by name
      const countryA = a.country ?? a.region ?? "";
      const countryB = b.country ?? b.region ?? "";
      const countryCompare = countryA.localeCompare(countryB);
      if (countryCompare !== 0) return countryCompare;
      const nameA = a.name ?? "";
      const nameB = b.name ?? "";
      return nameA.localeCompare(nameB);
    });
  }, [routingProfilesData]);

  const showTemplatePicker = !isRoutingProfilesLoading && routingProfileTemplates.length > 0;
  const TEMPLATE_NONE_VALUE = "__no_template__";

  const form = useForm<PlanFormValues>({
    defaultValues: {
      code: plan?.code ?? "",
      name: plan?.name ?? "",
      billingProductId: plan?.billingProductId ?? "",
      monthlyPrice: formatCentsToDollars(plan?.monthlyPriceCents),
      perNumberMonthlyPrice: formatCentsToDollars(plan?.perNumberMonthlyPriceCents),
      includedRealtimeMinutes: plan ? String(plan.includedRealtimeMinutes ?? 0) : "",
      includedTranscriptionMinutes: plan ? String(plan.includedTranscriptionMinutes ?? 0) : "",
      includedPstnMinutes: plan ? String(plan.includedPstnMinutes ?? 0) : "",
      includedAiMinutes: plan ? String(plan.includedAiMinutes ?? 0) : "",
      includedPhoneNumbers: plan ? String(plan.includedPhoneNumbers ?? 0) : "",
      allowedCountries: plan?.allowedCountries ?? [],
      defaultRoutingProfileTemplateId:
        plan?.defaultRoutingProfileTemplateId ?? envDefaultRoutingTemplateId,
      defaultRecordingPolicy: plan?.defaultRecordingPolicy
        ? JSON.stringify(plan.defaultRecordingPolicy, null, 2)
        : "",
      complianceFeatures: plan?.complianceFeatures
        ? JSON.stringify(plan.complianceFeatures, null, 2)
        : "",
      metadata: plan?.metadata ? JSON.stringify(plan.metadata, null, 2) : "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const payload: PlanFormSubmission = {
          code: values.code.trim(),
          name: normalizeString(values.name),
          billingProductId: normalizeString(values.billingProductId),
          monthlyPriceCents: parseCurrencyToCents(values.monthlyPrice, "Monthly price"),
          perNumberMonthlyPriceCents: parseCurrencyToCents(
            values.perNumberMonthlyPrice,
            "Per-number price"
          ),
          includedRealtimeMinutes: parseInteger(values.includedRealtimeMinutes, "Realtime minutes"),
          includedTranscriptionMinutes: parseInteger(
            values.includedTranscriptionMinutes,
            "Transcription minutes"
          ),
          includedPstnMinutes: parseInteger(values.includedPstnMinutes, "PSTN minutes"),
          includedAiMinutes: parseInteger(values.includedAiMinutes, "AI minutes"),
          includedPhoneNumbers: parseInteger(values.includedPhoneNumbers, "Included phone numbers"),
          allowedCountries: Array.isArray(values.allowedCountries)
            ? values.allowedCountries
            : splitCountries(String(values.allowedCountries || "")),
          defaultRoutingProfileTemplateId: normalizeString(values.defaultRoutingProfileTemplateId),
          defaultRecordingPolicy: parseJsonObject(
            values.defaultRecordingPolicy,
            "Default recording policy"
          ),
          complianceFeatures: parseJsonObject(values.complianceFeatures, "Compliance features"),
          metadata: parseJsonObject(values.metadata, "Metadata"),
        };

        if (!payload.code) {
          throw new Error("Plan code is required");
        }

        await onSubmit(payload);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Failed to submit form");
        throw err;
      }
    },
  });

  return (
    <Form<PlanFormValues> onSubmit={form.handleSubmit}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="code"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "").trim();
                if (!stringValue) return "Plan code is required";
                if (!/^[A-Z0-9_-]+$/.test(stringValue)) {
                  return "Use uppercase letters, numbers, underscores, or dashes";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="code">Plan code</Label>
                <Input
                  id="code"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                  onBlur={field.handleBlur}
                  placeholder="RING_US_BASIC"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Stable identifier used in routing profiles and billing.
                </p>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="US Basic Plan"
                />
                <p className="text-xs text-muted-foreground">
                  Optional label shown to admins.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="billingProductId">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="billingProductId">Billing product ID</Label>
                <Input
                  id="billingProductId"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="prod_123 or polar_prod_abc"
                />
                <p className="text-xs text-muted-foreground">
                  Optional link to your billing provider (Stripe, Polar, etc.).
                </p>
              </div>
            )}
          </form.Field>

          <form.Field
            name="monthlyPrice"
            validators={{
              onChange: ({ value }) => {
                const stringValue = String(value || "").trim();
                if (!stringValue) return "Monthly price is required";
                return Number.isNaN(Number.parseFloat(stringValue))
                  ? "Enter a valid dollar amount"
                  : undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly price (USD)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="199.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Converted to cents automatically when saving.
                </p>
                {!field.state.meta.isValid && (
                  <p className="text-sm text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="perNumberMonthlyPrice">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="perNumberMonthlyPrice">Per-number monthly price (USD)</Label>
                <Input
                  id="perNumberMonthlyPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="5.00"
                />
                <p className="text-xs text-muted-foreground">
                  Optional surcharge for each assigned phone number.
                </p>
              </div>
            )}
          </form.Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="includedRealtimeMinutes">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="includedRealtimeMinutes">Realtime minutes</Label>
                <Input
                  id="includedRealtimeMinutes"
                  inputMode="numeric"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="2000"
                />
                <p className="text-xs text-muted-foreground">
                  Minutes of realtime audio/video included monthly.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="includedTranscriptionMinutes">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="includedTranscriptionMinutes">Transcription minutes</Label>
                <Input
                  id="includedTranscriptionMinutes"
                  inputMode="numeric"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="1000"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="includedPstnMinutes">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="includedPstnMinutes">PSTN minutes</Label>
                <Input
                  id="includedPstnMinutes"
                  inputMode="numeric"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="500"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="includedAiMinutes">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="includedAiMinutes">AI minutes</Label>
                <Input
                  id="includedAiMinutes"
                  inputMode="numeric"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="200"
                />
                <p className="text-xs text-muted-foreground">
                  Minutes available for AI summaries, chat, and other analysis.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="includedPhoneNumbers">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="includedPhoneNumbers">Included phone numbers</Label>
                <Input
                  id="includedPhoneNumbers"
                  inputMode="numeric"
                  min="0"
                  value={String(field.state.value ?? "")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="10"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-4">
          <form.Field name="allowedCountries">
            {(field) => {
              const selected = Array.isArray(field.state.value)
                ? (field.state.value as string[])
                : String(field.state.value || "")
                    .split(/[,\s]+/)
                    .filter(Boolean);

              const addCountry = (code: string) => {
                if (!selected.includes(code)) {
                  field.handleChange([...selected, code]);
                }
              };

              const removeCountry = (code: string) => {
                field.handleChange(selected.filter((item) => item !== code));
              };

              return (
                <div className="space-y-2">
                  <Label>Allowed countries</Label>
                  <div className="flex flex-wrap gap-2">
                    {selected.map((code) => {
                      const country = countryCodes.find((item) => item.code === code);
                      return (
                        <Badge
                          key={code}
                          variant="secondary"
                          className="flex items-center gap-1"
                          title={country?.phoneCode ? `${country.phoneCode}` : undefined}
                        >
                          <span>{country?.flag ?? countryEmoji(code)}</span>
                          {code}
                          <button
                            type="button"
                            className="ml-1 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => removeCountry(code)}
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                    {selected.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No restriction (plan available globally).
                      </p>
                    )}
                  </div>

                  <Command className="border rounded-md">
                    <CommandInput placeholder="Search country…" />
                    <CommandList>
                      <CommandEmpty>No match.</CommandEmpty>
                      <CommandGroup>
                        {countryCodes.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={country.code}
                            disabled={selected.includes(country.code)}
                            onSelect={(value) => addCountry(value.toUpperCase())}
                          >
                            <span className="mr-2">{country.flag ?? countryEmoji(country.code)}</span>
                            <span className="font-medium">{country.code}</span>
                            <span className="ml-2">{country.name}</span>
                            {country.phoneCode && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {country.phoneCode}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>

                  <p className="text-xs text-muted-foreground">
                    Pick ISO-2 country codes. Leave empty to allow every country.
                  </p>
                </div>
              );
            }}
          </form.Field>

          {showTemplatePicker && (
            <form.Field name="defaultRoutingProfileTemplateId">
              {(field) => {
                const currentValue = String(field.state.value ?? "");
                const hasMatchingTemplate = routingProfileTemplates.some(
                  (profile) => profile.id === currentValue
                );
                const selectValue = hasMatchingTemplate ? currentValue : TEMPLATE_NONE_VALUE;
                const selectedProfile = hasMatchingTemplate
                  ? routingProfileTemplates.find((profile) => profile.id === currentValue)
                  : undefined;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="defaultRoutingProfileTemplateId">
                        Default routing profile template
                      </Label>
                      {currentValue && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto px-1 text-xs text-muted-foreground"
                          onClick={() => field.handleChange("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Select
                      value={selectValue}
                      onValueChange={(value) =>
                        field.handleChange(value === TEMPLATE_NONE_VALUE ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select routing profile template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TEMPLATE_NONE_VALUE}>No default template</SelectItem>
                        {routingProfileTemplates.map((profile) => {
                          const displayName = profile.name?.trim() || "Untitled";
                          const location = profile.region || profile.country || "—";
                          return (
                            <SelectItem key={profile.id} value={profile.id}>
                              {`${displayName} · ${location}`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedProfile ? (
                      <p className="text-xs text-muted-foreground">
                        New tenants on this plan start with the {selectedProfile.name || "unnamed"} profile
                        ({selectedProfile.region || selectedProfile.country || "—"}).
                      </p>
                    ) : currentValue && !hasMatchingTemplate ? (
                      <p className="text-xs text-destructive" role="alert">
                        The previously selected template is no longer available. Choose a new template or
                        clear this setting.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Choose an existing routing profile to clone automatically when provisioning new tenants
                        for this plan.
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          )}
        </div>

        <div className="space-y-6 border-t pt-6">
          <div className="space-y-2">
            <Label>Default recording policy (JSON)</Label>
            <form.Field name="defaultRecordingPolicy" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"record":true}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Optional JSON object controlling how calls are recorded for this plan.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Compliance features (JSON)</Label>
            <form.Field name="complianceFeatures" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"recordingConsent":"dual"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Define required compliance metadata (e.g., consent rules) for this plan.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Metadata (JSON)</Label>
            <form.Field name="metadata" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"notes":"Introductory offer"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Optional free-form metadata stored with the plan.
            </p>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-end">
          <FormSubmitButton loading={isLoading} variant="secondary">{submitLabel}</FormSubmitButton>
        </div>
      </div>
    </Form>
  );
};
