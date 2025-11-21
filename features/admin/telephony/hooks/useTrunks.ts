"use client";

import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import {
  getTrunks,
  getTrunk,
  createTrunk,
  updateTrunk,
  deleteTrunk,
  configureTrunk,
  getRoutingProfilesByTrunk,
} from "../api";
import type {
  Trunk,
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
  ListTrunksFilters,
  RoutingProfile,
} from "../types";
import type { ApiError } from "@/lib/http/client";

export const trunksKeys = {
  all: ["admin", "telephony", "trunks"] as const,
  lists: () => [...trunksKeys.all, "list"] as const,
  list: (filters?: ListTrunksFilters) => [...trunksKeys.lists(), filters] as const,
  details: () => [...trunksKeys.all, "detail"] as const,
  detail: (id: string) => [...trunksKeys.details(), id] as const,
  routingProfiles: (id: string) => [...trunksKeys.detail(id), "routing-profiles"] as const,
};

export function useTrunks(filters?: ListTrunksFilters) {
  return useQuery<Trunk[], ApiError>({
    queryKey: trunksKeys.list(filters),
    queryFn: () => getTrunks(filters),
  });
}

export function useTrunk(id: string, options?: { enabled?: boolean }) {
  return useQuery<Trunk, ApiError>({
    queryKey: trunksKeys.detail(id),
    queryFn: () => getTrunk(id),
    enabled: options?.enabled !== false && !!id,
  });
}

export function useCreateTrunk() {
  const queryClient = useQueryClient();
  return useMutation<Trunk, ApiError, CreateTrunkRequest>({
    mutationFn: createTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trunksKeys.lists() });
    },
  });
}

export function useUpdateTrunk() {
  const queryClient = useQueryClient();
  return useMutation<Trunk, ApiError, { id: string; data: UpdateTrunkRequest }>({
    mutationFn: ({ id, data }) => updateTrunk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: trunksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trunksKeys.detail(id) });
    },
  });
}

export function useDeleteTrunk() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trunksKeys.lists() });
    },
  });
}

export function useConfigureTrunk() {
  const queryClient = useQueryClient();
  return useMutation<Trunk, ApiError, { id: string; data: ConfigureTrunkRequest }>({
    mutationFn: ({ id, data }) => configureTrunk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: trunksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trunksKeys.detail(id) });
    },
  });
}

export function useRoutingProfilesByTrunk(trunkId: string, options?: { enabled?: boolean }) {
  return useQuery<{ outbound: RoutingProfile[]; inbound: RoutingProfile[] }, ApiError>({
    queryKey: trunksKeys.routingProfiles(trunkId),
    queryFn: () => getRoutingProfilesByTrunk(trunkId),
    enabled: options?.enabled !== false && !!trunkId,
  });
}

export function useRoutingProfilesForAllTrunks(trunks: Trunk[]) {
  return useQueries({
    queries: trunks.map((trunk) => ({
      queryKey: trunksKeys.routingProfiles(trunk.id),
      queryFn: () => getRoutingProfilesByTrunk(trunk.id),
      enabled: !!trunk.id,
    })),
  });
}

