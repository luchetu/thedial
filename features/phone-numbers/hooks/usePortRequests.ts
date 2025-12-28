"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/client";

export interface PortRequest {
  id: string;
  userId: string;
  status: string;
  direction: string;
  phoneNumbers: string[];
  createdAt: string;
  updatedAt?: string;
}

async function listPortRequests(): Promise<PortRequest[]> {
  return http<PortRequest[]>("/telephony/porting/in/requests");
}

export function usePortRequests() {
  return useQuery<PortRequest[]>({
    queryKey: ["phone-numbers", "port-requests"],
    queryFn: () => listPortRequests(),
    staleTime: 60_000,
  });
}


