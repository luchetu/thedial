"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getContacts } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact } from "../types";

export function useContacts(params?: {
  search?: string;
  sort?: string;
}) {
  return useQuery<Contact[]>({
    queryKey: contactsKeys.list(params),
    queryFn: () => getContacts(params),
    placeholderData: keepPreviousData,
  });
}

