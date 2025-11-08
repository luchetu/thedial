"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDefaultContact } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact } from "../types";

export function useSetDefaultContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, unknown, string>({
    mutationFn: (id) => setDefaultContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
    },
  });
}

