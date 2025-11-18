"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTwilioConfig, updateTwilioConfig } from "../api";
import type { TwilioConfig, UpdateTwilioConfigRequest } from "../types";
import type { ApiError } from "@/lib/http/client";

const twilioConfigKeys = {
  all: ["admin", "telephony", "twilio-config"] as const,
  detail: () => [...twilioConfigKeys.all, "detail"] as const,
};

export function useTwilioConfig() {
  return useQuery<TwilioConfig, ApiError>({
    queryKey: twilioConfigKeys.detail(),
    queryFn: getTwilioConfig,
  });
}

export function useUpdateTwilioConfig() {
  const queryClient = useQueryClient();

  return useMutation<TwilioConfig, ApiError, UpdateTwilioConfigRequest>({
    mutationFn: updateTwilioConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twilioConfigKeys.detail() });
    },
  });
}

