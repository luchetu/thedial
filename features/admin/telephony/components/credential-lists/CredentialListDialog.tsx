"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CredentialListForm } from "./CredentialListForm";
import type { TwilioCredentialList } from "@/features/admin/telephony/types";

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
  const isEditMode = Boolean(credentialList);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

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
                  friendlyName: credentialList.friendlyName || "",
                }
              : undefined
          }
          credentialList={credentialList}
          onSubmit={handleSuccess}
          submitLabel={isEditMode ? "Save Changes" : "Create List"}
        />
      </DialogContent>
    </Dialog>
  );
};


