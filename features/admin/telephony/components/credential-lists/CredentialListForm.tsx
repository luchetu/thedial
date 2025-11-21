"use client";

import { useForm, FormField } from "@/lib/forms";
import { Button } from "@/components/ui/button";

interface CredentialListFormValues {
  friendlyName: string;
}

interface CredentialListFormProps {
  defaultValues?: CredentialListFormValues;
  onSubmit: (values: CredentialListFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CredentialListForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Submit",
}: CredentialListFormProps) {
  const form = useForm<CredentialListFormValues>({
    defaultValues: defaultValues || {
      friendlyName: "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="friendlyName"
        validators={{
          onChange: ({ value }) => {
            if (!value || value.trim() === "") {
              return "Friendly name is required";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <FormField
            field={field}
            name="friendlyName"
            label="Friendly Name"
            placeholder="My Credential List"
            required
            disabled={isLoading}
            error={!field.state.meta.isValid ? field.state.meta.errors.join(", ") : undefined}
          />
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" variant="secondary" disabled={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

