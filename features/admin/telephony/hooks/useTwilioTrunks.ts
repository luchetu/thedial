"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTwilioTrunks,
  getTwilioTrunk,
  createTwilioTrunk,
  updateTwilioTrunk,
  deleteTwilioTrunk,
} from "../api";
import type {
  CreateTwilioTrunkRequest,
  UpdateTwilioTrunkRequest,
  TwilioTrunk,
} from "../types";

const twilioTrunksKeys = {
  all: ["admin", "telephony", "twilio-trunks"] as const,
  lists: () => [...twilioTrunksKeys.all, "list"] as const,
  detail: (id: string) => [...twilioTrunksKeys.all, "detail", id] as const,
};

export function useTwilioTrunks(options?: { enabled?: boolean }) {
  return useQuery<TwilioTrunk[], Error>({
    queryKey: twilioTrunksKeys.lists(),
    queryFn: getTwilioTrunks,
    enabled: options?.enabled !== false, // Default to true, but can be disabled
  });
}

export function useTwilioTrunk(id: string, options?: { enabled?: boolean }) {
  return useQuery<TwilioTrunk>({
    queryKey: twilioTrunksKeys.detail(id),
    queryFn: () => getTwilioTrunk(id),
    enabled: options?.enabled !== false && !!id, // Default to true if id exists, but can be disabled
  });
}

export function useCreateTwilioTrunk() {
  const queryClient = useQueryClient();
  return useMutation<TwilioTrunk, Error, CreateTwilioTrunkRequest>({
    mutationFn: createTwilioTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twilioTrunksKeys.lists() });
    },
  });
}

export function useUpdateTwilioTrunk() {
  const queryClient = useQueryClient();
  return useMutation<TwilioTrunk, Error, { id: string; data: UpdateTwilioTrunkRequest }>({
    mutationFn: ({ id, data }) => updateTwilioTrunk(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: twilioTrunksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: twilioTrunksKeys.detail(id) });
    },
  });
}

export function useDeleteTwilioTrunk() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTwilioTrunk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twilioTrunksKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["admin", "telephony", "outbound-trunks"] });
    },
  });
}

