"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDispatchRules,
  createDispatchRule,
  updateDispatchRule,
  deleteDispatchRule,
} from "../api";
import type {
  DispatchRule,
  CreateDispatchRuleRequest,
  UpdateDispatchRuleRequest,
} from "../types";
import type { ApiError } from "@/lib/http/client";

const dispatchRulesKeys = {
  all: ["admin", "telephony", "dispatch-rules"] as const,
  lists: () => [...dispatchRulesKeys.all, "list"] as const,
  list: () => [...dispatchRulesKeys.lists()] as const,
  details: () => [...dispatchRulesKeys.all, "detail"] as const,
  detail: (id: string) => [...dispatchRulesKeys.details(), id] as const,
};

export function useDispatchRules() {
  return useQuery<DispatchRule[], ApiError>({
    queryKey: dispatchRulesKeys.list(),
    queryFn: getDispatchRules,
  });
}

export function useCreateDispatchRule() {
  const queryClient = useQueryClient();

  return useMutation<DispatchRule, ApiError, CreateDispatchRuleRequest>({
    mutationFn: createDispatchRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchRulesKeys.list() });
    },
  });
}

export function useUpdateDispatchRule() {
  const queryClient = useQueryClient();

  return useMutation<
    DispatchRule,
    ApiError,
    { id: string; data: UpdateDispatchRuleRequest }
  >({
    mutationFn: ({ id, data }) => updateDispatchRule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dispatchRulesKeys.list() });
      queryClient.invalidateQueries({ queryKey: dispatchRulesKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDispatchRule() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteDispatchRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispatchRulesKeys.list() });
    },
  });
}

