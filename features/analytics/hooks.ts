"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http/client";
import {
  getMyAnalyticsSummary,
  getMyAnalyticsTimeseries,
  type MyAnalyticsParams,
  type MyAnalyticsSummary,
  type MyAnalyticsTimeseriesResponse,
} from "./api";

const analyticsKeys = {
  summary: (params: MyAnalyticsParams) => ["analytics", "me", "summary", params] as const,
  timeseries: (params: MyAnalyticsParams) => ["analytics", "me", "timeseries", params] as const,
};

export function useMyAnalyticsSummary(params: MyAnalyticsParams) {
  return useQuery<MyAnalyticsSummary, ApiError>({
    queryKey: analyticsKeys.summary(params),
    queryFn: () => getMyAnalyticsSummary(params),
    enabled: Boolean(params.from && params.to),
  });
}

export function useMyAnalyticsTimeseries(params: MyAnalyticsParams) {
  return useQuery<MyAnalyticsTimeseriesResponse, ApiError>({
    queryKey: analyticsKeys.timeseries(params),
    queryFn: () => getMyAnalyticsTimeseries(params),
    enabled: Boolean(params.from && params.to),
  });
}


