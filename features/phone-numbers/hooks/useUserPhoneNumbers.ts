"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserPhoneNumbers } from "../api";

export function useUserPhoneNumbers() {
  return useQuery({
    queryKey: ["phone-numbers", "user"],
    queryFn: () => getUserPhoneNumbers(),
    staleTime: 60_000, // 1 minute
  });
}

