"use client";

import { useMutation } from "@tanstack/react-query";
import { createOutboundCall } from "../api";
import type { CreateOutboundCallRequest, OutboundCallResponse } from "../types";
import type { ApiError } from "@/lib/http/client";

export function useCreateOutboundCall() {
  return useMutation<OutboundCallResponse, ApiError, CreateOutboundCallRequest>({
    mutationFn: createOutboundCall,
  });
}

