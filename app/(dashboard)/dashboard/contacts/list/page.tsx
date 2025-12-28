"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ContactList } from "@/components/contacts/ContactList";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { ContactsSecondaryMenu } from "@/components/contacts-secondary-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteContact } from "@/features/contacts/hooks/useDeleteContact";
import type { Contact } from "@/features/contacts/types";
import { useRouter } from "next/navigation";
import { toastError, toastSuccess } from "@/lib/toast";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function ContactsListPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const deleteMutation = useDeleteContact();

  const handleAddContact = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
      try {
        await deleteMutation.mutateAsync(contactToDelete.id);
        toastSuccess("Contact deleted successfully");
        setDeleteDialogOpen(false);
        setContactToDelete(null);
      } catch (error) {
        console.error("Failed to delete contact:", error);
        toastError("Failed to delete contact. Please try again.");
      }
    }
  };

  const handleCall = (contact: Contact) => {
    // Navigate to dial page with contact pre-filled
    router.push(`/dashboard/dial?contact=${contact.id}`);
  };

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Contacts</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <ContactsSecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <div className="flex-1" />
          <Button
            variant="secondary"
            className="flex items-center gap-2 text-white"
            onClick={handleAddContact}
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </header>

        {/* Fixed Title Section */}
        <div className="flex-none px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">My Contacts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your client contacts and call history
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 px-6 pb-6">
          <ContactList
            onCall={handleCall}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            className="h-full"
          />
        </div>
      </div>

      {/* Add/Edit Contact Dialog */}
      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
        onSuccess={() => {
          setEditingContact(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{contactToDelete?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              className="text-white"
              onClick={() => {
                setDeleteDialogOpen(false);
                setContactToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
