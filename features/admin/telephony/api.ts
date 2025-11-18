import { http } from "@/lib/http/client";
import type {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  RoutingProfile,
  CreateRoutingProfileRequest,
  UpdateRoutingProfileRequest,
  PlanRoutingProfile,
  CreatePlanRoutingProfileRequest,
  UpdatePlanRoutingProfileRequest,
  Trunk,
  CreateTrunkRequest,
  UpdateTrunkRequest,
  ConfigureTrunkRequest,
  ListTrunksFilters,
  TwilioTrunk,
  CreateTwilioTrunkRequest,
  UpdateTwilioTrunkRequest,
  OutboundTrunk,
  CreateOutboundTrunkRequest,
  UpdateOutboundTrunkRequest,
  InboundTrunk,
  CreateInboundTrunkRequest,
  UpdateInboundTrunkRequest,
  DispatchRule,
  CreateDispatchRuleRequest,
  UpdateDispatchRuleRequest,
  TwilioConfig,
  UpdateTwilioConfigRequest,
} from "./types";

// Plans
export function getPlans() {
  return http<Plan[]>(`/admin/settings/plans`);
}

export function getPlan(id: string) {
  return http<Plan>(`/admin/settings/plans/${id}`);
}

export function createPlan(data: CreatePlanRequest) {
  return http<Plan>(`/admin/settings/plans`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePlan(id: string, data: UpdatePlanRequest) {
  return http<Plan>(`/admin/settings/plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deletePlan(id: string) {
  return http<void>(`/admin/settings/plans/${id}`, {
    method: "DELETE",
  });
}

// Routing Profiles
export function getRoutingProfiles(filters?: { country?: string }) {
  const params = new URLSearchParams();
  // Remove plan filter - routing profiles are independent
  if (filters?.country) {
    params.set("country", filters.country);
  }
  const query = params.toString();
  const url = query
    ? `/admin/settings/routing-profiles?${query}`
    : `/admin/settings/routing-profiles`;
  return http<RoutingProfile[]>(url);
}

export function getRoutingProfile(id: string) {
  return http<RoutingProfile>(`/admin/settings/routing-profiles/${id}`);
}

export function createRoutingProfile(data: CreateRoutingProfileRequest) {
  return http<RoutingProfile>(`/admin/settings/routing-profiles`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateRoutingProfile(id: string, data: UpdateRoutingProfileRequest) {
  return http<RoutingProfile>(`/admin/settings/routing-profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoutingProfile(id: string) {
  return http<void>(`/admin/settings/routing-profiles/${id}`, {
    method: "DELETE",
  });
}

// Plan Routing Profile Mappings
export function getPlanRoutingProfiles(planCode?: string) {
  const url = planCode
    ? `/admin/settings/plan-routing-profiles?planCode=${encodeURIComponent(planCode)}`
    : `/admin/settings/plan-routing-profiles`;
  return http<PlanRoutingProfile[]>(url);
}

export function getPlanRoutingProfile(id: string) {
  return http<PlanRoutingProfile>(
    `/admin/settings/plan-routing-profiles/${id}`
  );
}

export function createPlanRoutingProfile(
  data: CreatePlanRoutingProfileRequest
) {
  return http<PlanRoutingProfile>(`/admin/settings/plan-routing-profiles`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePlanRoutingProfile(
  id: string,
  data: UpdatePlanRoutingProfileRequest
) {
  return http<PlanRoutingProfile>(
    `/admin/settings/plan-routing-profiles/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deletePlanRoutingProfile(id: string) {
  return http<void>(`/admin/settings/plan-routing-profiles/${id}`, {
    method: "DELETE",
  });
}

// Unified Trunks (Provider-Agnostic)
export function getTrunks(filters?: ListTrunksFilters) {
  const params = new URLSearchParams();
  if (filters?.provider) {
    params.set("provider", filters.provider);
  }
  if (filters?.type) {
    params.set("type", filters.type);
  }
  if (filters?.direction) {
    params.set("direction", filters.direction);
  }
  if (filters?.status) {
    params.set("status", filters.status);
  }
  const query = params.toString();
  const url = query
    ? `/admin/settings/trunks?${query}`
    : `/admin/settings/trunks`;
  return http<Trunk[]>(url);
}

export function getTrunk(id: string) {
  return http<Trunk>(`/admin/settings/trunks/${id}`);
}

export function createTrunk(data: CreateTrunkRequest) {
  return http<Trunk>(`/admin/settings/trunks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTrunk(id: string, data: UpdateTrunkRequest) {
  return http<Trunk>(`/admin/settings/trunks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTrunk(id: string) {
  return http<void>(`/admin/settings/trunks/${id}`, {
    method: "DELETE",
  });
}

export function configureTrunk(id: string, data: ConfigureTrunkRequest) {
  return http<Trunk>(`/admin/settings/trunks/${id}/configuration`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRoutingProfilesByTrunk(trunkId: string) {
  return http<{
    outbound: RoutingProfile[];
    inbound: RoutingProfile[];
  }>(`/admin/settings/trunks/${trunkId}/routing-profiles`);
}

// Twilio Trunks (DEPRECATED - Use unified trunk API instead)
export function getTwilioTrunks() {
  return http<TwilioTrunk[]>(`/admin/settings/twilio/trunks`);
}

export function getTwilioTrunk(id: string) {
  return http<TwilioTrunk>(`/admin/settings/twilio/trunks/${id}`);
}

export function createTwilioTrunk(data: CreateTwilioTrunkRequest) {
  return http<TwilioTrunk>(`/admin/settings/twilio/trunks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTwilioTrunk(id: string, data: UpdateTwilioTrunkRequest) {
  return http<TwilioTrunk>(`/admin/settings/twilio/trunks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTwilioTrunk(id: string) {
  return http<void>(`/admin/settings/twilio/trunks/${id}`, {
    method: "DELETE",
  });
}

// Outbound Trunks
export function getOutboundTrunks() {
  return http<OutboundTrunk[]>(`/admin/settings/livekit/trunks/outbound`);
}

export function createOutboundTrunk(data: CreateOutboundTrunkRequest) {
  return http<OutboundTrunk>(`/admin/settings/livekit/trunks/outbound`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateOutboundTrunk(id: string, data: UpdateOutboundTrunkRequest) {
  return http<OutboundTrunk>(`/admin/settings/livekit/trunks/outbound/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteOutboundTrunk(id: string) {
  return http<void>(`/admin/settings/livekit/trunks/outbound/${id}`, {
    method: "DELETE",
  });
}

// Inbound Trunks
export function getInboundTrunks() {
  return http<InboundTrunk[]>(`/admin/settings/livekit/trunks/inbound`);
}

export function createInboundTrunk(data: CreateInboundTrunkRequest) {
  return http<InboundTrunk>(`/admin/settings/livekit/trunks/inbound`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateInboundTrunk(id: string, data: UpdateInboundTrunkRequest) {
  return http<InboundTrunk>(`/admin/settings/livekit/trunks/inbound/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteInboundTrunk(id: string) {
  return http<void>(`/admin/settings/livekit/trunks/inbound/${id}`, {
    method: "DELETE",
  });
}

// Dispatch Rules
export function getDispatchRules() {
  return http<DispatchRule[]>(`/admin/settings/livekit/dispatch-rules`);
}

export function createDispatchRule(data: CreateDispatchRuleRequest) {
  return http<DispatchRule>(`/admin/settings/livekit/dispatch-rules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDispatchRule(id: string, data: UpdateDispatchRuleRequest) {
  return http<DispatchRule>(`/admin/settings/livekit/dispatch-rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteDispatchRule(id: string) {
  return http<void>(`/admin/settings/livekit/dispatch-rules/${id}`, {
    method: "DELETE",
  });
}

// Twilio Configuration
export function getTwilioConfig() {
  return http<TwilioConfig>(`/admin/settings/twilio`);
}

export function updateTwilioConfig(data: UpdateTwilioConfigRequest) {
  return http<TwilioConfig>(`/admin/settings/twilio`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

