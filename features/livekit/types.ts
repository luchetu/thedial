export interface LiveKitTokenResponse {
  token: string;
  room: string;
  url: string;
}

export interface LiveKitRoom {
  sid: string;
  name: string;
  emptyTimeout: number;
  departureTimeout: number;
  creationTime: number;
  turnPassword: string;
  enabledCodecs: unknown[];
  metadata: string;
  numParticipants: number;
  numPublishers: number;
  maxParticipants: number;
  creationTimeMs: number;
  metadataAsJson: string;
}

export interface CreateRoomRequest {
  name: string;
}

export interface CreateOutboundCallRequest {
  phoneNumber: string;
  phoneNumberId: string; // ID of the user's phone number to use for calling
  agentName?: string;
  userIdentity?: string;
  channel?: "pstn" | "whatsapp";
}

export interface OutboundCallResponse {
  room: string;
  participant: string;
  sipParticipant: unknown;
}

