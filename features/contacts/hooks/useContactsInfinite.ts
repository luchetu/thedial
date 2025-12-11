"use client";

import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getContacts } from "../api";
import { contactsKeys } from "../queryKeys";
import type { Contact } from "../types";

const PAGE_SIZE = 50;

export function useContactsInfinite(params?: {
  search?: string;
  sort?: string;
}) {
  const queryKey = [...contactsKeys.list(params), "infinite"] as const;

  return useInfiniteQuery<Contact[], Error, InfiniteData<Contact[]>, typeof queryKey, number>({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      getContacts({
        ...params,
        limit: PAGE_SIZE,
        offset: pageParam * PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than PAGE_SIZE, we've reached the end
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, return the next page number
      return allPages.length;
    },
    initialPageParam: 0,
    placeholderData: (previousData) => previousData,
  });
}

