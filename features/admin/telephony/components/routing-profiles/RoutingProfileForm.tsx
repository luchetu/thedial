"use client";

import { useState } from "react";
import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { JsonEditor } from "@/components/ui/json-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/lib/constants/countryCodes";
import type { RoutingProfile } from "@/features/admin/telephony/types";

// Regions have been removed from routing profiles; country is now the sole
// location selector. Plan-level routing profile mappings can still use
// regions independently of individual profiles.

// Common telephony providers
// NOTE: For The Dial, PSTN connectivity is handled via Twilio trunks that are
// attached to LiveKit outbound/inbound trunks. Routing profiles should point
// at LiveKit (or a custom provider), not directly at Twilio.
const telephonyProviders = [
  { value: "livekit", label: "LiveKit" },
  { value: "custom", label: "Custom" },
];

interface RoutingProfileFormValues extends Record<string, unknown> {
  name: string;
  planCode?: string; // Optional - for convenience mapping
  country?: string; // Make optional if region is provided
  outboundProvider: string;
  outboundTrunkRef: string;
  outboundProviderConfig: string;
  inboundProvider: string;
  inboundTrunkRef: string;
  inboundProviderConfig: string;
  dispatchProvider: string;
  dispatchRuleRef: string;
  dispatchMetadata: string;
  complianceRequirements: string;
  recordingPolicy: string;
}

export interface RoutingProfileFormSubmission {
  name: string;
  planCode?: string; // Optional - if provided, creates mapping automatically
  country?: string; // Make optional if region is provided
  outboundProvider: string;
  outboundTrunkRef?: string;
  outboundProviderConfig?: Record<string, unknown>;
  inboundProvider?: string;
  inboundTrunkRef?: string;
  inboundProviderConfig?: Record<string, unknown>;
  dispatchProvider?: string;
  dispatchRuleRef?: string;
  dispatchMetadata?: Record<string, unknown>;
  complianceRequirements?: Record<string, unknown>;
  recordingPolicy?: Record<string, unknown>;
}

interface ReferenceOption {
  id: string;
  label: string;
  description?: string;
}

interface RoutingProfileFormProps {
  profile?: RoutingProfile | null;
  onSubmit: (payload: RoutingProfileFormSubmission) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  plans?: Array<{ code: string; name?: string | null }>;
  outboundTrunks?: ReferenceOption[];
  inboundTrunks?: ReferenceOption[];
  dispatchRules?: ReferenceOption[];
}

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

const normalizeCountryCode = (raw: unknown) => {
  const text = String(raw || "").toUpperCase();
  const cleaned = text.replace(/[^A-Z]/g, "");
  if (!cleaned) return undefined;
  return cleaned.slice(0, 2);
};

