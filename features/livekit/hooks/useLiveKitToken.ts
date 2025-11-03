"use client";

import { useQuery } from "@tanstack/react-query";
import { getLiveKitToken } from "../api";

export function useLiveKitToken(room: string, identity: string) {
  return useQuery({
    queryKey: ["livekit", "token", room, identity],
    queryFn: () => getLiveKitToken(room, identity),
    enabled: Boolean(room && identity),
    staleTime: 5 * 60 * 1000, // 5 minutes - tokens are valid for longer
  });
}

