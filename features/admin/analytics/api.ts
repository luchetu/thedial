"use client";

import { http } from "@/lib/http/client";

export type AdminCallsTimeseriesBucket = {
  start: string;
  end: string;
  callsTotal: number;
  callsAnswered: number;
  callsMissed: number;
  callsFailed: number;
  pstnSeconds: number;
  aiSeconds: number;
  transcriptionSeconds: number;
};

export type AdminCallsTimeseriesResponse = {
  buckets: AdminCallsTimeseriesBucket[];
};

export type AdminTopNumber = {
  phoneNumberId: string;
  phoneNumber: string;
  callsTotal: number;
  pstnSeconds: number;
  aiSeconds: number;
  transcriptionSeconds: number;
  userId: string;
};

export type AdminTopNumbersResponse = {
  rows: AdminTopNumber[];
};

export type AdminCallsAnalyticsParams = {
  from: string;
  to: string;
  bucket?: "day" | "week" | "month";
  planCode?: string;
};

export type AdminTopNumbersParams = {
  from: string;
  to: string;
  limit?: number;
  planCode?: string;
  userId?: string;
};

export async function getAdminCallsTimeseries(
  params: AdminCallsAnalyticsParams,
): Promise<AdminCallsTimeseriesResponse> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  search.set("bucket", params.bucket ?? "day");
  if (params.planCode) {
    search.set("planCode", params.planCode);
  }

  return http<AdminCallsTimeseriesResponse>(
    `/admin/analytics/calls/timeseries?${search.toString()}`,
  );
}

export async function getAdminTopNumbers(
  params: AdminTopNumbersParams,
): Promise<AdminTopNumbersResponse> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }
  if (params.planCode) {
    search.set("planCode", params.planCode);
  }
  if (params.userId) {
    search.set("userId", params.userId);
  }

  return http<AdminTopNumbersResponse>(
    `/admin/analytics/top-numbers?${search.toString()}`,
  );
}


