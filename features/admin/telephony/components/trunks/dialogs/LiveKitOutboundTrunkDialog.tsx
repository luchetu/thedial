"use client";

import { useMemo } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { AddTrunkLiveKitOutboundForm } from "../AddTrunkLiveKitOutboundForm";
import { useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type { Trunk } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";

interface LiveKitOutboundTrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: Trunk | null;
  onSuccess?: () => void;
}

export function LiveKitOutboundTrunkDialog({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: LiveKitOutboundTrunkDialogProps) {
  const isEditMode = !!trunk;

  // Fetch full trunk data with configuration when editing
  // TODO: Use fullTrunkData to populate configuration fields when available
  useTrunk(trunk?.id || "", {
    enabled: isEditMode && !!trunk?.id && open,
  });

  // Parse configuration from trunk data
  const defaultValues = useMemo<Partial<TrunkFormValues> | undefined>(() => {
    if (!isEditMode || !trunk) {
      // Create mode: Set default type and direction
      return {
        type: "livekit_outbound",
        direction: "outbound",
      };
    }

    // Edit mode: Use trunk data
    const baseValues: Partial<TrunkFormValues> = {
      name: trunk.name,
      type: trunk.type,
      direction: trunk.direction,
      status: trunk.status,
    };

    // TODO: Populate LiveKit Outbound specific fields from fullTrunkData.configuration
    // This would require checking the trunk configuration data structure

    return baseValues;
  }, [isEditMode, trunk]);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Edit LiveKit Outbound Trunk" : "Create LiveKit Outbound Trunk"}
      description={
        isEditMode
          ? "Update LiveKit outbound trunk configuration below."
          : "Create a new LiveKit outbound trunk for routing calls."
      }
    >
      <AddTrunkLiveKitOutboundForm
        key={`livekit-outbound-${trunk?.id || "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSuccess}
        submitLabel={isEditMode ? "Update Trunk" : "Create Trunk"}
        isEditMode={isEditMode}
        trunkId={trunk?.id}
      />
    </BaseTrunkDialog>
  );
}

