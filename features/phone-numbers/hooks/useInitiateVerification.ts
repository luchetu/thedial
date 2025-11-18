"use client"

import { useMutation } from "@tanstack/react-query"
import { initiatePhoneVerification, type InitiateVerificationInput } from "../api"

export function useInitiateVerification() {
  return useMutation({
    mutationFn: (input: InitiateVerificationInput) => initiatePhoneVerification(input),
  })
}

