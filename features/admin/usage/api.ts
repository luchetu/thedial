import { http } from "@/lib/http/client";

export type PlanUsage = {
  planCode: string;
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  failedCalls: number;
  totalPstnSeconds: number;
  totalAiSeconds: number;
};

export type NumberUsage = {
  phoneNumberId: string;
  phoneNumber: string;
  callCount: number;
  totalPstnSeconds: number;
  totalAiSeconds: number;
  lastCallAt?: string | null;
};

export type ListPlanUsageParams = {
  from: string; // RFC3339
  to: string;   // RFC3339
  planCode?: string;
};

export async function listPlanUsage(params: ListPlanUsageParams): Promise<PlanUsage[]> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.planCode) {
    search.set("planCode", params.planCode);
  }

  return http<PlanUsage[]>(`/admin/usage/calls?${search.toString()}`);
}

export type ListNumberUsageParams = {
  userId: string;
  planCode?: string;
};

export async function listNumberUsage(params: ListNumberUsageParams): Promise<NumberUsage[]> {
  const search = new URLSearchParams();
  search.set("userId", params.userId);
  if (params.planCode) {
    search.set("planCode", params.planCode);
  }

  return http<NumberUsage[]>(`/admin/usage/numbers?${search.toString()}`);
}


