"use client";

import { useMemo, useState } from "react";
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
import { countryCodes } from "@/lib/constants/countryCodes";
import type {
  PlanRoutingProfile,
  CreatePlanRoutingProfileRequest,
  UpdatePlanRoutingProfileRequest,
} from "@/features/admin/telephony/types";
import type { RoutingProfile } from "@/features/admin/telephony/types";

interface PlanRoutingProfileFormValues extends Record<string, unknown> {
  planCode: string;
  routingProfileId: string;
  country?: string;
  region?: string;
}

export type PlanRoutingProfileFormSubmission = CreatePlanRoutingProfileRequest;

interface PlanRoutingProfileFormProps {
  mapping?: PlanRoutingProfile | null;
  onSubmit: (payload: PlanRoutingProfileFormSubmission) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  plans?: Array<{ code: string; name?: string | null }>;
  routingProfiles?: RoutingProfile[];
  initialPlanCode?: string;
}

const normalizeString = (value: unknown) => {
  const stringValue = typeof value === "string" ? value : "";
  const trimmed = stringValue.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toCountryFlag = (code: string) => {
  const country = countryCodes.find((entry) => entry.code === code.toUpperCase());
  return country?.flag ? `${country.flag} ${country.code}` : code.toUpperCase();
};

export const PlanRoutingProfileForm = ({
  mapping,
  onSubmit,
  isLoading = false,
  submitLabel = "Create mapping",
  plans = [],
  routingProfiles = [],
  initialPlanCode,
}: PlanRoutingProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [planCodePopoverOpen, setPlanCodePopoverOpen] = useState(false);
  const [routingProfilePopoverOpen, setRoutingProfilePopoverOpen] = useState(false);
  const isEditMode = Boolean(mapping);

  const isoCountrySet = useMemo(
    () => new Set(countryCodes.map((country) => country.code)),
    []
  );

  const form = useForm<PlanRoutingProfileFormValues>({
    defaultValues: {
      planCode: mapping?.planCode ?? initialPlanCode ?? "",
      routingProfileId: mapping?.routingProfileId ?? "",
      country: mapping?.country ?? "",
      region: mapping?.region ?? "",
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);

        const planCode = values.planCode.trim().toUpperCase();
        const routingProfileId = values.routingProfileId.trim();
        const country = values.country?.trim().toUpperCase() || undefined;
        const region = values.region?.trim() || undefined;

        if (!planCode) {
          throw new Error("Plan code is required");
        }
        if (!routingProfileId) {
          throw new Error("Routing profile is required");
        }
        // Validation: either country OR region must be set (not both, not neither)
        if (!country && !region) {
          throw new Error("Either country or region must be provided");
        }
        if (country && region) {
          throw new Error("Cannot specify both country and region - choose one");
        }
        if (country && !isoCountrySet.has(country)) {
          throw new Error("Country must be a valid ISO-2 code");
        }

        const payload: PlanRoutingProfileFormSubmission = {
          planCode,
          routingProfileId,
          country,
          region,
        };

        await onSubmit(payload);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Failed to save mapping");
        throw err;
      }
    },
  });

  return (
    <Form<PlanRoutingProfileFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        <div className="space-y-6">
          <form.Field
            name="planCode"
            validators={{
              onChange: ({ value }) => {
                const text = String(value || "").trim();
                if (!text) return "Plan code is required";
                if (text.length < 2) return "Plan code must be at least 2 characters";
                return undefined;
              },
            }}
          >
            {(field) => {
              const currentValue = String(field.state.value || "").toUpperCase();
              const selectedPlan = plans.find((plan) => plan.code.toUpperCase() === currentValue);

              return (
                <div className="space-y-2">
                  <Label htmlFor="planRoutingProfilePlanCode">Plan code</Label>
                  <Popover open={planCodePopoverOpen && !isEditMode} onOpenChange={setPlanCodePopoverOpen}>
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="planRoutingProfilePlanCode"
                          value={selectedPlan ? (selectedPlan.name || selectedPlan.code) : currentValue}
                          onChange={(event) => {
                            if (!isEditMode) {
                              field.handleChange(event.target.value.toUpperCase());
                              if (!selectedPlan && plans.length > 0) {
                                setPlanCodePopoverOpen(true);
                              }
                            }
                          }}
                          onFocus={() => {
                            if (!isEditMode && (selectedPlan || plans.length > 0)) {
                              setPlanCodePopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (!isEditMode && (selectedPlan || plans.length > 0)) {
                              setPlanCodePopoverOpen(true);
                            }
                          }}
                          onBlur={field.handleBlur}
                          placeholder="Select or type plan code"
                          className={selectedPlan ? "cursor-pointer" : "uppercase"}
                          readOnly={isEditMode || !!selectedPlan}
                          disabled={isEditMode}
                        />
                        {selectedPlan && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono uppercase">
                            {selectedPlan.code}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-[calc(100vw-2rem)] sm:w-[400px] p-0"
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest("#planRoutingProfilePlanCode")) {
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
                                  <span className="text-xs text-muted-foreground font-mono uppercase">
                                    {plan.code}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedPlan && !isEditMode && (
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
                  {isEditMode && (
                    <p className="text-xs text-muted-foreground">
                      Plan code cannot be changed. Delete and recreate the mapping to change the plan.
                    </p>
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
            name="routingProfileId"
            validators={{
              onChange: ({ value }) => {
                const text = String(value || "").trim();
                if (!text) return "Routing profile is required";
                return undefined;
              },
            }}
          >
            {(field) => {
              const currentValue = String(field.state.value || "");
              const selectedProfile = routingProfiles.find(
                (profile) => profile.id === currentValue
              );

              return (
                <div className="space-y-2">
                  <Label htmlFor="planRoutingProfileRoutingProfileId">
                    Routing profile
                  </Label>
                  <Popover
                    open={routingProfilePopoverOpen}
                    onOpenChange={setRoutingProfilePopoverOpen}
                  >
                    <PopoverAnchor asChild>
                      <div className="relative">
                        <Input
                          id="planRoutingProfileRoutingProfileId"
                          value={
                            selectedProfile
                              ? `${selectedProfile.name} (${selectedProfile.country || selectedProfile.region || "—"})`
                              : currentValue
                          }
                          onChange={(event) => {
                            field.handleChange(event.target.value);
                            if (!selectedProfile && routingProfiles.length > 0) {
                              setRoutingProfilePopoverOpen(true);
                            }
                          }}
                          onFocus={() => {
                            if (selectedProfile || routingProfiles.length > 0) {
                              setRoutingProfilePopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            if (selectedProfile || routingProfiles.length > 0) {
                              setRoutingProfilePopoverOpen(true);
                            }
                          }}
                          placeholder="Select or type routing profile ID"
                          className={selectedProfile ? "cursor-pointer" : "font-mono"}
                          readOnly={!!selectedProfile}
                        />
                        {selectedProfile && (
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            {selectedProfile.id}
                          </p>
                        )}
                      </div>
                    </PopoverAnchor>
                    <PopoverContent
                      className="w-[calc(100vw-2rem)] sm:w-[400px] p-0"
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest("#planRoutingProfileRoutingProfileId")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Command>
                        <CommandInput placeholder="Search routing profiles..." />
                        <CommandList>
                          <CommandEmpty>No routing profile found.</CommandEmpty>
                          <CommandGroup>
                            {routingProfiles.map((profile) => (
                              <CommandItem
                                key={profile.id}
                                value={`${profile.id} ${profile.name} ${profile.country || profile.region || ""}`}
                                onSelect={() => {
                                  field.handleChange(profile.id);
                                  setRoutingProfilePopoverOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{profile.name}</span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {profile.id}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {profile.region || profile.country || "—"}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedProfile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-1 text-xs text-muted-foreground"
                      onClick={() => {
                        field.handleChange("");
                        setRoutingProfilePopoverOpen(false);
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
        </div>

        <div className="space-y-6">
          <form.Field
            name="country"
            validators={{
              onChange: ({ value }) => {
                const text = String(value || "").trim().toUpperCase();
                // Basic validation - cross-field validation happens in onSubmit
                if (text && text.length !== 2) return "Country must be ISO-2";
                if (text && !isoCountrySet.has(text)) return "Unknown country code";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="planRoutingProfileCountry">
                  Country (optional if region provided)
                </Label>
                <Input
                  id="planRoutingProfileCountry"
                  value={String(field.state.value || "")}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                  onBlur={field.handleBlur}
                  placeholder="US"
                  autoComplete="off"
                  maxLength={2}
                />
                {(() => {
                  const countryValue = String(field.state.value || "").trim();
                  return countryValue ? (
                    <p className="text-xs text-muted-foreground">
                      {toCountryFlag(countryValue)}
                    </p>
                  ) : null;
                })()}
                {!field.state.meta.isValid && (
                  <p className="text-xs text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="region"
            validators={{
              onChange: () => {
                // Basic validation - cross-field validation happens in onSubmit
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="planRoutingProfileRegion">
                  Region (optional if country provided)
                </Label>
                <Input
                  id="planRoutingProfileRegion"
                  value={String(field.state.value || "")}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="US, CA, EU, etc."
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Optional region code (e.g., US, CA, EU). Cannot be used with country.
                </p>
                {!field.state.meta.isValid && (
                  <p className="text-xs text-destructive" role="alert">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-end">
          <FormSubmitButton loading={isLoading} variant="secondary">
            {submitLabel}
          </FormSubmitButton>
        </div>
      </div>
    </Form>
  );
};

