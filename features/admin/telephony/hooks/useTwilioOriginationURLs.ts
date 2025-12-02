"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTwilioOriginationURLs,
  getTwilioOriginationURL,
  createTwilioOriginationURL,
  updateTwilioOriginationURL,
  deleteTwilioOriginationURL,
} from "../api";
import type {
  TwilioOriginationURL,
  CreateTwilioOriginationURLRequest,
  UpdateTwilioOriginationURLRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const twilioOriginationURLsKeys = {
  all: ["admin", "telephony", "twilio-origination-urls"] as const,
  lists: (trunkSid: string) => [...twilioOriginationURLsKeys.all, "list", trunkSid] as const,
  detail: (trunkSid: string, originationUrlSid: string) =>
    [...twilioOriginationURLsKeys.all, "detail", trunkSid, originationUrlSid] as const,
};

export function useTwilioOriginationURLs(trunkSid: string, options?: { enabled?: boolean }) {
  return useQuery<TwilioOriginationURL[], ApiError>({
    queryKey: twilioOriginationURLsKeys.lists(trunkSid),
    queryFn: () => getTwilioOriginationURLs(trunkSid),
    enabled: options?.enabled !== false && !!trunkSid,
  });
}

export function useTwilioOriginationURL(
  trunkSid: string,
  originationUrlSid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<TwilioOriginationURL, ApiError>({
    queryKey: twilioOriginationURLsKeys.detail(trunkSid, originationUrlSid),
    queryFn: () => getTwilioOriginationURL(trunkSid, originationUrlSid),
    enabled: options?.enabled !== false && !!trunkSid && !!originationUrlSid,
  });
}

export function useCreateTwilioOriginationURL() {
  const queryClient = useQueryClient();
  return useMutation<
    TwilioOriginationURL,
    ApiError,
    { trunkSid: string; data: CreateTwilioOriginationURLRequest }
  >({
    mutationFn: ({ trunkSid, data }) => createTwilioOriginationURL(trunkSid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioOriginationURLsKeys.lists(variables.trunkSid),
      });
    },
  });
}

export function useUpdateTwilioOriginationURL() {
  const queryClient = useQueryClient();
  return useMutation<
    TwilioOriginationURL,
    ApiError,
    { trunkSid: string; originationUrlSid: string; data: UpdateTwilioOriginationURLRequest }
  >({
    mutationFn: ({ trunkSid, originationUrlSid, data }) =>
      updateTwilioOriginationURL(trunkSid, originationUrlSid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioOriginationURLsKeys.lists(variables.trunkSid),
      });
      queryClient.invalidateQueries({
        queryKey: twilioOriginationURLsKeys.detail(variables.trunkSid, variables.originationUrlSid),
      });
    },
  });
}

export function useDeleteTwilioOriginationURL() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, { trunkSid: string; originationUrlSid: string }>({
    mutationFn: ({ trunkSid, originationUrlSid }) =>
      deleteTwilioOriginationURL(trunkSid, originationUrlSid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioOriginationURLsKeys.lists(variables.trunkSid),
      });
    },
  });
}

