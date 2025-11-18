"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContact } from "../api";
import { contactsKeys } from "../queryKeys";

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (id) => deleteContact(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      queryClient.removeQueries({ queryKey: contactsKeys.detail(id) });
    },
  });
}

