"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInboundTrunks,
  createInboundTrunk,
  updateInboundTrunk,
  deleteInboundTrunk,
} from "../api";
import type {
  InboundTrunk,
  CreateInboundTrunkRequest,
  UpdateInboundTrunkRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const inboundTrunksKeys = {
  all: ["admin", "telephony", "inbound-trunks"] as const,
  lists: () => [...inboundTrunksKeys.all, "list"] as const,
  list: () => [...inboundTrunksKeys.lists()] as const,
  details: () => [...inboundTrunksKeys.all, "detail"] as const,
  detail: (id: string) => [...inboundTrunksKeys.details(), id] as const,
};

export function useInboundTrunks() {
  return useQuery<InboundTrunk[], ApiError>({
    queryKey: inboundTrunksKeys.list(),
    queryFn: getInboundTrunks,
  });
}

export function useCreateInboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<InboundTrunk, ApiError, CreateInboundTrunkRequest>({
    mutationFn: createInboundTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboundTrunksKeys.list() });
    },
  });
}

export function useUpdateInboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<
    InboundTrunk,
    ApiError,
    { id: string; data: UpdateInboundTrunkRequest }
  >({
    mutationFn: ({ id, data }) => updateInboundTrunk(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inboundTrunksKeys.list() });
      queryClient.invalidateQueries({ queryKey: inboundTrunksKeys.detail(variables.id) });
    },
  });
}

export function useDeleteInboundTrunk() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteInboundTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inboundTrunksKeys.list() });
    },
  });
}

