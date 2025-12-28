"use client";

import { http } from "@/lib/http/client";

export type TranscriptionData = {
  seconds?: number;
  summary?: string;
  text?: string;
};

export type CallRecordMetadata = {
  transcription?: TranscriptionData;
  recordingIds?: string[] | string;
  recordingUrls?: string[] | string;
  [key: string]: unknown;
};

export type CallRecord = {
  id: string;
  direction: string;
  room?: string | null;
  sourceE164?: string | null;
  destinationE164?: string | null;
  sourceContactName?: string | null; // Contact name for source (inbound caller or outbound destination)
  destinationContactName?: string | null; // Contact name for destination (inbound destination or outbound caller)
  status: string;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  metadata?: CallRecordMetadata | null;
};

export type ListUserCallsParams = {
  direction?: string;
  status?: string;
  fromDate?: string; // ISO date string
  toDate?: string;   // ISO date string
  limit?: number;
  offset?: number;
};

export async function listUserCalls(params: ListUserCallsParams = {}): Promise<CallRecord[]> {
  const qs = new URLSearchParams();
  if (params.direction) qs.set("direction", params.direction);
  if (params.status) qs.set("status", params.status);
  if (params.fromDate) qs.set("from_date", params.fromDate);
  if (params.toDate) qs.set("to_date", params.toDate);
  if (typeof params.limit === "number") qs.set("limit", String(params.limit));
  if (typeof params.offset === "number") qs.set("offset", String(params.offset));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return http<CallRecord[]>(`/calls${suffix}`);
}

export type TranscriptionSegment = {
  id: string;
  callRecordId: string;
  transcriptionProvider?: string;
  segmentId: string;
  startTime: number;
  endTime: number;
  text: string;
  language?: string;
  participantIdentity?: string;
  createdAt: string;
};

export async function getCallTranscript(callId: string): Promise<TranscriptionSegment[]> {
  return http<TranscriptionSegment[]>(`/calls/${callId}/transcript`);
}
