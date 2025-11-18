"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { verifyPhoneNumber, type VerifyPhoneNumberInput } from "../api"

export function useVerifyPhoneNumber() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: VerifyPhoneNumberInput) => verifyPhoneNumber(input),
    onSuccess: () => {
      // Invalidate phone number queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] })
    },
  })
}

