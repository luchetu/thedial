"use client";

import { useMemo } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { AddTrunkTwilioForm } from "../AddTrunkTwilioForm";
import { useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type { Trunk } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";

interface TwilioTrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: Trunk | null;
  onSuccess?: () => void;
}

export function TwilioTrunkDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: TwilioTrunkDialogProps) {
  const isEditMode = !!trunk;

  // Fetch full trunk data with configuration when editing
  const { data: fullTrunkData } = useTrunk(trunk?.id || "", {
    enabled: isEditMode && !!trunk?.id && open,
  });

  // Use fullTrunkData if available, otherwise fall back to trunk prop
  const trunkData = fullTrunkData || trunk;

  // Parse default values - only basic trunk info, not configuration
  // Configuration is handled separately via TwilioConfigurationDialog
  const defaultValues = useMemo<Partial<TrunkFormValues> | undefined>(() => {
    if (!isEditMode || !trunkData) return undefined;

    // Only pass basic trunk info - configuration should be handled via Configure button
    return {
      name: trunkData.name,
      type: "twilio", // Always twilio for this dialog
      direction: trunkData.direction,
      status: trunkData.status,
    };
  }, [isEditMode, trunkData]);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Edit Twilio Trunk" : "Create Twilio Trunk"}
      description={
        isEditMode
          ? "Update Twilio trunk configuration below."
          : "Create a new Twilio trunk for routing calls."
      }
    >
      <AddTrunkTwilioForm
        key={`twilio-${trunk?.id || "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSuccess}
        submitLabel={isEditMode ? "Update Trunk" : "Create Trunk"}
        isEditMode={isEditMode}
        trunkId={trunk?.id}
        twilioTrunkSid={trunkData?.externalId || trunk?.externalId || undefined}
      />
    </BaseTrunkDialog>
  );
}

