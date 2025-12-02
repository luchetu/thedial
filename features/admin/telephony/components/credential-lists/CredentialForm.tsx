"use client";

import { useForm, FormField, Form } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CredentialFormValues extends Record<string, unknown> {
  username: string;
  password: string;
}

interface CredentialFormProps {
  defaultValues?: CredentialFormValues;
  onSubmit: (values: CredentialFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
}

export function CredentialForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Submit",
  isEditMode = false,
}: CredentialFormProps) {
  const form = useForm<CredentialFormValues>({
    defaultValues: defaultValues || {
      username: "",
      password: "",
    },
    onSubmit: async (values) => {
      // Use form.state.values as fallback if values is undefined
      const formValues = values || form.state.values;
      if (!formValues || typeof formValues !== 'object') {
        console.error("Form submission failed: form values are invalid", { values, formState: form.state.values });
        return;
      }
      await onSubmit(formValues as CredentialFormValues);
    },
  });

  return (
    <Form<CredentialFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-4">
      <form.Field
        name="username"
        validators={{
          onChange: ({ value }) => {
            const stringValue = String(value || "");
            if (!isEditMode && (!stringValue || stringValue.trim() === "")) {
              return "Username is required";
            }
            return undefined;
          },
          onBlur: ({ value }) => {
            const stringValue = String(value || "");
            if (!isEditMode && (!stringValue || stringValue.trim() === "")) {
              return "Username is required";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <FormField
            field={field}
            name="username"
            label="Username"
            placeholder="sip_username"
            required={!isEditMode}
            disabled={isLoading || isEditMode}
            error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) => {
            const stringValue = String(value || "");
            if (!stringValue || stringValue.trim() === "") {
              return "Password is required";
            }
            if (stringValue.length < 12) {
              return "Password must be at least 12 characters";
            }
            // Check for at least 1 digit
            if (!/\d/.test(stringValue)) {
              return "Password must contain at least 1 digit";
            }
            // Check for mixed case
            if (!/[a-z]/.test(stringValue) || !/[A-Z]/.test(stringValue)) {
              return "Password must contain both uppercase and lowercase letters";
            }
            return undefined;
          },
          onBlur: ({ value }) => {
            const stringValue = String(value || "");
            if (!stringValue || stringValue.trim() === "") {
              return "Password is required";
            }
            if (stringValue.length < 12) {
              return "Password must be at least 12 characters";
            }
            // Check for at least 1 digit
            if (!/\d/.test(stringValue)) {
              return "Password must contain at least 1 digit";
            }
            // Check for mixed case
            if (!/[a-z]/.test(stringValue) || !/[A-Z]/.test(stringValue)) {
              return "Password must contain both uppercase and lowercase letters";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={String(field.state.value || "")}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Enter password (min 12 chars, 1 digit, mixed case)"
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

      {isEditMode && (
        <p className="text-xs text-muted-foreground">
          Note: Username cannot be changed. Only the password can be updated.
        </p>
      )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" variant="secondary" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Form>
  );
}

