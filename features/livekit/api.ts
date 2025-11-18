import { http } from "@/lib/http/client";
import type { LiveKitTokenResponse, LiveKitRoom, CreateOutboundCallRequest, OutboundCallResponse } from "./types";

export function getLiveKitToken(room: string, identity: string) {
  const params = new URLSearchParams({ room, identity });
  return http<LiveKitTokenResponse>(`/livekit/token?${params.toString()}`);
}

export function createRoom(name: string) {
  return http<LiveKitRoom>(`/livekit/rooms/create`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listRooms() {
  return http<LiveKitRoom[]>(`/livekit/rooms`);
}

export function deleteRoom(room: string) {
  return http<void>(`/livekit/rooms/${room}`, {
    method: "DELETE",
  });
}

export function createOutboundCall(input: CreateOutboundCallRequest) {
  return http<OutboundCallResponse>(`/livekit/calls/outbound`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

