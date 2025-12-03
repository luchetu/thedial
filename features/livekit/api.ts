import { http } from "@/lib/http/client";
import type { LiveKitTokenResponse, LiveKitRoom, CreateOutboundCallRequest, OutboundCallResponse } from "./types";

export function getLiveKitToken(room: string, identity: string) {
  const params = new URLSearchParams({ room, identity });
  return http<LiveKitTokenResponse>(`/calls/token?${params.toString()}`);
}

export function createRoom(name: string) {
  return http<LiveKitRoom>(`/calls/rooms`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function listRooms() {
  return http<LiveKitRoom[]>(`/calls/rooms`);
}

export function deleteRoom(room: string) {
  return http<void>(`/calls/rooms/${room}`, {
    method: "DELETE",
  });
}

export function createOutboundCall(input: CreateOutboundCallRequest) {
  return http<OutboundCallResponse>(`/calls/outbound`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

