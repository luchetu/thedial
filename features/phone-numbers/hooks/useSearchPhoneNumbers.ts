"use client"

import { useQuery } from "@tanstack/react-query"
import { searchPhoneNumbers } from "../api"
import type { SearchPhoneNumbersParams } from "../types"

export function useSearchPhoneNumbers(params: SearchPhoneNumbersParams) {
  return useQuery({
    queryKey: ["phone-numbers", "search", params],
    queryFn: () => searchPhoneNumbers(params),
    enabled: Boolean(params.country),
    staleTime: 30_000, // 30 seconds
  })
}

