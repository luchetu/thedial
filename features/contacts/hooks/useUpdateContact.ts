"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContact } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact, UpdateContactRequest } from "../types";

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<
    Contact,
    unknown,
    { id: string; data: UpdateContactRequest }
  >({
    mutationFn: ({ id, data }) => updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      queryClient.invalidateQueries({
        queryKey: contactsKeys.detail(variables.id),
      });
    },
  });
}





