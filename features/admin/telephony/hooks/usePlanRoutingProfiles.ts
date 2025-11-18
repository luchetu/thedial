"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPlanRoutingProfiles,
  getPlanRoutingProfile,
  createPlanRoutingProfile,
  updatePlanRoutingProfile,
  deletePlanRoutingProfile,
} from "../api";
import type {
  PlanRoutingProfile,
  CreatePlanRoutingProfileRequest,
  UpdatePlanRoutingProfileRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const planRoutingProfileKeys = {
  all: ["admin", "telephony", "plan-routing-profiles"] as const,
  lists: () => [...planRoutingProfileKeys.all, "list"] as const,
  list: (planCode?: string) =>
    [
      ...planRoutingProfileKeys.lists(),
      planCode ?? "all",
    ] as const,
  details: () => [...planRoutingProfileKeys.all, "detail"] as const,
  detail: (id: string) => [...planRoutingProfileKeys.details(), id] as const,
};

export function usePlanRoutingProfiles(planCode?: string) {
  return useQuery<PlanRoutingProfile[], ApiError>({
    queryKey: planRoutingProfileKeys.list(planCode),
    queryFn: () => getPlanRoutingProfiles(planCode),
  });
}

export function usePlanRoutingProfile(id: string, options?: { enabled?: boolean }) {
  return useQuery<PlanRoutingProfile, ApiError>({
    queryKey: planRoutingProfileKeys.detail(id),
    queryFn: () => getPlanRoutingProfile(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreatePlanRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<PlanRoutingProfile, ApiError, CreatePlanRoutingProfileRequest>({
    mutationFn: createPlanRoutingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.lists() });
    },
  });
}

export function useUpdatePlanRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    PlanRoutingProfile,
    ApiError,
    { id: string; data: UpdatePlanRoutingProfileRequest }
  >({
    mutationFn: ({ id, data }) => updatePlanRoutingProfile(id, data),
    onSuccess: (mapping, { id }) => {
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.detail(mapping.id) });
    },
  });
}

export function useDeletePlanRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deletePlanRoutingProfile,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planRoutingProfileKeys.detail(id) });
    },
  });
}

