"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOutboundTrunks,
  createOutboundTrunk,
  updateOutboundTrunk,
  deleteOutboundTrunk,
} from "../api";
import type {
  OutboundTrunk,
  CreateOutboundTrunkRequest,
  UpdateOutboundTrunkRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const queryKeys = {
  all: ["admin", "telephony", "outbound-trunks"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: () => [...queryKeys.lists()] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

export function useOutboundTrunks() {
  return useQuery<OutboundTrunk[], ApiError>({
    queryKey: queryKeys.list(),
    queryFn: getOutboundTrunks,
  });
}

export function useCreateOutboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<OutboundTrunk, ApiError, CreateOutboundTrunkRequest>({
    mutationFn: createOutboundTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
    },
  });
}

export function useUpdateOutboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<
    OutboundTrunk,
    ApiError,
    { id: string; data: UpdateOutboundTrunkRequest }
  >({
    mutationFn: ({ id, data }) => updateOutboundTrunk(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteOutboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteOutboundTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.list() });
    },
  });
}


