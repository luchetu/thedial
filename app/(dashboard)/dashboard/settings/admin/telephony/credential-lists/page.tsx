"use client";

import { useCallback, useMemo, useState } from "react";
import { Key } from "lucide-react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatsGrid } from "@/components/ui/stat-card";
import { toastError, toastSuccess } from "@/lib/toast";
import { CredentialListDialog } from "@/features/admin/telephony/components/credential-lists/CredentialListDialog";
import { CredentialDialog } from "@/features/admin/telephony/components/credential-lists/CredentialDialog";
import {
  useTwilioCredentialLists,
  useDeleteTwilioCredentialList,
  useTwilioCredentials,
} from "@/features/admin/telephony/hooks/useTwilioCredentialLists";
import { getCredentialListColumns } from "@/features/admin/telephony/components/credential-lists/columns";
import type { TwilioCredentialList, TwilioCredential } from "@/features/admin/telephony/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ColumnFiltersState } from "@tanstack/react-table";

export default function CredentialListsPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [credentialListToDelete, setCredentialListToDelete] = useState<TwilioCredentialList | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCredentialList, setEditingCredentialList] = useState<TwilioCredentialList | null>(null);
  const [selectedCredentialList, setSelectedCredentialList] = useState<TwilioCredentialList | null>(null);
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<{ credential: TwilioCredential; listSid: string } | null>(null);

  const {
    data: credentialListsData,
    isLoading,
    error,
  } = useTwilioCredentialLists();
  const credentialLists = useMemo(() => credentialListsData ?? [], [credentialListsData]);

  const deleteCredentialListMutation = useDeleteTwilioCredentialList();

  // Fetch credentials for the selected credential list
  const { data: credentialsData, isLoading: isLoadingCredentials } = useTwilioCredentials(
    selectedCredentialList?.sid || "",
    { enabled: !!selectedCredentialList && isCredentialDialogOpen }
  );
  const credentials = useMemo(() => credentialsData ?? [], [credentialsData]);

  const handleEdit = useCallback((credentialList: TwilioCredentialList) => {
    setEditingCredentialList(credentialList);
    setIsCreateDialogOpen(true);
  }, []);

  const handleDelete = useCallback((credentialList: TwilioCredentialList) => {
    setCredentialListToDelete(credentialList);
    setDeleteDialogOpen(true);
  }, []);

  const handleManageCredentials = useCallback((credentialList: TwilioCredentialList) => {
    // Reset editing state when opening a different credential list
    setEditingCredential(null);
    setSelectedCredentialList(credentialList);
    setIsCredentialDialogOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingCredentialList(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleCreateCredential = useCallback(() => {
    if (!selectedCredentialList) return;
    setEditingCredential(null);
    setIsCredentialDialogOpen(true);
  }, [selectedCredentialList]);

  const handleEditCredential = useCallback((credential: TwilioCredential) => {
    if (!selectedCredentialList) return;
    setEditingCredential({ credential, listSid: selectedCredentialList.sid });
    setIsCredentialDialogOpen(true);
  }, [selectedCredentialList]);

  const handleConfirmDelete = useCallback(() => {
    if (!credentialListToDelete) return;

    deleteCredentialListMutation.mutate(credentialListToDelete.sid, {
      onSuccess: () => {
        toastSuccess("Credential list deleted successfully");
        setDeleteDialogOpen(false);
        setCredentialListToDelete(null);
      },
      onError: (mutationError) => {
        toastError(
          `Failed to delete credential list: ${mutationError?.message || "Unknown error"}`
        );
      },
    });
  }, [credentialListToDelete, deleteCredentialListMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setCredentialListToDelete(null);
  }, []);

  const columns = useMemo(
    () =>
      getCredentialListColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onManageCredentials: handleManageCredentials,
      }),
    [handleEdit, handleDelete, handleManageCredentials]
  );

  const summary = useMemo(() => {
    const total = credentialLists.length;
    // Note: We'd need to fetch credentials for each list to get accurate counts
    // For now, we'll just show the total
    return {
      total,
    };
  }, [credentialLists]);

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Key className="h-6 w-6" />
                  Credential Lists
                </h1>
              </div>
              <Button onClick={handleCreate} variant="secondary" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Create List
              </Button>
            </div>
            {error ? (
              <div className="flex items-center justify-center p-6 text-sm text-destructive">
                {error?.message || "Failed to load credential lists."}
              </div>
            ) : (
              <>
                <StatsGrid
                  stats={[
                    {
                      title: "Total credential lists",
                      value: summary.total,
                      customValue: summary.total === 0 ? (
                        <span className="text-xs font-semibold text-muted-foreground">None</span>
                      ) : undefined
                    },
                  ]}
                  columns={4}
                />

                <DataTable
                  data={credentialLists}
                  columns={columns}
                  columnFilters={columnFilters}
                  onColumnFiltersChange={setColumnFilters}
                  emptyMessage="No credential lists found."
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Credential List Dialog */}
      <CredentialListDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        credentialList={editingCredentialList}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          setEditingCredentialList(null);
        }}
      />

      {/* Manage Credentials Dialog */}
      <CredentialDialog
        open={isCredentialDialogOpen}
        onOpenChange={(open) => {
          setIsCredentialDialogOpen(open);
          // Reset editing state when dialog closes
          if (!open) {
            setEditingCredential(null);
            setSelectedCredentialList(null);
          }
        }}
        credentialList={selectedCredentialList}
        credentials={credentials}
        isLoadingCredentials={isLoadingCredentials}
        editingCredential={editingCredential}
        onCreateCredential={handleCreateCredential}
        onEditCredential={handleEditCredential}
        onSuccess={() => {
          setEditingCredential(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Credential List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the credential list &quot;{credentialListToDelete?.friendlyName}&quot;?
              This action cannot be undone and will remove all credentials in this list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

