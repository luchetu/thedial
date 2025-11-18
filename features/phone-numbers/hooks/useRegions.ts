"use client"

import { useQuery } from "@tanstack/react-query"
import { getRegions } from "../api"
import type { Region } from "../types"

export function useRegions() {
  return useQuery<Region[]>({
    queryKey: ["phone-numbers", "regions"],
    queryFn: getRegions,
    staleTime: Infinity,
  })
}

