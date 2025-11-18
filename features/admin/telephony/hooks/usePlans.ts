"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from "../api";
import type { CreatePlanRequest, Plan, UpdatePlanRequest } from "../types";

const planKeys = {
  all: ["admin", "telephony", "plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  detail: (id: string) => [...planKeys.all, "detail", id] as const,
};

export function usePlans(options?: { enabled?: boolean }) {
  return useQuery<Plan[], Error>({
    queryKey: planKeys.lists(),
    queryFn: getPlans,
    enabled: options?.enabled !== false,
  });
}

export function usePlan(id: string, options?: { enabled?: boolean }) {
  return useQuery<Plan, Error>({
    queryKey: planKeys.detail(id),
    queryFn: () => getPlan(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, CreatePlanRequest>({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation<Plan, Error, { id: string; data: UpdatePlanRequest }>({
    mutationFn: ({ id, data }) => updatePlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePlan,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}
