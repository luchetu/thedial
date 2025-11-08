"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContact } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact, CreateContactRequest } from "../types";

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, unknown, CreateContactRequest>({
    mutationFn: (data) => createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
    },
  });
}

