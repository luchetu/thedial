"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DispatchRuleForm } from "./DispatchRuleForm";
import {
  useCreateDispatchRule,
  useUpdateDispatchRule,
} from "@/features/admin/telephony/hooks/useDispatchRules";
import type {
  DispatchRule,
  CreateDispatchRuleRequest,
  UpdateDispatchRuleRequest,
} from "@/features/admin/telephony/types";
import { useInboundTrunks } from "@/features/admin/telephony/hooks/useInboundTrunks";
import { toastError, toastSuccess } from "@/lib/toast";
import { useEffect, useMemo } from "react";

interface DispatchRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: DispatchRule | null;
  onSuccess?: () => void;
}

export const DispatchRuleDialog = ({
  open,
  onOpenChange,
  rule,
  onSuccess,
}: DispatchRuleDialogProps) => {
  const createMutation = useCreateDispatchRule();
  const updateMutation = useUpdateDispatchRule();
  const {
    data: inboundTrunks = [],
    isLoading: isLoadingTrunks,
    isError: isInboundError,
    error: inboundError,
  } = useInboundTrunks();

  const isEditMode = !!rule;

  useEffect(() => {
    if (isInboundError && inboundError) {
      toastError(inboundError.message || "Failed to load trunks");
    }
  }, [isInboundError, inboundError]);

  useEffect(() => {
    if (!isLoadingTrunks && !isEditMode && open && inboundTrunks.length === 0) {
      toastError("Create a LiveKit trunk before adding a dispatch rule.");
      onOpenChange(false);
    }
  }, [isLoadingTrunks, inboundTrunks.length, open, isEditMode, onOpenChange]);

  const trunkOptions = (() => {
    const base = inboundTrunks.map((trunk) => ({
      id: trunk.trunkId,
      name: trunk.name,
    }));

    if (isEditMode && rule?.trunkIds && rule.trunkIds.length > 0) {
      const existingIds = new Set(base.map((opt) => opt.id));
      rule.trunkIds.forEach((id) => {
        if (!existingIds.has(id)) {
          base.push({ id, name: id });
        }
      });
    }

    return base;
  })();

  const handleSubmit = async (values: CreateDispatchRuleRequest) => {
    try {
      if (isEditMode && rule) {
        const payload: UpdateDispatchRuleRequest = {
          name: values.name,
          agentName: values.agentName || undefined,
          autoDispatch: values.autoDispatch ?? false,
          hidePhoneNumber: values.hidePhoneNumber ?? false,
        };

        if (values.type && values.type !== rule.type) {
          payload.type = values.type;
        }

        if (Array.isArray(values.trunkIds)) {
          payload.trunkIds = { set: values.trunkIds };
        }

        if (values.type === "individual") {
          payload.roomPrefix = values.roomPrefix || undefined;
          payload.pin = values.pin || undefined;
          payload.roomName = undefined;
          payload.randomize = undefined;
        } else if (values.type === "direct") {
          payload.roomName = values.roomName || undefined;
          payload.pin = values.pin || undefined;
          payload.roomPrefix = undefined;
          payload.randomize = undefined;
        } else if (values.type === "callee") {
          payload.roomPrefix = values.roomPrefix || undefined;
          payload.pin = values.pin || undefined;
          payload.randomize = values.randomize ?? false;
          payload.roomName = undefined;
        }

        await updateMutation.mutateAsync({ id: rule.id, data: payload });
        toastSuccess("Dispatch rule updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        toastSuccess("Dispatch rule created successfully");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toastError(
        isEditMode
          ? "Failed to update dispatch rule. Please try again."
          : "Failed to create dispatch rule. Please try again."
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Dispatch Rule" : "Create Dispatch Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update dispatch rule configuration below."
              : "Create a new dispatch rule to route incoming calls to rooms or agents."}
          </DialogDescription>
        </DialogHeader>

        <DispatchRuleForm
          key={rule?.id || "new"}
          defaultValues={
            rule
              ? {
                  name: rule.name,
                  type: rule.type,
                  roomPrefix: rule.roomPrefix ?? "",
                  roomName: rule.roomName ?? "",
                  pin: rule.pin ?? "",
                  randomize: rule.randomize ?? false,
                  agentName: rule.agentName ?? "",
                  autoDispatch: rule.autoDispatch ?? false,
                  hidePhoneNumber: rule.hidePhoneNumber ?? false,
                  trunkIds: rule.trunkIds ?? [],
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={isEditMode ? "Save changes" : "Create Rule"}
          trunkOptions={trunkOptions}
          isTrunkLoading={isLoadingTrunks}
        />
      </DialogContent>
    </Dialog>
  );
};

