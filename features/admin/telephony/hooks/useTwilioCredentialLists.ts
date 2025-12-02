"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTwilioCredentialLists,
  getTwilioCredentialList,
  createTwilioCredentialList,
  updateTwilioCredentialList,
  deleteTwilioCredentialList,
  getTwilioCredentials,
  getTwilioCredential,
  createTwilioCredential,
  updateTwilioCredential,
  deleteTwilioCredential,
} from "../api";
import type {
  TwilioCredentialList,
  TwilioCredential,
  CreateTwilioCredentialListRequest,
  UpdateTwilioCredentialListRequest,
  CreateTwilioCredentialRequest,
  UpdateTwilioCredentialRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const twilioCredentialListsKeys = {
  all: ["admin", "telephony", "twilio-credential-lists"] as const,
  lists: () => [...twilioCredentialListsKeys.all, "list"] as const,
  detail: (sid: string) => [...twilioCredentialListsKeys.all, "detail", sid] as const,
  credentials: (credentialListSid: string) => [...twilioCredentialListsKeys.all, "credentials", credentialListSid] as const,
  credential: (credentialListSid: string, credentialSid: string) =>
    [...twilioCredentialListsKeys.all, "credential", credentialListSid, credentialSid] as const,
};

// Credential Lists
export function useTwilioCredentialLists(options?: { enabled?: boolean }) {
  return useQuery<TwilioCredentialList[], ApiError>({
    queryKey: twilioCredentialListsKeys.lists(),
    queryFn: getTwilioCredentialLists,
    enabled: options?.enabled !== false,
  });
}

export function useTwilioCredentialList(sid: string, options?: { enabled?: boolean }) {
  return useQuery<TwilioCredentialList, ApiError>({
    queryKey: twilioCredentialListsKeys.detail(sid),
    queryFn: () => getTwilioCredentialList(sid),
    enabled: options?.enabled !== false && !!sid,
  });
}

export function useCreateTwilioCredentialList() {
  const queryClient = useQueryClient();
  return useMutation<TwilioCredentialList, ApiError, CreateTwilioCredentialListRequest>({
    mutationFn: createTwilioCredentialList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twilioCredentialListsKeys.lists() });
    },
  });
}

export function useUpdateTwilioCredentialList() {
  const queryClient = useQueryClient();
  return useMutation<
    TwilioCredentialList,
    ApiError,
    { sid: string; data: UpdateTwilioCredentialListRequest }
  >({
    mutationFn: ({ sid, data }) => updateTwilioCredentialList(sid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: twilioCredentialListsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: twilioCredentialListsKeys.detail(variables.sid) });
    },
  });
}

export function useDeleteTwilioCredentialList() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, string>({
    mutationFn: deleteTwilioCredentialList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: twilioCredentialListsKeys.lists() });
    },
  });
}

// Credentials
export function useTwilioCredentials(credentialListSid: string, options?: { enabled?: boolean }) {
  return useQuery<TwilioCredential[], ApiError>({
    queryKey: twilioCredentialListsKeys.credentials(credentialListSid),
    queryFn: () => getTwilioCredentials(credentialListSid),
    enabled: options?.enabled !== false && !!credentialListSid,
  });
}

export function useTwilioCredential(
  credentialListSid: string,
  credentialSid: string,
  options?: { enabled?: boolean }
) {
  return useQuery<TwilioCredential, ApiError>({
    queryKey: twilioCredentialListsKeys.credential(credentialListSid, credentialSid),
    queryFn: () => getTwilioCredential(credentialListSid, credentialSid),
    enabled: options?.enabled !== false && !!credentialListSid && !!credentialSid,
  });
}

export function useCreateTwilioCredential() {
  const queryClient = useQueryClient();
  return useMutation<
    TwilioCredential,
    ApiError,
    { credentialListSid: string; data: CreateTwilioCredentialRequest }
  >({
    mutationFn: ({ credentialListSid, data }) => createTwilioCredential(credentialListSid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioCredentialListsKeys.credentials(variables.credentialListSid),
      });
    },
  });
}

export function useUpdateTwilioCredential() {
  const queryClient = useQueryClient();
  return useMutation<
    TwilioCredential,
    ApiError,
    { credentialListSid: string; credentialSid: string; data: UpdateTwilioCredentialRequest }
  >({
    mutationFn: ({ credentialListSid, credentialSid, data }) =>
      updateTwilioCredential(credentialListSid, credentialSid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioCredentialListsKeys.credentials(variables.credentialListSid),
      });
      queryClient.invalidateQueries({
        queryKey: twilioCredentialListsKeys.credential(variables.credentialListSid, variables.credentialSid),
      });
    },
  });
}

export function useDeleteTwilioCredential() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiError, { credentialListSid: string; credentialSid: string }>({
    mutationFn: ({ credentialListSid, credentialSid }) =>
      deleteTwilioCredential(credentialListSid, credentialSid),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: twilioCredentialListsKeys.credentials(variables.credentialListSid),
      });
    },
  });
}
