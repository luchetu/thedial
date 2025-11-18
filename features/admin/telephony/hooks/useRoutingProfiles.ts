"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRoutingProfiles,
  getRoutingProfile,
  createRoutingProfile,
  updateRoutingProfile,
  deleteRoutingProfile,
} from "../api";
import type {
  RoutingProfile,
  CreateRoutingProfileRequest,
  UpdateRoutingProfileRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const routingProfileKeys = {
  all: ["admin", "telephony", "routing-profiles"] as const,
  lists: () => [...routingProfileKeys.all, "list"] as const,
  list: (filters?: { country?: string }) =>
    [
      ...routingProfileKeys.lists(),
      filters?.country ?? "all",
    ] as const,
  details: () => [...routingProfileKeys.all, "detail"] as const,
  detail: (id: string) => [...routingProfileKeys.details(), id] as const,
};

export function useRoutingProfiles(filters?: { country?: string }) {
  return useQuery<RoutingProfile[], ApiError>({
    queryKey: routingProfileKeys.list(filters),
    queryFn: () => getRoutingProfiles(filters),
  });
}

export function useRoutingProfile(id: string, options?: { enabled?: boolean }) {
  return useQuery<RoutingProfile, ApiError>({
    queryKey: routingProfileKeys.detail(id),
    queryFn: () => getRoutingProfile(id),
    enabled: options?.enabled ?? Boolean(id),
  });
}

export function useCreateRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<RoutingProfile, ApiError, CreateRoutingProfileRequest>({
    mutationFn: createRoutingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: routingProfileKeys.lists() });
    },
  });
}

export function useUpdateRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<RoutingProfile, ApiError, { id: string; data: UpdateRoutingProfileRequest }>(
    {
      mutationFn: ({ id, data }) => updateRoutingProfile(id, data),
      onSuccess: (profile, { id }) => {
        queryClient.invalidateQueries({ queryKey: routingProfileKeys.lists() });
        queryClient.invalidateQueries({ queryKey: routingProfileKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: routingProfileKeys.detail(profile.id) });
      },
    }
  );
}

export function useDeleteRoutingProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteRoutingProfile,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: routingProfileKeys.lists() });
      queryClient.invalidateQueries({ queryKey: routingProfileKeys.detail(id) });
    },
  });
}
