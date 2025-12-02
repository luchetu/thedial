"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listUserCalls } from "../api";
import type { CallRecord } from "../api";
import type { ApiError } from "@/lib/http/client";

const PAGE_SIZE = 50;

export function useCallsInfinite(params?: {
  direction?: string;
  status?: string;
}) {
  const queryKey = ["calls", "infinite", params] as const;

  return useInfiniteQuery<CallRecord[], ApiError, CallRecord[], typeof queryKey, number>({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      listUserCalls({
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

