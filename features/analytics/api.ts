"use client";

import { http } from "@/lib/http/client";

export type MyAnalyticsSummary = {
  range: {
    from: string;
    to: string;
  };
  calls: {
    total: number;
    answered: number;
    missed: number;
    failed: number;
    inbound: number;
    outbound: number;
  };
  minutes: {
    pstnSeconds: number;
    aiSeconds: number;
    transcriptionSeconds: number;
  };
  plan: {
    code: string;
    pstnIncludedSeconds: number;
    aiIncludedSeconds: number;
    transcriptionIncludedSeconds: number;
  };
};

export type MyAnalyticsTimeseriesBucket = {
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

export type MyAnalyticsTimeseriesResponse = {
  buckets: MyAnalyticsTimeseriesBucket[];
};

export type MyAnalyticsParams = {
  from: string;
  to: string;
  bucket?: "day" | "week" | "month";
};

export async function getMyAnalyticsSummary(params: MyAnalyticsParams): Promise<MyAnalyticsSummary> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);

  return http<MyAnalyticsSummary>(`/analytics/me/summary?${search.toString()}`);
}

export async function getMyAnalyticsTimeseries(
  params: MyAnalyticsParams,
): Promise<MyAnalyticsTimeseriesResponse> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  search.set("bucket", params.bucket ?? "day");

  return http<MyAnalyticsTimeseriesResponse>(`/analytics/me/timeseries?${search.toString()}`);
}


