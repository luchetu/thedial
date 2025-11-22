"use client";

import { useMemo, type ReactElement } from "react";
import { BaseTrunkDialog } from "./BaseTrunkDialog";
import { AddTrunkTwilioForm } from "../AddTrunkTwilioForm";
import { AddTrunkLiveKitOutboundForm } from "../AddTrunkLiveKitOutboundForm";
import { AddTrunkLiveKitInboundForm } from "../AddTrunkLiveKitInboundForm";
import { AddTrunkCustomForm } from "../AddTrunkCustomForm";
import { useTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type { Trunk } from "@/features/admin/telephony/types";
import type { TrunkFormValues } from "../types";

interface TrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: Trunk | null;
  trunkType?: Trunk["type"] | null; // For create mode when trunk is not provided
  onSuccess?: () => void;
}

// Common form props interface
interface CommonFormProps {
  defaultValues?: Partial<TrunkFormValues>;
  onSubmit?: () => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isEditMode?: boolean;
  trunkId?: string;
}

// Registry pattern: Maps trunk types to their configurations
type TrunkTypeConfig = {
  formComponent: (props: CommonFormProps & Record<string, unknown>) => ReactElement;
  getTitle: (isEditMode: boolean) => string;
  getDescription: (isEditMode: boolean) => string;
  getKey: (trunkId?: string) => string;
  getDefaultValues?: (trunk: Trunk | null, isEditMode: boolean) => Partial<TrunkFormValues> | undefined;
  getFormProps?: (trunk: Trunk | null, trunkData: Trunk | null) => Record<string, unknown>;
};

const trunkTypeRegistry: Record<Trunk["type"], TrunkTypeConfig> = {
  twilio: {
    formComponent: AddTrunkTwilioForm,
    getTitle: (isEditMode) => isEditMode ? "Edit Twilio Trunk" : "Create Twilio Trunk",
    getDescription: (isEditMode) =>
      isEditMode
        ? "Update Twilio trunk configuration below."
        : "Create a new Twilio trunk for routing calls.",
    getKey: (trunkId) => `twilio-${trunkId || "new"}`,
    getDefaultValues: (trunk, isEditMode) => {
      if (!isEditMode || !trunk) return undefined;
      return {
        name: trunk.name,
        type: "twilio",
        direction: trunk.direction,
        status: trunk.status,
      };
    },
    getFormProps: (trunk, trunkData) => ({
      twilioTrunkSid: trunkData?.externalId || trunk?.externalId || undefined,
    }),
  },
  livekit_outbound: {
    formComponent: AddTrunkLiveKitOutboundForm,
    getTitle: (isEditMode) => isEditMode ? "Edit LiveKit Outbound Trunk" : "Create LiveKit Outbound Trunk",
    getDescription: (isEditMode) =>
      isEditMode
        ? "Update LiveKit outbound trunk configuration below."
        : "Create a new LiveKit outbound trunk for routing calls.",
    getKey: (trunkId) => `livekit-outbound-${trunkId || "new"}`,
    getDefaultValues: (trunk, isEditMode) => {
      if (!isEditMode) {
        return {
          type: "livekit_outbound",
          direction: "outbound",
        };
      }
      if (!trunk) return undefined;
      return {
        name: trunk.name,
        type: trunk.type,
        direction: trunk.direction,
        status: trunk.status,
      };
    },
  },
  livekit_inbound: {
    formComponent: AddTrunkLiveKitInboundForm,
    getTitle: (isEditMode) => isEditMode ? "Edit LiveKit Inbound Trunk" : "Create LiveKit Inbound Trunk",
    getDescription: (isEditMode) =>
      isEditMode
        ? "Update LiveKit inbound trunk configuration below."
        : "Create a new LiveKit inbound trunk for routing calls.",
    getKey: (trunkId) => `livekit-inbound-${trunkId || "new"}`,
    getDefaultValues: (trunk, isEditMode) => {
      if (!isEditMode) {
        return {
          type: "livekit_inbound",
          direction: "inbound",
        };
      }
      if (!trunk) return undefined;
      return {
        name: trunk.name,
        type: trunk.type,
        direction: trunk.direction,
        status: trunk.status,
      };
    },
  },
  custom: {
    formComponent: AddTrunkCustomForm,
    getTitle: (isEditMode) => isEditMode ? "Edit Custom Trunk" : "Create Custom Trunk",
    getDescription: (isEditMode) =>
      isEditMode
        ? "Update custom trunk configuration below."
        : "Create a new custom trunk for routing calls.",
    getKey: (trunkId) => `custom-${trunkId || "new"}`,
    getDefaultValues: (trunk, isEditMode) => {
      if (!isEditMode) {
        return {
          type: "custom",
          direction: "outbound",
        };
      }
      if (!trunk) return undefined;
      return {
        name: trunk.name,
        type: trunk.type,
        direction: trunk.direction,
        status: trunk.status,
      };
    },
  },
};

export function TrunkDialog({
  open,
  onOpenChange,
  trunk,
  trunkType,
  onSuccess,
}: TrunkDialogProps) {
  const isEditMode = !!trunk;
  
  // Determine trunk type: use trunk type if editing, otherwise use trunkType prop
  const type = trunk?.type || trunkType;

  // Fetch full trunk data with configuration when editing (hooks must be called before early returns)
  const { data: fullTrunkData } = useTrunk(trunk?.id || "", {
    enabled: isEditMode && !!trunk?.id && open,
  });

  // Use fullTrunkData if available, otherwise fall back to trunk prop
  const trunkData = fullTrunkData || trunk || null;

  // Get config early (before early returns)
  const config = type ? trunkTypeRegistry[type] : null;
  
  // Parse default values - only basic trunk info, not configuration
  // Configuration is handled separately via Configuration dialogs
  const defaultValues = useMemo<Partial<TrunkFormValues> | undefined>(() => {
    if (!config || !config.getDefaultValues) return undefined;
    
    if (trunkData && isEditMode) {
      return config.getDefaultValues(trunkData, isEditMode);
    }
    if (!isEditMode) {
      return config.getDefaultValues(null, false);
    }
    return undefined;
  }, [config, trunkData, isEditMode]);

  if (!type) {
    // No trunk type specified - dialog should not render
    return null;
  }

  if (!config) {
    console.error(`Unknown trunk type: ${type}`);
    return null;
  }

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const FormComponent = config.formComponent;
  const formProps = {
    key: config.getKey(trunk?.id),
    defaultValues,
    onSubmit: handleSuccess,
    submitLabel: isEditMode ? "Update Trunk" : "Create Trunk",
    isEditMode,
    trunkId: trunk?.id,
    ...(config.getFormProps ? config.getFormProps(trunk || null, trunkData || null) : {}),
  };

  return (
    <BaseTrunkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={config.getTitle(isEditMode)}
      description={config.getDescription(isEditMode)}
    >
      <FormComponent {...formProps} />
    </BaseTrunkDialog>
  );
}

