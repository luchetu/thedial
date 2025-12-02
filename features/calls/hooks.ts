"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http/client";
import { listUserCalls, type CallRecord, type ListUserCallsParams } from "./api";

const callsKeys = {
  list: (params: ListUserCallsParams) => ["calls", "list", params] as const,
};

export function useUserCalls(params: ListUserCallsParams = {}) {
  return useQuery<CallRecord[], ApiError>({
    queryKey: callsKeys.list(params),
    queryFn: () => listUserCalls(params),
  });
}


