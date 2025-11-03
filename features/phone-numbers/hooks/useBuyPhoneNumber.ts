"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { buyPhoneNumber } from "../api"
import type { BuyPhoneNumberInput } from "../api"

export function useBuyPhoneNumber() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: BuyPhoneNumberInput) => buyPhoneNumber(input),
    onSuccess: () => {
      // Invalidate phone number queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] })
    },
  })
}

