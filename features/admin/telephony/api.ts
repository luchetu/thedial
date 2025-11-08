import { http } from "@/lib/http/client";
import type {
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

// Twilio Trunks
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

