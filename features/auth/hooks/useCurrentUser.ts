"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api";
import type { CurrentUser } from "../types";
import type { ApiError } from "@/lib/http/client";

const authKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  return useQuery<CurrentUser, ApiError>({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401)
      if (error?.status === 401) {
        return false;
      }
      // Retry up to 2 times for other errors (network issues, etc.)
      return failureCount < 2;
    },
    // Keep the query active and refetch on mount
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // Don't immediately mark as stale
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep in cache longer
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}


