"use client";

import { useForm, FormField, Form, FormSubmitButton } from "@/lib/forms";
import {
  useCreateTwilioCredentialList,
  useUpdateTwilioCredentialList,
} from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import type { TwilioCredentialList } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface CredentialListFormValues extends Record<string, unknown> {
  friendlyName: string;
}

interface CredentialListFormProps {
  defaultValues?: CredentialListFormValues;
  credentialList?: TwilioCredentialList | null;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function CredentialListForm({
  defaultValues,
  credentialList,
  onSubmit,
  submitLabel = "Submit",
}: CredentialListFormProps) {
  const createMutation = useCreateTwilioCredentialList();
  const updateMutation = useUpdateTwilioCredentialList();

  const isEditMode = Boolean(credentialList);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CredentialListFormValues>({
    defaultValues: defaultValues || {
      friendlyName: "",
    },
    onSubmit: async (values) => {
      try {
        if (isEditMode && credentialList) {
          await updateMutation.mutateAsync({
            sid: credentialList.sid,
            data: { friendlyName: values.friendlyName },
          });
          toastSuccess("Credential list updated successfully");
        } else {
          await createMutation.mutateAsync({
            friendlyName: values.friendlyName,
          });
          toastSuccess("Credential list created successfully");
        }
        onSubmit?.();
      } catch (error) {
        const err = error as Error;
        toastError(err.message || "Failed to save credential list");
        throw err;
      }
    },
  });

  return (
    <Form<CredentialListFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-4">
        <form.Field
          name="friendlyName"
          validators={{
            onChange: ({ value }) => {
              if (!value || String(value).trim() === "") {
                return "Friendly name is required";
              }
              return undefined;
            },
            onBlur: ({ value }) => {
              if (!value || String(value).trim() === "") {
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
          <FormSubmitButton loading={isLoading} variant="secondary">
            {submitLabel}
          </FormSubmitButton>
        </div>
      </div>
    </Form>
  );
}

