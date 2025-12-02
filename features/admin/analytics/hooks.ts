"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/lib/http/client";
import {
  getAdminCallsTimeseries,
  getAdminTopNumbers,
  type AdminCallsAnalyticsParams,
  type AdminCallsTimeseriesResponse,
  type AdminTopNumbersParams,
  type AdminTopNumbersResponse,
} from "./api";

const adminAnalyticsKeys = {
  callsTimeseries: (params: AdminCallsAnalyticsParams) =>
    ["admin", "analytics", "calls", "timeseries", params] as const,
  topNumbers: (params: AdminTopNumbersParams) =>
    ["admin", "analytics", "top-numbers", params] as const,
};

export function useAdminCallsTimeseries(params: AdminCallsAnalyticsParams) {
  return useQuery<AdminCallsTimeseriesResponse, ApiError>({
    queryKey: adminAnalyticsKeys.callsTimeseries(params),
    queryFn: () => getAdminCallsTimeseries(params),
    enabled: Boolean(params.from && params.to),
  });
}

export function useAdminTopNumbers(params: AdminTopNumbersParams | null) {
  return useQuery<AdminTopNumbersResponse, ApiError>({
    queryKey: adminAnalyticsKeys.topNumbers(params ?? { from: "", to: "" }),
    queryFn: () => {
      if (!params) return Promise.resolve({ rows: [] });
      return getAdminTopNumbers(params);
    },
    enabled: Boolean(params && params.from && params.to),
  });
}


