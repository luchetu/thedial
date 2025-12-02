"use client";

import { useForm, FormField } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface OriginationURLFormValues extends Record<string, unknown> {
  friendlyName: string;
  sipUrl: string;
  priority: number;
  weight: number;
  enabled: boolean;
}

interface OriginationURLFormProps {
  defaultValues?: Partial<OriginationURLFormValues>;
  onSubmit: (values: OriginationURLFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function OriginationURLForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Submit",
}: OriginationURLFormProps) {
  const form = useForm<OriginationURLFormValues>({
    defaultValues: {
      friendlyName: defaultValues?.friendlyName || "",
      sipUrl: defaultValues?.sipUrl || "",
      priority: defaultValues?.priority ?? 10,
      weight: defaultValues?.weight ?? 10,
      enabled: defaultValues?.enabled ?? true,
    },
    onSubmit: async (values) => {
      const val = values as Partial<OriginationURLFormValues>;
      const formValues: OriginationURLFormValues = {
        friendlyName: val?.friendlyName ? String(val.friendlyName).trim() : "",
        sipUrl: val?.sipUrl ? String(val.sipUrl).trim() : "",
        priority: typeof val?.priority === "number" ? val.priority : Number(val?.priority) || 10,
        weight: typeof val?.weight === "number" ? val.weight : Number(val?.weight) || 10,
        enabled: Boolean(val?.enabled ?? true),
      };
      
      await onSubmit(formValues);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("[OriginationURLForm] Form submit - current form state.values:", form.state.values);
        console.log("[OriginationURLForm] Form submit - canSubmit:", form.state.canSubmit);
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="friendlyName"
        validators={{
          onChange: ({ value }) => {
            const strValue = String(value || "");
            if (!strValue || strValue.trim() === "") {
              return "Friendly name is required";
            }
            return undefined;
          },
          onSubmit: ({ value }) => {
            const strValue = String(value || "");
            if (!strValue || strValue.trim() === "") {
              return "Friendly name is required";
            }
            return undefined;
          },
        }}
      >
        {(field) => {
          console.log("[OriginationURLForm] friendlyName field state:", {
            value: field.state.value,
            valueType: typeof field.state.value,
            isValid: field.state.meta.isValid,
            errors: field.state.meta.errors,
          });
          return (
            <FormField
              field={field}
              name="friendlyName"
              label="Friendly Name"
              placeholder="LiveKit SIP URI"
              required
              disabled={isLoading}
              error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
            />
          );
        }}
      </form.Field>

      <form.Field
        name="sipUrl"
        validators={{
          onChange: ({ value }) => {
            const strValue = String(value || "");
            if (!strValue || strValue.trim() === "") {
              return "SIP URL is required";
            }
            const trimmed = strValue.trim();
            if (!trimmed.startsWith("sip:") && !trimmed.includes("://")) {
              return "SIP URL should start with 'sip:'";
            }
            return undefined;
          }

        }}
      >
        {(field) => (
          <FormField
            field={field}
            name="sipUrl"
            label="SIP URL"
            placeholder="sip:my-project.sip.livekit.cloud"
            required
            disabled={isLoading}
            error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
          />
        )}
      </form.Field>

      <form.Field
        name="priority"
        validators={{
          onChange: ({ value }) => {
            if (value === undefined || value === null || value === "") {
              return "Priority is required";
            }
            const numValue = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(numValue) || numValue < 0 || numValue > 65535) {
              return "Priority must be between 0 and 65535";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority <span className="text-destructive">*</span>
            </Label>
            <Input
              id="priority"
              name="priority"
              type="number"
              value={typeof field.state.value === "number" ? field.state.value : String(field.state.value ?? "")}
              onChange={(e) => {
                const val = e.target.value;
                field.handleChange(val === "" ? undefined : Number(val));
              }}
              onBlur={field.handleBlur}
              placeholder="10"
              required
              disabled={isLoading}
              className={!field.state.meta.isValid ? "border-destructive" : ""}
            />
            {!field.state.meta.isValid && (
              <p className="text-sm text-destructive" role="alert">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="weight"
        validators={{
          onChange: ({ value }) => {
            if (value === undefined || value === null || value === "") {
              return "Weight is required";
            }
            const numValue = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(numValue) || numValue < 1 || numValue > 65535) {
              return "Weight must be between 1 and 65535";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium">
              Weight <span className="text-destructive">*</span>
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={typeof field.state.value === "number" ? field.state.value : String(field.state.value ?? "")}
              onChange={(e) => {
                const val = e.target.value;
                field.handleChange(val === "" ? undefined : Number(val));
              }}
              onBlur={field.handleBlur}
              placeholder="10"
              required
              disabled={isLoading}
              className={!field.state.meta.isValid ? "border-destructive" : ""}
            />
            {!field.state.meta.isValid && (
              <p className="text-sm text-destructive" role="alert">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="enabled">
        {(field) => (
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={Boolean(field.state.value)}
              onCheckedChange={field.handleChange}
              disabled={isLoading}
            />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" variant="primary-outline" disabled={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

