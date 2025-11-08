"use client";

import { useState } from "react";
import { useForm, Form, FormField, FormSubmitButton } from "@/lib/forms";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateDispatchRuleRequest, DispatchRuleType } from "@/features/admin/telephony/types";

interface DispatchRuleFormValues extends Record<string, unknown> {
  name: string;
  type: DispatchRuleType;
  roomPrefix?: string;
  roomName?: string;
  pin?: string;
  randomize?: boolean;
  trunkIds?: string[];
  agentName?: string;
  autoDispatch?: boolean;
  hidePhoneNumber?: boolean;
}

interface DispatchRuleFormProps {
  defaultValues?: Partial<DispatchRuleFormValues>;
  onSubmit: (values: CreateDispatchRuleRequest) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  trunkOptions?: Array<{ id: string; name: string }>;
  isTrunkLoading?: boolean;
}

export const DispatchRuleForm = ({
  defaultValues = {
    name: "",
    type: "individual",
    autoDispatch: false,
    hidePhoneNumber: false,
    trunkIds: [],
  },
  onSubmit,
  isLoading = false,
  submitLabel = "Create Dispatch Rule",
  trunkOptions = [],
  isTrunkLoading = false,
}: DispatchRuleFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitDisabled =
    isLoading || (!isTrunkLoading && trunkOptions.length === 0);

  const form = useForm<DispatchRuleFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "individual",
      roomPrefix: defaultValues?.roomPrefix || "",
      roomName: defaultValues?.roomName || "",
      pin: defaultValues?.pin || "",
      randomize: defaultValues?.randomize || false,
      agentName: defaultValues?.agentName || "",
      autoDispatch: defaultValues?.autoDispatch || false,
      hidePhoneNumber: defaultValues?.hidePhoneNumber || false,
      trunkIds: Array.isArray(defaultValues?.trunkIds) ? defaultValues.trunkIds : [],
    },
    onSubmit: async (values) => {
      try {
        setSubmitError(null);
        const request: CreateDispatchRuleRequest = {
          name: values.name,
          type: values.type,
          trunkIds: Array.isArray(values.trunkIds) ? values.trunkIds : [],
          agentName: values.agentName || undefined,
          autoDispatch: values.autoDispatch || false,
          hidePhoneNumber: values.hidePhoneNumber || false,
        };

        // Add type-specific fields
        if (values.type === "individual" && values.roomPrefix) {
          request.roomPrefix = values.roomPrefix;
        } else if (values.type === "direct") {
          if (values.roomName) request.roomName = values.roomName;
          if (values.pin) request.pin = values.pin;
        } else if (values.type === "callee") {
          if (values.roomPrefix) request.roomPrefix = values.roomPrefix;
          request.randomize = values.randomize || false;
        }

        await onSubmit(request);
      } catch (error) {
        const err = error as Error;
        setSubmitError(err.message || "Something went wrong");
      }
    },
  });

  // Track rule type for conditional rendering
  const [ruleType, setRuleType] = useState<DispatchRuleType>(
    (defaultValues?.type as DispatchRuleType) || "individual"
  );

  return (
    <Form<DispatchRuleFormValues> onSubmit={form.handleSubmit}>
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
              label="Rule Name"
              placeholder="e.g., Individual Call Routing"
              required
              error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
            />
          )}
        </form.Field>

        {/* Rule Type */}
        <form.Field
          name="type"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "This field is required";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={String(field.name)} className="text-sm font-medium">
                Rule Type
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(field.state.value || "individual")}
                onValueChange={(value) => {
                  const newType = value as DispatchRuleType;
                  field.handleChange(newType);
                  setRuleType(newType);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="callee">Callee</SelectItem>
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

        {/* Trunk Selection */}
        <form.Field
          name="trunkIds"
          validators={{
            onChange: ({ value }) => {
              if (!Array.isArray(value) || value.length === 0) {
                return "Select at least one trunk";
              }
              return undefined;
            },
            onSubmit: ({ value }) => {
              if (!Array.isArray(value) || value.length === 0) {
                return "Select at least one trunk";
              }
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trunks<span className="text-destructive">*</span>
              </Label>
              {isTrunkLoading ? (
                <p className="text-sm text-muted-foreground">Loading trunks…</p>
              ) : trunkOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No trunks available. Create a trunk before adding a dispatch rule.
                </p>
              ) : (
                <div className="space-y-2">
                  {trunkOptions.map((trunk) => {
                    const selected = Array.isArray(field.state.value)
                      ? field.state.value.includes(trunk.id)
                      : false;
                    return (
                      <label
                        key={trunk.id}
                        className="flex items-center space-x-2 rounded-md border p-2 hover:bg-muted"
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) => {
                            const current = Array.isArray(field.state.value)
                              ? field.state.value
                              : [];
                            if (checked === true) {
                              field.handleChange([...current, trunk.id]);
                            } else {
                              field.handleChange(current.filter((id: string) => id !== trunk.id));
                            }
                          }}
                        />
                        <span className="text-sm font-medium">{trunk.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {!field.state.meta.isValid && (
                <p className="text-sm text-destructive" role="alert">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Conditional Fields Based on Rule Type */}
        {ruleType === "individual" && (
          <form.Field name="roomPrefix">
            {(field) => (
              <FormField
                field={field}
                name="roomPrefix"
                label="Room Prefix"
                placeholder="e.g., call-"
                error={
                  !field.state.meta.isValid
                    ? field.state.meta.errors.join(", ")
                    : undefined
                }
              />
            )}
          </form.Field>
        )}

        {ruleType === "direct" && (
          <>
            <form.Field name="roomName">
              {(field) => (
                <FormField
                  field={field}
                  name="roomName"
                  label="Room Name"
                  placeholder="e.g., open-room"
                  error={
                    !field.state.meta.isValid
                      ? field.state.meta.errors.join(", ")
                      : undefined
                  }
                />
              )}
            </form.Field>
            <form.Field name="pin">
              {(field) => (
                <FormField
                  field={field}
                  name="pin"
                  label="PIN (Optional)"
                  placeholder="e.g., 1234"
                  error={
                    !field.state.meta.isValid
                      ? field.state.meta.errors.join(", ")
                      : undefined
                  }
                />
              )}
            </form.Field>
          </>
        )}

        {ruleType === "callee" && (
          <>
            <form.Field name="roomPrefix">
              {(field) => (
                <FormField
                  field={field}
                  name="roomPrefix"
                  label="Room Prefix"
                  placeholder="e.g., number-"
                  error={
                    !field.state.meta.isValid
                      ? field.state.meta.errors.join(", ")
                      : undefined
                  }
                />
              )}
            </form.Field>
            <form.Field name="randomize">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={String(field.name)}
                    checked={Boolean(field.state.value)}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <Label
                    htmlFor={String(field.name)}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Randomize (separate room per caller)
                  </Label>
                </div>
              )}
            </form.Field>
          </>
        )}

        {/* Agent Configuration */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Agent Configuration</h3>
          <form.Field name="agentName">
            {(field) => (
              <FormField
                field={field}
                name="agentName"
                label="Agent Name"
                placeholder="e.g., telephony-agent"
                error={
                  !field.state.meta.isValid
                    ? field.state.meta.errors.join(", ")
                    : undefined
                }
              />
            )}
          </form.Field>
          <form.Field name="autoDispatch">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={String(field.name)}
                  checked={Boolean(field.state.value)}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
                <Label
                  htmlFor={String(field.name)}
                  className="text-sm font-medium cursor-pointer"
                >
                  Auto-dispatch agent to room
                </Label>
              </div>
            )}
          </form.Field>
        </div>

        {/* Other Options */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Other Options</h3>
          <form.Field name="hidePhoneNumber">
            {(field) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={String(field.name)}
                  checked={Boolean(field.state.value)}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
                <Label
                  htmlFor={String(field.name)}
                  className="text-sm font-medium cursor-pointer"
                >
                  Hide phone number
                </Label>
              </div>
            )}
          </form.Field>
        </div>

        <FormSubmitButton
          className="w-full text-white"
          variant="secondary"
          size="lg"
          disabled={isSubmitDisabled}
          loading={isLoading}
        >
          {submitLabel}
        </FormSubmitButton>

        {submitError && (
          <p className="text-sm text-destructive text-center" role="alert">
            {submitError}
          </p>
        )}

        {!isTrunkLoading && trunkOptions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No trunks available. Create a LiveKit trunk first.
          </p>
        )}
      </div>
    </Form>
  );
};

