"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrunkForm } from "./TrunkForm";
import { TrunkMultiStepForm } from "./TrunkMultiStepForm";
import { useUpdateTrunk } from "@/features/admin/telephony/hooks/useTrunks";
import type {
  Trunk,
  CreateTrunkRequest,
  UpdateTrunkRequest,
} from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface TrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: Trunk | null; // If provided, edit mode; otherwise, create mode
  initialType?: Trunk["type"] | null; // Initial trunk type for create mode
  configurationOnly?: boolean; // If true, show only configuration form
  onSuccess?: () => void;
}

export const TrunkDialog = ({
  open,
  onOpenChange,
  trunk,
  initialType,
  configurationOnly = false,
  onSuccess,
}: TrunkDialogProps) => {
  const updateMutation = useUpdateTrunk();

  const isEditMode = !!trunk;

  const handleSubmit = async (values: CreateTrunkRequest | UpdateTrunkRequest) => {
    try {
      if (isEditMode && trunk) {
        await updateMutation.mutateAsync({
          id: trunk.id,
          data: values as UpdateTrunkRequest,
        });
        toastSuccess("Trunk updated successfully");
        onOpenChange(false);
        onSuccess?.();
      }
      // For create mode, TrunkMultiStepForm handles its own submission
    } catch (error) {
      const err = error as Error;
      toastError(`Failed to update trunk: ${err.message}`);
    }
  };

  const handleMultiStepSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {configurationOnly ? "Configure Trunk" : isEditMode ? "Edit Trunk" : "Create Trunk"}
          </DialogTitle>
          <DialogDescription>
            {configurationOnly
              ? "Update trunk configuration settings below."
              : isEditMode
              ? "Update trunk configuration below."
              : "Create a new trunk for routing calls."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {configurationOnly && trunk ? (
            // Configuration-only mode: Show only configuration form
            <TrunkForm
              key={`config-${trunk.id}`}
              defaultValues={{
                name: trunk.name,
                type: trunk.type,
                direction: trunk.direction,
                status: trunk.status,
              }}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Update Configuration"
              mode="configuration-only"
              lockType={true}
            />
          ) : isEditMode ? (
            // Edit mode: Multi-step form (consistent with create mode)
            <TrunkMultiStepForm
              key={`edit-${trunk?.id}`}
              defaultValues={{
                name: trunk.name,
                type: trunk.type,
                direction: trunk.direction,
                status: trunk.status,
                // TODO: Load configuration values from trunk_configurations table
                // For now, these will be empty and user needs to re-enter
              }}
              onSubmit={handleMultiStepSuccess}
              submitLabel="Update Configuration"
              lockType={true} // Lock type in edit mode
              isEditMode={true}
              trunkId={trunk.id}
            />
          ) : (
            // Create mode: Multi-step form
            <TrunkMultiStepForm
              key={`new-${initialType || "default"}`}
              defaultValues={
                initialType
                  ? {
                      type: initialType,
                      direction: initialType === "livekit_inbound" 
                        ? "inbound" 
                        : initialType === "twilio"
                        ? "outbound" // Twilio trunks are outbound only
                        : "outbound", // Default for livekit_outbound and custom
                    }
                  : undefined
              }
              onSubmit={handleMultiStepSuccess}
              submitLabel="Configure Trunk"
              lockType={!!initialType} // Lock type if pre-selected
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

