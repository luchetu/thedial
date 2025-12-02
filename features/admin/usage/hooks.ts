"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http/client";
import {
  listPlanUsage,
  listNumberUsage,
  type ListPlanUsageParams,
  type ListNumberUsageParams,
  type PlanUsage,
  type NumberUsage,
} from "./api";

export function usePlanUsage(params: ListPlanUsageParams) {
  return useQuery<PlanUsage[], ApiError>({
    queryKey: ["admin", "usage", "plans", params],
    queryFn: () => listPlanUsage(params),
    enabled: Boolean(params.from && params.to),
  });
}

export function useNumberUsage(params: ListNumberUsageParams | null) {
  return useQuery<NumberUsage[], ApiError>({
    queryKey: ["admin", "usage", "numbers", params],
    queryFn: () => {
      if (!params) {
        return Promise.resolve([]);
      }
      return listNumberUsage(params);
    },
    enabled: Boolean(params && params.userId),
  });
}


