"use client";

import { useQuery } from "@tanstack/react-query";
import { getContact } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact } from "../types";

export function useContact(id: string) {
  return useQuery<Contact>({
    queryKey: contactsKeys.detail(id),
    queryFn: () => getContact(id),
    enabled: Boolean(id),
  });
}

