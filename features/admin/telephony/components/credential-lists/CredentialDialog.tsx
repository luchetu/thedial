"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { WaveLoader } from "@/components/ui/wave-loader";
import { CredentialForm } from "./CredentialForm";
import {
  useCreateTwilioCredential,
  useUpdateTwilioCredential,
  useDeleteTwilioCredential,
} from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import { getCredentialColumns } from "./credential-columns";
import type { TwilioCredentialList, TwilioCredential } from "@/features/admin/telephony/types";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  Dialog as ConfirmDialog,
  DialogContent as ConfirmDialogContent,
  DialogDescription as ConfirmDialogDescription,
  DialogFooter,
  DialogHeader as ConfirmDialogHeader,
  DialogTitle as ConfirmDialogTitle,
} from "@/components/ui/dialog";

interface CredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentialList: TwilioCredentialList | null;
  credentials: TwilioCredential[];
  isLoadingCredentials?: boolean;
  editingCredential: { credential: TwilioCredential; listSid: string } | null;
  onCreateCredential: () => void;
  onEditCredential: (credential: TwilioCredential) => void;
  onSuccess?: () => void;
}

export const CredentialDialog = ({
  open,
  onOpenChange,
  credentialList,
  credentials,
  isLoadingCredentials = false,
  editingCredential,
  onCreateCredential,
  onEditCredential,
  onSuccess,
}: CredentialDialogProps) => {
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<{ credential: TwilioCredential; listSid: string } | null>(null);

  const createMutation = useCreateTwilioCredential();
  const updateMutation = useUpdateTwilioCredential();
  const deleteMutation = useDeleteTwilioCredential();

  const isEditMode = Boolean(editingCredential);

  // Show form when editing or manually opened
  const shouldShowForm = open && (Boolean(editingCredential) || manualFormOpen);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setManualFormOpen(false);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    if (!credentialList) return;

    try {
      if (isEditMode && editingCredential) {
        // Note: Username cannot be updated, only password
        await updateMutation.mutateAsync({
          credentialListSid: editingCredential.listSid,
          credentialSid: editingCredential.credential.sid,
          data: { password: values.password },
        });
        toastSuccess("Credential updated successfully");
      } else {
        await createMutation.mutateAsync({
          credentialListSid: credentialList.sid,
          data: {
            username: values.username,
            password: values.password,
          },
        });
        toastSuccess("Credential created successfully");
      }
      setManualFormOpen(false);
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toastError(err.message || "Failed to save credential");
      throw err;
    }
  };

  const handleDelete = useCallback((credential: TwilioCredential) => {
    if (!credentialList) return;
    setCredentialToDelete({ credential, listSid: credentialList.sid });
    setDeleteDialogOpen(true);
  }, [credentialList]);

  const handleConfirmDelete = useCallback(() => {
    if (!credentialToDelete) return;

    deleteMutation.mutate(
      {
        credentialListSid: credentialToDelete.listSid,
        credentialSid: credentialToDelete.credential.sid,
      },
      {
        onSuccess: () => {
          toastSuccess("Credential deleted successfully");
          setDeleteDialogOpen(false);
          setCredentialToDelete(null);
        },
        onError: (mutationError) => {
          toastError(
            `Failed to delete credential: ${mutationError?.message || "Unknown error"}`
          );
        },
      }
    );
  }, [credentialToDelete, deleteMutation]);

  const columns = getCredentialColumns({
    onEdit: onEditCredential,
    onDelete: handleDelete,
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Credentials - {credentialList?.friendlyName}
            </DialogTitle>
            <DialogDescription>
              Add, edit, or remove credentials from this credential list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  onCreateCredential();
                  setManualFormOpen(true);
                }}
                disabled={!credentialList}
              >
                Add Credential
              </Button>
            </div>

            {shouldShowForm && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <CredentialForm
                  key={editingCredential?.credential.sid || "new"}
                  defaultValues={
                    editingCredential
                      ? {
                          username: editingCredential.credential.username,
                          password: "", // Don't show existing password
                        }
                      : undefined
                  }
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  submitLabel={isEditMode ? "Update Password" : "Create Credential"}
                  isEditMode={isEditMode}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setManualFormOpen(false);
                    // Reset editing state when canceling
                    onSuccess?.();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}

            {isLoadingCredentials ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
                <WaveLoader className="text-primary" />
                <span>Loading credentials...</span>
              </div>
            ) : (
              <DataTable
                data={credentials}
                columns={columns}
                emptyMessage="No credentials found."
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ConfirmDialogContent>
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Delete Credential</ConfirmDialogTitle>
            <ConfirmDialogDescription>
              Are you sure you want to delete the credential &quot;{credentialToDelete?.credential.username}&quot;?
              This action cannot be undone.
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </>
  );
};

