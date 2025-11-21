"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CredentialListForm } from "./CredentialListForm";
import {
  useCreateTwilioCredentialList,
  useUpdateTwilioCredentialList,
} from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import type { TwilioCredentialList } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface CredentialListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialList?: TwilioCredentialList | null;
  onSuccess?: () => void;
}

export const CredentialListDialog = ({
  open,
  onOpenChange,
  credentialList,
  onSuccess,
}: CredentialListDialogProps) => {
  const createMutation = useCreateTwilioCredentialList();
  const updateMutation = useUpdateTwilioCredentialList();

  const isEditMode = Boolean(credentialList);

  const handleSubmit = async (values: { friendlyName: string }) => {
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
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save credential list");
      throw err;
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Credential List" : "Create Credential List"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the credential list name below."
              : "Create a new credential list to store SIP credentials for Twilio trunks."}
          </DialogDescription>
        </DialogHeader>

        <CredentialListForm
          key={credentialList?.sid || "new"}
          defaultValues={
            credentialList
              ? {
                  friendlyName: credentialList.friendlyName,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={isEditMode ? "Save Changes" : "Create List"}
        />
      </DialogContent>
    </Dialog>
  );
};