const normalizeString = (value: unknown) => {
  const stringValue = typeof value === "string" ? value : "";
  const trimmed = stringValue.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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


export const RoutingProfileForm = ({
  profile,
  onSubmit,
  isLoading = false,
  submitLabel = "Create routing profile",
  plans = [],
  outboundTrunks = [],
  inboundTrunks = [],
  dispatchRules = [],
}: RoutingProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [planCodePopoverOpen, setPlanCodePopoverOpen] = useState(false);
  const [outboundTrunkPopoverOpen, setOutboundTrunkPopoverOpen] = useState(false);
  const [inboundTrunkPopoverOpen, setInboundTrunkPopoverOpen] = useState(false);
  const [dispatchRulePopoverOpen, setDispatchRulePopoverOpen] = useState(false);


  const form = useForm<RoutingProfileFormValues>({
    defaultValues: {
      name: profile?.name ?? "",
      planCode: "", // Optional - removed from profile type
      country: profile?.country ?? "",
      outboundProvider: profile?.outboundProvider ?? "",
      outboundTrunkRef: profile?.outboundTrunkRef ?? "",
      outboundProviderConfig: profile?.outboundProviderConfig
        ? JSON.stringify(profile.outboundProviderConfig, null, 2)
        : "",
      inboundProvider: profile?.inboundProvider ?? "",
      inboundTrunkRef: profile?.inboundTrunkRef ?? "",
      inboundProviderConfig: profile?.inboundProviderConfig
        ? JSON.stringify(profile.inboundProviderConfig, null, 2)
        : "",
      dispatchProvider: profile?.dispatchProvider ?? "",
      dispatchRuleRef: profile?.dispatchRuleRef ?? "",
      dispatchMetadata: profile?.dispatchMetadata
        ? JSON.stringify(profile.dispatchMetadata, null, 2)
        : "",
      complianceRequirements: profile?.complianceRequirements
        ? JSON.stringify(profile.complianceRequirements, null, 2)
        : "",
      recordingPolicy: profile?.recordingPolicy
        ? JSON.stringify(profile.recordingPolicy, null, 2)
        : "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);

        const name = values.name.trim();
        const planCode = values.planCode?.trim().toUpperCase() || undefined;
        const country = normalizeCountryCode(values.country);
        const outboundProvider = values.outboundProvider.trim();

        if (!name) {
          throw new Error("Routing profile name is required");
        }
        // Location validation: routing profiles are now country-based only
        if (!country) {
          throw new Error("Country is required");
        }
        if (!outboundProvider) {
          throw new Error("Outbound provider is required");
        }

        const payload: RoutingProfileFormSubmission = {
          name,
          planCode,
          country,
          outboundProvider,
          outboundTrunkRef: normalizeString(values.outboundTrunkRef),
          outboundProviderConfig: parseJsonObject(
            String(values.outboundProviderConfig || ""),
            "Outbound provider config"
          ),
          inboundProvider: normalizeString(values.inboundProvider),
          inboundTrunkRef: normalizeString(values.inboundTrunkRef),
          inboundProviderConfig: parseJsonObject(
            String(values.inboundProviderConfig || ""),
            "Inbound provider config"
          ),
          dispatchProvider: normalizeString(values.dispatchProvider),
          dispatchRuleRef: normalizeString(values.dispatchRuleRef),
          dispatchMetadata: parseJsonObject(
            String(values.dispatchMetadata || ""),
            "Dispatch metadata"
          ),
          complianceRequirements: parseJsonObject(
            String(values.complianceRequirements || ""),
            "Compliance requirements"
          ),
          recordingPolicy: parseJsonObject(
            String(values.recordingPolicy || ""),
            "Recording policy"
          ),
        };

        await onSubmit(payload);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Failed to save routing profile");
        throw err;
      }
    },
  });


  return (
    <Form<RoutingProfileFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-8">
        {/* Basic Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!String(value || "").trim()) {
                  return "Name is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="routingProfileName">Profile name</Label>
                <Input
                  id="routingProfileName"
                  value={String(field.state.value || "")}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="North America default"
                  autoComplete="off"
                />
                {!field.state.meta.isValid && (
                  <p className="text-xs text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="planCode"
            validators={{
              onChange: ({ value }) => {
                const text = String(value || "").trim();
                // Plan code is now optional
                if (text && text.length < 2) return "Plan code must be at least 2 characters";
                return undefined;
              },
            }}
          >
            {(field) => {
              const currentValue = String(field.state.value || "").toUpperCase();
              const selectedPlan = plans.find((plan) => plan.code.toUpperCase() === currentValue);

              return (
                <div className="space-y-2">
                  <Label htmlFor="routingProfilePlanCode">Plan code (optional)</Label>
                  <Popover open={planCodePopoverOpen} onOpenChange={setPlanCodePopoverOpen}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="routingProfilePlanCode"
                          value={selectedPlan ? (selectedPlan.name || selectedPlan.code) : currentValue}
                          onChange={(event) => {
                            field.handleChange(event.target.value.toUpperCase());
                            if (!selectedPlan && plans.length > 0) {
                              setPlanCodePopoverOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (selectedPlan || plans.length > 0) {
                              setPlanCodePopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (selectedPlan || plans.length > 0) {
                              setPlanCodePopoverOpen(true);
                            }
                          }}
                          onBlur={field.handleBlur}
                          placeholder="Optional - select or type plan code"
                          className={selectedPlan ? "cursor-pointer" : "uppercase"}
                          readOnly={!!selectedPlan}
                        />
                        {selectedPlan && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono uppercase">
                            {selectedPlan.code}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent 
                      className="w-[400px] p-0" 
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('#routingProfilePlanCode')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Command>
                        <CommandInput placeholder="Search plans..." />
                        <CommandList>
                          <CommandEmpty>No plan found.</CommandEmpty>
                          <CommandGroup>
                            {plans.map((plan) => (
                              <CommandItem
                                key={plan.code}
                                value={`${plan.code} ${plan.name || ""}`}
                                onSelect={() => {
                                  field.handleChange(plan.code.toUpperCase());
                                  setPlanCodePopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{plan.name || plan.code}</span>
                                  <span className="text-xs text-muted-foreground font-mono uppercase">{plan.code}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    If provided, creates a mapping automatically
                  </p>
                  {selectedPlan && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 text-xs text-muted-foreground"
                      onClick={() => {
                        field.handleChange("");
                        setPlanCodePopoverOpen(false);
                      }}
                    >
                      Clear selection
                    </Button>
                  )}
                  {!field.state.meta.isValid && (
                    <p className="text-xs text-destructive" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="country"
            validators={{
              onChange: ({ value }) => {
                const code = normalizeCountryCode(value);
                // Basic validation - only check ISO-2 format when something is set
                if (code && code.length !== 2) {
                  return "Country must be ISO-2 format (2 characters)";
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const currentValue = String(field.state.value || "").toUpperCase();
              const selectedCountry = countryCodes.find(
                (country) => country.code.toUpperCase() === currentValue
              );

              return (
                <div className="space-y-2">
                  <Label htmlFor="routingProfileCountry">Country (optional if region provided)</Label>
                  <Popover>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="routingProfileCountry"
                          value={
                            selectedCountry
                              ? `${selectedCountry.flag || ""} ${selectedCountry.name} (${selectedCountry.code})`
                              : currentValue
                          }
                          onChange={(event) => {
                            // Allow manual entry but keep only the normalized ISO-2 code in state
                            const code = normalizeCountryCode(event.target.value);
                            field.handleChange(code ?? "");
                          }}
                          onFocus={(event) => {
                            // When focusing, open the command list via click on anchor
                            event.currentTarget.click();
                          }}
                          placeholder="Select or type country code"
                          className={selectedCountry ? "cursor-pointer" : "uppercase"}
                        />
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-[calc(100vw-2rem)] sm:w-[400px] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search countries..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countryCodes.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.code} ${country.name}`}
                                onSelect={() => {
                                  field.handleChange(country.code.toUpperCase());
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {country.flag && <span>{country.flag}</span>}
                                  <span>{country.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({country.code})
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
                    <p className="text-xs text-destructive" role="alert">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

        </div>

        {/* Outbound Configuration */}
        <div className="grid gap-6 md:grid-cols-2">
          <form.Field
            name="outboundProvider"
            validators={{
              onChange: ({ value }) => {
                if (!String(value || "").trim()) {
                  return "Outbound provider is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="outboundProvider">Outbound provider</Label>
                <Select
                  value={String(field.state.value || "") || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="outboundProvider" className="w-full">
                    <SelectValue placeholder="Select outbound provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {telephonyProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!field.state.meta.isValid && (
                  <p className="text-xs text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="outboundTrunkRef">
            {(field) => {
              const currentValue = String(field.state.value || "");
              const selectedTrunk = outboundTrunks.find((trunk) => trunk.id === currentValue);

              return (
                <div className="space-y-2">
                  <Label htmlFor="outboundTrunkRef">Outbound trunk reference</Label>
                  <Popover open={outboundTrunkPopoverOpen} onOpenChange={setOutboundTrunkPopoverOpen}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="outboundTrunkRef"
                          value={selectedTrunk ? selectedTrunk.label : currentValue}
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                            if (!selectedTrunk) {
                              setOutboundTrunkPopoverOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (selectedTrunk || outboundTrunks.length > 0) {
                              setOutboundTrunkPopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (selectedTrunk || outboundTrunks.length > 0) {
                              setOutboundTrunkPopoverOpen(true);
                            }
                          }}
                          placeholder="Select or type trunk ID"
                          className={selectedTrunk ? "cursor-pointer" : "font-mono"}
                          readOnly={!!selectedTrunk}
                        />
                        {selectedTrunk && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            {selectedTrunk.id}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent 
                      className="w-[400px] p-0" 
                      align="start"
                      onInteractOutside={(e) => {
                        // Prevent closing when clicking the input field
                        const target = e.target as HTMLElement;
                        if (target.closest('#outboundTrunkRef')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Command>
                        <CommandInput placeholder="Search outbound trunks..." />
                        <CommandList>
                          <CommandEmpty>No trunk found.</CommandEmpty>
                          <CommandGroup>
                            {outboundTrunks.map((trunk) => (
                              <CommandItem
                                key={trunk.id}
                                value={`${trunk.id} ${trunk.label} ${trunk.description || ""}`}
                                onSelect={() => {
                                  field.handleChange(trunk.id);
                                  setOutboundTrunkPopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{trunk.label}</span>
                                  <span className="text-xs text-muted-foreground font-mono">{trunk.id}</span>
                                  {trunk.description && (
                                    <span className="text-xs text-muted-foreground/80">{trunk.description}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedTrunk && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 text-xs text-muted-foreground"
                      onClick={() => {
                        field.handleChange("");
                        setOutboundTrunkPopoverOpen(false);
                      }}
                    >
                      Clear selection
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional LiveKit trunk ID or provider reference.
                  </p>
                </div>
              );
            }}
          </form.Field>

          <form.Field name="inboundProvider">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="inboundProvider">Inbound provider</Label>
                <Select
                  value={String(field.state.value || "") || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="inboundProvider" className="w-full">
                    <SelectValue placeholder="Select inbound provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {telephonyProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional provider to receive inbound calls.
                </p>
              </div>
            )}
          </form.Field>

          <form.Field name="inboundTrunkRef">
            {(field) => {
              const currentValue = String(field.state.value || "");
              const selectedTrunk = inboundTrunks.find((trunk) => trunk.id === currentValue);

              return (
                <div className="space-y-2">
                  <Label htmlFor="inboundTrunkRef">Inbound trunk reference</Label>
                  <Popover open={inboundTrunkPopoverOpen} onOpenChange={setInboundTrunkPopoverOpen}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="inboundTrunkRef"
                          value={selectedTrunk ? selectedTrunk.label : currentValue}
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                            if (!selectedTrunk) {
                              setInboundTrunkPopoverOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (selectedTrunk || inboundTrunks.length > 0) {
                              setInboundTrunkPopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (selectedTrunk || inboundTrunks.length > 0) {
                              setInboundTrunkPopoverOpen(true);
                            }
                          }}
                          placeholder="Select or type trunk ID"
                          className={selectedTrunk ? "cursor-pointer" : "font-mono"}
                          readOnly={!!selectedTrunk}
                        />
                        {selectedTrunk && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            {selectedTrunk.id}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent 
                      className="w-[400px] p-0" 
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('#inboundTrunkRef')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Command>
                        <CommandInput placeholder="Search inbound trunks..." />
                        <CommandList>
                          <CommandEmpty>No trunk found.</CommandEmpty>
                          <CommandGroup>
                            {inboundTrunks.map((trunk) => (
                              <CommandItem
                                key={trunk.id}
                                value={`${trunk.id} ${trunk.label} ${trunk.description || ""}`}
                                onSelect={() => {
                                  field.handleChange(trunk.id);
                                  setInboundTrunkPopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{trunk.label}</span>
                                  <span className="text-xs text-muted-foreground font-mono">{trunk.id}</span>
                                  {trunk.description && (
                                    <span className="text-xs text-muted-foreground/80">{trunk.description}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedTrunk && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 text-xs text-muted-foreground"
                      onClick={() => {
                        field.handleChange("");
                        setInboundTrunkPopoverOpen(false);
                      }}
                    >
                      Clear selection
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional LiveKit inbound trunk ID or provider reference.
                  </p>
                </div>
              );
            }}
          </form.Field>

          <form.Field name="dispatchProvider">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="dispatchProvider">Dispatch provider</Label>
                <Select
                  value={String(field.state.value || "") || undefined}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger id="dispatchProvider" className="w-full">
                    <SelectValue placeholder="Select dispatch provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {telephonyProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>

          <form.Field name="dispatchRuleRef">
            {(field) => {
              const currentValue = String(field.state.value || "");
              const selectedRule = dispatchRules.find((rule) => rule.id === currentValue);

              return (
                <div className="space-y-2">
                  <Label htmlFor="dispatchRuleRef">Dispatch rule reference</Label>
                  <Popover open={dispatchRulePopoverOpen} onOpenChange={setDispatchRulePopoverOpen}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="dispatchRuleRef"
                          value={selectedRule ? selectedRule.label : currentValue}
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                            if (!selectedRule) {
                              setDispatchRulePopoverOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (selectedRule || dispatchRules.length > 0) {
                              setDispatchRulePopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (selectedRule || dispatchRules.length > 0) {
                              setDispatchRulePopoverOpen(true);
                            }
                          }}
                          placeholder="Select or type rule ID"
                          className={selectedRule ? "cursor-pointer" : "font-mono"}
                          readOnly={!!selectedRule}
                        />
                        {selectedRule && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            {selectedRule.id}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent 
                      className="w-[400px] p-0" 
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('#dispatchRuleRef')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Command>
                        <CommandInput placeholder="Search SIP dispatch rules..." />
                        <CommandList>
                          <CommandEmpty>No rule found.</CommandEmpty>
                          <CommandGroup>
                            {dispatchRules.map((rule) => (
                              <CommandItem
                                key={rule.id}
                                value={`${rule.id} ${rule.label} ${rule.description || ""}`}
                                onSelect={() => {
                                  field.handleChange(rule.id);
                                  setDispatchRulePopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{rule.label}</span>
                                  <span className="text-xs text-muted-foreground font-mono">{rule.id}</span>
                                  {rule.description && (
                                    <span className="text-xs text-muted-foreground/80">{rule.description}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedRule && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 text-xs text-muted-foreground"
                      onClick={() => {
                        field.handleChange("");
                        setDispatchRulePopoverOpen(false);
                      }}
                    >
                      Clear selection
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Optional LiveKit dispatch rule ID or reference.
                  </p>
                </div>
              );
            }}
          </form.Field>
        </div>

        <div className="space-y-6 border-t pt-6">
          <div className="space-y-2">
            <Label>Outbound provider config (JSON)</Label>
            <form.Field name="outboundProviderConfig" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"sipRegion":"us-west"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Provide provider-specific configuration such as SIP regions or codec preferences.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Inbound provider config (JSON)</Label>
            <form.Field name="inboundProviderConfig" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"webhookUrl":"https://example.com/inbound"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Optional configuration sent to inbound providers (Twilio, PSTN, etc.).
            </p>
          </div>

          <div className="space-y-2">
            <Label>Dispatch metadata (JSON)</Label>
            <form.Field name="dispatchMetadata" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"queue":"support"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Attach metadata that LiveKit SIP dispatch rules can use to route calls.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Compliance requirements (JSON)</Label>
            <form.Field name="complianceRequirements" validators={{ onChange: jsonValidator }}>
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
              Document per-country or per-plan compliance policies required before routing.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Recording policy (JSON)</Label>
            <form.Field name="recordingPolicy" validators={{ onChange: jsonValidator }}>
              {(field) => (
                <JsonEditor
                  value={String(field.state.value ?? "")}
                  onChange={(value) => field.handleChange(value)}
                  onBlur={field.handleBlur}
                  placeholder='{"default":"on"}'
                  error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              Optional overrides for recording (auto-start, announcements, etc.).
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

