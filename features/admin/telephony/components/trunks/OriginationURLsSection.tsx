"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WaveLoader } from "@/components/ui/wave-loader";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OriginationURLForm } from "./OriginationURLForm";
import {
  useTwilioOriginationURLs,
  useCreateTwilioOriginationURL,
  useUpdateTwilioOriginationURL,
  useDeleteTwilioOriginationURL,
} from "@/features/admin/telephony/hooks/useTwilioOriginationURLs";
import { getOriginationURLColumns } from "./origination-url-columns";
import type { TwilioOriginationURL } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface OriginationURLsSectionProps {
  trunkSid: string;
  enabled?: boolean;
}

export function OriginationURLsSection({ trunkSid, enabled = true }: OriginationURLsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingURL, setEditingURL] = useState<TwilioOriginationURL | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<TwilioOriginationURL | null>(null);

  const { data: originationURLs = [], isLoading } = useTwilioOriginationURLs(trunkSid, {
    enabled: enabled && !!trunkSid,
  });

  const createMutation = useCreateTwilioOriginationURL();
  const updateMutation = useUpdateTwilioOriginationURL();
  const deleteMutation = useDeleteTwilioOriginationURL();

  const handleCreate = useCallback(() => {
    setEditingURL(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((url: TwilioOriginationURL) => {
    setEditingURL(url);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((url: TwilioOriginationURL) => {
    setUrlToDelete(url);
    setDeleteDialogOpen(true);
  }, []);

  const handleSubmit = async (values: {
    friendlyName: string;
    sipUrl: string;
    priority?: number;
    weight?: number;
    enabled?: boolean;
  }) => {
    console.log("[OriginationURLsSection] handleSubmit called with values:", values);
    console.log("[OriginationURLsSection] trunkSid:", trunkSid);
    console.log("[OriginationURLsSection] editingURL:", editingURL);
    
    try {
      if (editingURL) {
        const updatePayload = {
          trunkSid,
          originationUrlSid: editingURL.sid,
          data: values,
        };
        console.log("[OriginationURLsSection] Update payload:", updatePayload);
        await updateMutation.mutateAsync(updatePayload);
        toastSuccess("Origination URL updated successfully");
      } else {
        const createPayload = {
          trunkSid,
          data: values,
        };
        console.log("[OriginationURLsSection] Create payload:", createPayload);
        await createMutation.mutateAsync(createPayload);
        toastSuccess("Origination URL created successfully");
      }
      setIsDialogOpen(false);
      setEditingURL(null);
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save origination URL");
      throw err;
    }
  };

  const handleConfirmDelete = useCallback(() => {
    if (!urlToDelete) return;

    deleteMutation.mutate(
      {
        trunkSid,
        originationUrlSid: urlToDelete.sid,
      },
      {
        onSuccess: () => {
          toastSuccess("Origination URL deleted successfully");
          setDeleteDialogOpen(false);
          setUrlToDelete(null);
        },
        onError: (mutationError) => {
          toastError(
            `Failed to delete origination URL: ${mutationError?.message || "Unknown error"}`
          );
        },
      }
    );
  }, [urlToDelete, trunkSid, deleteMutation]);

  const columns = useMemo<ColumnDef<TwilioOriginationURL>[]>(
    () =>
      getOriginationURLColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!enabled || !trunkSid) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1">Origination URLs</h3>
            <p className="text-xs text-muted-foreground">
              Configure where Twilio routes inbound calls. You can add multiple URLs for load balancing and failover.
            </p>
          </div>
          <Button
            type="button"
            variant="primary-outline"
            size="sm"
            onClick={handleCreate}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add URL
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
            <WaveLoader className="text-primary" />
            <span>Loading origination URLs...</span>
          </div>
        ) : originationURLs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4">
            No origination URLs configured. Click &ldquo;Add URL&rdquo; to add one.
          </div>
        ) : (
          <DataTable data={originationURLs} columns={columns} />
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingURL ? "Edit Origination URL" : "Add Origination URL"}
            </DialogTitle>
            <DialogDescription>
              {editingURL
                ? "Update the origination URL configuration below."
                : "Add a new origination URL for routing inbound calls."}
            </DialogDescription>
          </DialogHeader>

          <OriginationURLForm
            key={editingURL?.sid || "new"}
            defaultValues={
              editingURL
                ? {
                    friendlyName: editingURL.friendlyName,
                    sipUrl: editingURL.sipUrl,
                    priority: editingURL.priority,
                    weight: editingURL.weight,
                    enabled: editingURL.enabled,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel={editingURL ? "Update URL" : "Add URL"}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Origination URL</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the origination URL &ldquo;{urlToDelete?.friendlyName}&rdquo;?
            This action cannot be undone.
          </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

