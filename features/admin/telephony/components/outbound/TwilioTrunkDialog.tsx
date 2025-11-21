"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TwilioTrunkForm, TwilioTrunkFormPayload } from "./TwilioTrunkForm";
import { useCreateTwilioTrunk, useUpdateTwilioTrunk } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import type {
  TwilioTrunk,
  CreateTwilioTrunkRequest,
  UpdateTwilioTrunkRequest,
  TwilioCredentialListMode,
} from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface TwilioTrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: TwilioTrunk | null; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export const TwilioTrunkDialog = ({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: TwilioTrunkDialogProps) => {
  const createMutation = useCreateTwilioTrunk();
  const updateMutation = useUpdateTwilioTrunk();

  const isEditMode = !!trunk;

  const handleSubmit = async (values: TwilioTrunkFormPayload) => {
    try {
      if (isEditMode && trunk) {
        const updatePayload: UpdateTwilioTrunkRequest = {
          friendlyName: values.friendlyName,
          terminationSipDomain: values.terminationSipDomain,
          originationSipUri: values.originationSipUri,
          credentialMode: values.credentialMode,
          credentialListSid: values.credentialListSid,
          credentialListName: values.credentialListName,
          username: values.username,
          password: values.password,
        };
        console.log("[TwilioTrunkDialog] update payload", updatePayload);
        await updateMutation.mutateAsync({
          id: trunk.id,
          data: updatePayload,
        });
        toastSuccess("Twilio trunk updated successfully");
      } else {
        const createPayload: CreateTwilioTrunkRequest = {
          friendlyName: values.friendlyName,
          terminationSipDomain: values.terminationSipDomain,
          originationSipUri: values.originationSipUri,
          credentialMode: values.credentialMode,
          credentialListSid: values.credentialListSid,
          credentialListName: values.credentialListName,
          username: values.username,
          password: values.password,
        };
        console.log("[TwilioTrunkDialog] create payload", createPayload);
        await createMutation.mutateAsync(createPayload);
        toastSuccess("Twilio trunk created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toastError(
        isEditMode
          ? `Failed to update Twilio trunk: ${err.message}`
          : `Failed to create Twilio trunk: ${err.message}`
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Edit Twilio Trunk" : "Create Twilio Trunk"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update Twilio trunk configuration below."
              : "Create a new Twilio Elastic SIP Trunk. Credentials will be auto-generated if not specified."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 pr-6">
          <TwilioTrunkForm
            key={trunk?.id || "new"}
            defaultValues={
              trunk
                ? {
                    friendlyName: trunk.friendlyName,
                    terminationSipDomain: trunk.terminationSipDomain || trunk.domainName,
                    originationSipUri: trunk.originationSipUri,
                    credentialListMode: (trunk.credentialListSid ? "existing" : "create") as TwilioCredentialListMode,
                    credentialListSid: trunk.credentialListSid,
                    credentialListName: trunk.credentialListName,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isEditMode ? "Update Trunk" : "Create Trunk"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

