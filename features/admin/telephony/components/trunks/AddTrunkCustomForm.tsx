"use client";

import { useForm, Form, FormSubmitButton } from "@/lib/forms";
import { TrunkBasicInfoForm } from "./TrunkBasicInfoForm";
import { useCreateTrunk, useUpdateTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type {
  CreateTrunkRequest,
  UpdateTrunkRequest,
} from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "./types";
import { toastError, toastSuccess } from "@/lib/toast";

interface AddTrunkCustomFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
  trunkId?: string;
}

export function AddTrunkCustomForm({
  defaultValues,
  onSubmit,
  isLoading: externalLoading = false,
  submitLabel = "Create Trunk",
  isEditMode = false,
  trunkId,
}: AddTrunkCustomFormProps) {
  const createMutation = useCreateTrunk();
  const updateMutation = useUpdateTrunk();

  const isLoading = externalLoading || createMutation.isPending || updateMutation.isPending;

  const form = useForm<TrunkFormValues>({
    defaultValues: {
      name: defaultValues?.name || "",
      type: "custom",
      direction: defaultValues?.direction || "outbound",
      externalId: defaultValues?.externalId || "",
      status: defaultValues?.status || "active",
    },
    onSubmit: async (values) => {
      try {
        if (isEditMode && trunkId) {
          const request: UpdateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: values.direction,
            provider: "custom",
            status: values.status,
          };

          await updateMutation.mutateAsync({
            id: trunkId,
            data: request,
          });
          toastSuccess("Trunk updated successfully");
          onSubmit?.();
        } else {
          const request: CreateTrunkRequest = {
            name: values.name,
            type: values.type,
            direction: values.direction,
            provider: "custom",
            status: values.status,
          };

          await createMutation.mutateAsync(request);
          toastSuccess("Trunk created successfully");
          onSubmit?.();
        }
      } catch (error) {
        const err = error as Error;
        toastError(`Failed to ${isEditMode ? "update" : "create"} trunk: ${err.message}`);
        throw error;
      }
    },
  });

  return (
    <Form<TrunkFormValues> onSubmit={() => form.handleSubmit()}>
      <div className="space-y-6">
        {/* Custom trunks only need basic info */}
        <TrunkBasicInfoForm form={form} isLoading={isLoading} showTitle={true} lockType={true} />

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <FormSubmitButton loading={isLoading} variant="secondary">
            {submitLabel}
          </FormSubmitButton>
        </div>
      </div>
    </Form>
  );
}

