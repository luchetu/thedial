"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InboundTrunkForm } from "./InboundTrunkForm";
import { useCreateInboundTrunk, useUpdateInboundTrunk } from "@/features/admin/telephony/hooks/useInboundTrunks";
import type { InboundTrunk, CreateInboundTrunkRequest, UpdateInboundTrunkRequest } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface InboundTrunkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trunk?: InboundTrunk | null; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export const InboundTrunkDialog = ({
  open,
  onOpenChange,
  trunk,
  onSuccess,
}: InboundTrunkDialogProps) => {
  const createMutation = useCreateInboundTrunk();
  const updateMutation = useUpdateInboundTrunk();

  const isEditMode = !!trunk;

  const handleSubmit = async (values: CreateInboundTrunkRequest) => {
    try {
      if (isEditMode && trunk) {
        const updatePayload: UpdateInboundTrunkRequest = {
          name: values.name,
          numbers: { set: values.numbers ?? [] },
          allowedNumbers: { set: values.allowedNumbers ?? [] },
          allowedAddresses: { set: values.allowedAddresses ?? [] },
        };
 
        if (typeof values.authUsername !== "undefined") {
          const trimmed = values.authUsername?.trim() ?? "";
          if (trimmed !== (trunk.authUsername ?? "")) {
            updatePayload.authUsername = trimmed;
          }
        }

        if (typeof values.authPassword === "string" && values.authPassword.trim() !== "") {
          updatePayload.authPassword = values.authPassword.trim();
        }

        if (typeof values.krispEnabled !== "undefined" && values.krispEnabled !== trunk.krispEnabled) {
          updatePayload.krispEnabled = values.krispEnabled;
        }

        if (values.metadata !== undefined) {
          updatePayload.metadata = values.metadata;
        }

        if (typeof values.status !== "undefined" && (values.status ?? "").toLowerCase() !== (trunk.status ?? "active").toLowerCase()) {
          updatePayload.status = values.status;
        }
 
        await updateMutation.mutateAsync({
          id: trunk.id,
          data: updatePayload,
        });
        toastSuccess("Inbound trunk updated successfully");
      } else {
        await createMutation.mutateAsync(values);
        toastSuccess("Inbound trunk created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toastError(
        isEditMode
          ? `Failed to update inbound trunk: ${err.message}`
          : `Failed to create inbound trunk: ${err.message}`
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl pt-6 pl-6">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? "Edit Inbound Trunk" : "Create Inbound Trunk"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update inbound trunk configuration below."
              : "Create a new LiveKit inbound trunk to receive calls from Twilio."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 pr-6 space-y-4">
          {isEditMode && trunk && (
            <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-2">
              <div className="flex flex-col">
                <span className="text-muted-foreground">LiveKit SIP Address</span>
                <span className="font-mono break-all">{trunk.sipAddress ?? "-"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Current Auth Username</span>
                <span className="font-mono">{trunk.authUsername ?? "None"}</span>
              </div>
            </div>
          )}
          <InboundTrunkForm
            key={trunk?.id || "new"}
            defaultValues={
              trunk
                ? {
                    name: trunk.name,
                    numberMode: trunk.numbers.length === 0 ? "any" : "specific",
                    numbers: trunk.numbers,
                    allowedNumbers: trunk.allowedNumbers ?? [],
                    allowedAddresses: trunk.allowedAddresses ?? [],
                    krispEnabled: trunk.krispEnabled,
                    authUsername: trunk.authUsername ?? "",
                    metadata: trunk.metadata ? JSON.stringify(trunk.metadata, null, 2) : "",
                    status: trunk.status ?? "active",
                  }
                : {
                    numberMode: "any",
                    numbers: [],
                    allowedNumbers: [],
                    allowedAddresses: [],
                    status: "active",
                  }
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

