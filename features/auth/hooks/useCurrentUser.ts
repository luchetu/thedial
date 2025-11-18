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
      return failureCount < 2;
    },
  });
}


