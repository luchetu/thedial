"use client";

import { useMemo } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { AddTrunkTwilioForm } from "../AddTrunkTwilioForm";
import { useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import { useTwilioTrunk } from "@/features/admin/telephony/hooks/useTwilioTrunks";
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

  // Fetch the Twilio trunk details using externalId
  const twilioTrunkId = fullTrunkData?.externalId || trunk?.externalId;
  const { data: twilioTrunk } = useTwilioTrunk(twilioTrunkId || "", {
    enabled: isEditMode && !!twilioTrunkId && open,
  });

  // Parse configuration from trunk data
  const defaultValues = useMemo<Partial<TrunkFormValues> | undefined>(() => {
    if (!isEditMode || !trunk) return undefined;

    const baseValues: Partial<TrunkFormValues> = {
      name: trunk.name,
      type: "twilio", // Always twilio for this dialog
      direction: trunk.direction,
      status: trunk.status,
    };

    // Populate from Twilio trunk data
    if (twilioTrunk) {
      baseValues.terminationSipDomain = twilioTrunk.terminationSipDomain || twilioTrunk.domainName;
      if (twilioTrunk.originationSipUri != null) {
        baseValues.originationSipUri = twilioTrunk.originationSipUri;
      }

      // Determine credential mode based on whether credential list exists
      if (twilioTrunk.credentialListSid) {
        baseValues.credentialMode = "existing";
        baseValues.credentialListSid = twilioTrunk.credentialListSid;
        baseValues.credentialListName = twilioTrunk.credentialListName || undefined;
      } else {
        baseValues.credentialMode = "create";
      }
    }

    return baseValues;
  }, [isEditMode, trunk, twilioTrunk]);

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
        key={`twilio-${trunk?.id || "new"}-${twilioTrunk?.id || "loading"}`}
        defaultValues={defaultValues}
        onSubmit={handleSuccess}
        submitLabel={isEditMode ? "Update Trunk" : "Create Trunk"}
        isEditMode={isEditMode}
        trunkId={trunk?.id}
        twilioTrunkSid={twilioTrunkId || undefined}
      />
    </BaseTrunkDialog>
  );
}

