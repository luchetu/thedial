"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OutboundTrunkForm } from "./OutboundTrunkForm";
import { useCreateOutboundTrunk, useUpdateOutboundTrunk } from "@/features/admin/telephony/hooks/useOutboundTrunks";
import { useTwilioTrunks } from "@/features/admin/telephony/hooks/useTwilioTrunks";
import type { OutboundTrunk, CreateOutboundTrunkRequest } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface OutboundTrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: OutboundTrunk | null; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export const OutboundTrunkDialog = ({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: OutboundTrunkDialogProps) => {
  const createMutation = useCreateOutboundTrunk();
  const updateMutation = useUpdateOutboundTrunk();
  
  // Fetch available Twilio trunks for selection (only when sheet is open)
  const { data: twilioTrunks = [] } = useTwilioTrunks({
    enabled: open, // Only fetch when sheet is open
  });

  const isEditMode = !!trunk;

  const handleSubmit = async (values: CreateOutboundTrunkRequest) => {
    try {
      if (isEditMode && trunk) {
        // TODO: Implement update when backend is ready
        toastError("Update functionality coming soon");
        return;
      } else {
        await createMutation.mutateAsync(values);
        toastSuccess("Outbound trunk created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toastError(
        isEditMode
          ? `Failed to update outbound trunk: ${err.message}`
          : `Failed to create outbound trunk: ${err.message}`
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Prepare available Twilio trunks for the form
  const availableTwilioTrunks = twilioTrunks.map((t) => ({
    id: t.id,
    friendlyName: t.friendlyName,
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Edit Outbound Trunk" : "Create Outbound Trunk"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update outbound trunk configuration below."
              : "Create a new LiveKit outbound trunk to connect to Twilio for making calls."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 pr-6">
          <OutboundTrunkForm
            key={trunk?.id || "new"}
            defaultValues={
              trunk
                ? {
                    name: trunk.name,
                    numberMode: trunk.numbers.includes("*") ? "any" : "specific",
                    numbers: trunk.numbers.filter((n) => n !== "*"),
                    trunkSelectionMode: trunk.twilioTrunkId ? "existing" : "direct",
                    twilioTrunkId: trunk.twilioTrunkId,
                    directSIPDomain: trunk.twilioSipAddress,
                    directUsername: trunk.twilioSipUsername,
                    directPassword: trunk.twilioSipPassword,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isEditMode ? "Update Trunk" : "Create Trunk"}
            availableTwilioTrunks={availableTwilioTrunks}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

