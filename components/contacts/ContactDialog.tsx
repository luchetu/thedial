"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";
import { useCreateContact } from "@/features/contacts/hooks/useCreateContact";
import { useUpdateContact } from "@/features/contacts/hooks/useUpdateContact";
import type { Contact, CreateContactRequest, UpdateContactRequest } from "@/features/contacts/types";
import { toastError, toastSuccess } from "@/lib/toast";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export const ContactDialog = ({
  open,
  onOpenChange,
  contact,
  onSuccess,
}: ContactDialogProps) => {
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const isEditMode = !!contact;

  const handleSubmit = async (
    values: CreateContactRequest | UpdateContactRequest
  ) => {
    try {
      if (isEditMode && contact) {
        await updateMutation.mutateAsync({
          id: contact.id,
          data: values as UpdateContactRequest,
        });
        toastSuccess("Contact updated successfully");
      } else {
        await createMutation.mutateAsync(values as CreateContactRequest);
        toastSuccess("Contact created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toastError(
        isEditMode
          ? "Failed to update contact. Please try again."
          : "Failed to create contact. Please try again."
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Contact" : "Add New Contact"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update contact information below."
              : "Add a new client contact to your list."}
          </DialogDescription>
        </DialogHeader>

        <ContactForm
          key={contact?.id || "new"}
          defaultValues={
            contact
              ? {
                  name: contact.name,
                  phone_number: contact.phone_number,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={isEditMode ? "Update Contact" : "Add Contact"}
        />
      </DialogContent>
    </Dialog>
  );
};

