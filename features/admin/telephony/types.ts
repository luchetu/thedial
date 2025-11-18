// Plan Types
export type Plan = {
  id: string;
  code: string;
  name?: string;
  billingProductId?: string;
  monthlyPriceCents: number;
  includedRealtimeMinutes: number;
  includedTranscriptionMinutes: number;
  includedPstnMinutes: number;
  includedAiMinutes: number;
  includedPhoneNumbers: number;
  perNumberMonthlyPriceCents: number;
  defaultRoutingProfileTemplateId?: string;
  allowedCountries: string[];
  defaultRecordingPolicy?: Record<string, unknown>;
  complianceFeatures?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type PlanPayloadBase = {
  name?: string;
  billingProductId?: string;
  monthlyPriceCents?: number;
  includedRealtimeMinutes?: number;
  includedTranscriptionMinutes?: number;
  includedPstnMinutes?: number;
  includedAiMinutes?: number;
  includedPhoneNumbers?: number;
  perNumberMonthlyPriceCents?: number;
  defaultRoutingProfileTemplateId?: string;
  allowedCountries?: string[];
  defaultRecordingPolicy?: Record<string, unknown>;
  complianceFeatures?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type CreatePlanRequest = PlanPayloadBase & {
  code: string;
};

export type UpdatePlanRequest = PlanPayloadBase & {
  code?: string;
};

// Routing Profile Types
export type RoutingProfile = {
  id: string;
  name: string;
  // planCode removed - routing profiles are now independent
  country: string;
  region?: string; // Support for region-based routing
  outboundProvider: string;
  outboundTrunkRef?: string;
  outboundProviderConfig?: Record<string, unknown>;
  inboundProvider?: string;
  inboundTrunkRef?: string;
  inboundProviderConfig?: Record<string, unknown>;
  dispatchProvider?: string;
  dispatchRuleRef?: string;
  dispatchMetadata?: Record<string, unknown>;
  complianceRequirements?: Record<string, unknown>;
  recordingPolicy?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRoutingProfileRequest = {
  name: string;
  planCode?: string; // Optional - if provided, creates mapping automatically
  country?: string; // Make optional if region is provided
  region?: string; // Add region support
  outboundProvider: string;
  outboundTrunkRef?: string;
  outboundProviderConfig?: Record<string, unknown>;
  inboundProvider?: string;
  inboundTrunkRef?: string;
  inboundProviderConfig?: Record<string, unknown>;
  dispatchProvider?: string;
  dispatchRuleRef?: string;
  dispatchMetadata?: Record<string, unknown>;
  complianceRequirements?: Record<string, unknown>;
  recordingPolicy?: Record<string, unknown>;
};

// Plan Routing Profile Mapping Types
export type PlanRoutingProfile = {
  id: string;
  planCode: string;
  routingProfileId: string;
  country?: string;
  region?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePlanRoutingProfileRequest = {
  planCode: string;
  routingProfileId: string;
  country?: string;
  region?: string;
};

export type UpdatePlanRoutingProfileRequest = {
  routingProfileId?: string;
  country?: string;
  region?: string;
};

// User Routing Profile Override Types (for future use)
export type UserRoutingProfileOverride = {
  id: string;
  userId: string;
  routingProfileId: string;
  country?: string;
  region?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateRoutingProfileRequest = Partial<CreateRoutingProfileRequest>;

// Unified Trunk Types (Provider-Agnostic)
// CRITICAL: Never expose provider names (twilio, livekit) in these types
export type Trunk = {
  id: string;
  name: string;
  type: "twilio" | "livekit_outbound" | "livekit_inbound" | "custom";
  direction: "outbound" | "inbound" | "bidirectional";
  status: "active" | "inactive" | "pending";
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type TrunkConfiguration = {
  id: string;
  trunkId: string;
  provider: string;
  configurationType: string;
  configurationData: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTrunkRequest = {
  name: string;
  type: "twilio" | "livekit_outbound" | "livekit_inbound" | "custom";
  direction: "outbound" | "inbound" | "bidirectional";
  provider: "twilio" | "livekit" | "custom";
  externalId?: string;
  status?: "active" | "inactive" | "pending";
  metadata?: Record<string, unknown>;
  // LiveKit Outbound fields
  address?: string; // SIP domain (e.g., "my-trunk.pstn.twilio.com")
  numbers?: string[]; // Phone numbers array (e.g., ["+15105550123"] or ["*"])
  authUsername?: string; // SIP authentication username
  authPassword?: string; // SIP authentication password
  // LiveKit Inbound fields
  inboundNumbers?: string[]; // Phone numbers ([] for any number, or specific numbers)
  allowedNumbers?: string[]; // Restrict caller numbers
  allowedAddresses?: string[]; // Restrict IP addresses
  inboundAuthUsername?: string; // Optional SIP username
  inboundAuthPassword?: string; // Optional SIP password
  krispEnabled?: boolean; // Enable noise cancellation
  // Twilio fields
  terminationSipDomain?: string; // SIP domain (e.g., "my-trunk.pstn.twilio.com")
  credentialMode?: "existing" | "create"; // Credential list mode
  credentialListSid?: string; // Existing credential list SID (if mode="existing")
  credentialListName?: string; // New credential list name (if mode="create")
  twilioUsername?: string; // Username for credentials (if mode="create")
  twilioPassword?: string; // Password for credentials (if mode="create")
};

export type UpdateTrunkRequest = {
  name?: string;
  type?: "twilio" | "livekit_outbound" | "livekit_inbound" | "custom";
  direction?: "outbound" | "inbound" | "bidirectional";
  provider?: "twilio" | "livekit" | "custom";
  externalId?: string;
  status?: "active" | "inactive" | "pending";
  metadata?: Record<string, unknown>;
  // LiveKit Outbound fields
  address?: string;
  numbers?: string[];
  authUsername?: string;
  authPassword?: string;
  // LiveKit Inbound fields
  inboundNumbers?: string[];
  allowedNumbers?: string[];
  allowedAddresses?: string[];
  inboundAuthUsername?: string;
  inboundAuthPassword?: string;
  krispEnabled?: boolean;
  // Twilio fields
  terminationSipDomain?: string;
  credentialMode?: "existing" | "create";
  credentialListSid?: string;
  credentialListName?: string;
  twilioUsername?: string;
  twilioPassword?: string;
};

export type ConfigureTrunkRequest = {
  // LiveKit Outbound fields
  address?: string; // SIP domain
  numbers?: string[]; // Phone numbers array
  authUsername?: string; // SIP username
  authPassword?: string; // SIP password

  // LiveKit Inbound fields
  inboundNumbers?: string[]; // Phone numbers ([] for any)
  allowedNumbers?: string[]; // Restrict caller numbers
  allowedAddresses?: string[]; // Restrict IP addresses
  inboundAuthUsername?: string; // Optional SIP username
  inboundAuthPassword?: string; // Optional SIP password
  krispEnabled?: boolean; // Enable noise cancellation

  // Twilio fields
  terminationSipDomain?: string; // SIP domain
  credentialMode?: "existing" | "create"; // Credential list mode
  credentialListSid?: string; // Existing credential list SID
  credentialListName?: string; // New credential list name
  twilioUsername?: string; // Username for credentials
  twilioPassword?: string; // Password for credentials
};

export type ListTrunksFilters = {
  provider?: string;
  type?: "twilio" | "livekit_outbound" | "livekit_inbound" | "custom";
  direction?: "outbound" | "inbound" | "bidirectional";
  status?: "active" | "inactive" | "pending";
};

// Twilio Trunk Types (DEPRECATED - Use unified Trunk type instead)
// Note: This is a Twilio Elastic SIP Trunk (created in Twilio, can be managed programmatically)
export type TwilioTrunk = {
  id: string; // Twilio Trunk SID
  friendlyName: string;
  domainName: string; // Termination SIP URI (e.g., "abc123.pstn.twilio.com")
  terminationSipDomain?: string; // Raw domain without pstn.twilio.com suffix (if needed for programmatic creation)
  credentialListName?: string; // Name of associated credential list
  credentialListSid?: string; // SID of credential list
  credentialsCount?: number; // Number of credentials in the list
  usedByLiveKitTrunks?: string[]; // IDs of LiveKit trunks using this Twilio trunk
  usedByCount?: number; // Count of LiveKit trunks using this
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export type TwilioCredentialListMode = "existing" | "create";

export type CreateTwilioTrunkRequest = {
  friendlyName: string;
  terminationSipDomain: string;
  credentialMode: TwilioCredentialListMode;
  credentialListSid?: string;
  credentialListName?: string;
  username?: string;
  password?: string;
};

export type UpdateTwilioTrunkRequest = {
  friendlyName?: string;
  terminationSipDomain?: string;
  credentialMode?: TwilioCredentialListMode;
  credentialListSid?: string;
  credentialListName?: string;
  username?: string;
  password?: string;
};

// Outbound Trunk Types
// Note: This is a LiveKit SIP Outbound Trunk that connects TO a Twilio Elastic SIP Trunk
// The Twilio trunk can be created programmatically via Twilio API or in Twilio Console
export type OutboundTrunk = {
  id: string;
  name: string;
  trunkId: string;
  numbers: string[]; 
  twilioTrunkId: string; 
  twilioTrunkName?: string; // Friendly name of Twilio trunk (for display)
  twilioSipAddress: string; // Twilio trunk's Termination SIP URI (e.g., "abc123.pstn.twilio.com")
  twilioSipUsername: string; // Username from Twilio credential list
  twilioSipPassword?: string; // Password from Twilio credential list (masked in responses)
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOutboundTrunkRequest = {
  name: string;
  numbers: string[]; // ["*"] for wildcard or specific numbers like ["+14155551234"]
  mode: "existing" | "create" | "direct";
  // Reference to Twilio trunk (can be existing or create new)
  twilioTrunkId?: string; // Use existing Twilio trunk (if provided)
  // OR create new Twilio trunk (if twilioTrunkId not provided)
  createTwilioTrunk?: CreateTwilioTrunkRequest; // Create new Twilio trunk
  // Legacy: direct credentials (if not using twilioTrunkId)
  directSIPDomain?: string; // Twilio trunk Termination SIP URI
  directUsername?: string; // Username from Twilio credential list
  directPassword?: string; // Password from Twilio credential list
};

export type UpdateOutboundTrunkRequest = {
  name?: string;
  numbers?: {
    add?: string[];
    remove?: string[];
    set?: string[];
  };
  twilioSipAddress?: string;
  twilioSipUsername?: string;
  twilioSipPassword?: string;
};

// Inbound Trunk Types
// Note: This is a LiveKit SIP Inbound Trunk that receives calls FROM Twilio
// Twilio trunk must be configured with Origination URI pointing to this LiveKit trunk's SIP address
export type InboundTrunk = {
  id: string;
  name: string;
  trunkId: string; // LiveKit SIPTrunkID
  numbers: string[]; // [] for any number or ["+15105550100"] for specific numbers
  allowedNumbers?: string[]; // Restrict caller numbers (who can call)
  allowedAddresses?: string[]; // IP address filtering
  authUsername?: string;
  metadata?: Record<string, string>;
  krispEnabled?: boolean;
  sipAddress?: string; // LiveKit SIP address (where Twilio sends calls - e.g., "vjnxecm0tjk.sip.livekit.cloud")
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInboundTrunkRequest = {
  name: string;
  numbers: string[]; // [] for any number or specific numbers
  allowedNumbers?: string[];
  allowedAddresses?: string[];
  authUsername?: string;
  authPassword?: string;
  krispEnabled?: boolean;
  metadata?: Record<string, string>;
  status?: string;
};

export type UpdateInboundTrunkRequest = {
  name?: string;
  numbers?: {
    add?: string[];
    remove?: string[];
    set?: string[];
  };
  allowedNumbers?: {
    add?: string[];
    remove?: string[];
    set?: string[];
  };
  allowedAddresses?: {
    add?: string[];
    remove?: string[];
    set?: string[];
  };
  authUsername?: string;
  authPassword?: string;
  krispEnabled?: boolean;
  metadata?: Record<string, string>;
  status?: string;
};

// Dispatch Rule Types
export type DispatchRuleType = "individual" | "direct" | "callee";

export type DispatchRule = {
  id: string;
  name: string;
  ruleId: string; // LiveKit DispatchRuleID
  type: DispatchRuleType;
  trunkIds?: string[] | null;
  roomPrefix?: string | null;
  roomName?: string | null;
  pin?: string | null;
  randomize?: boolean | null;
  agentName?: string | null;
  autoDispatch: boolean;
  hidePhoneNumber: boolean;
  attributes?: Record<string, string> | null;
  metadata?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateDispatchRuleRequest = {
  name: string;
  type: DispatchRuleType;
  trunkIds?: string[];
  roomPrefix?: string;
  roomName?: string;
  pin?: string;
  randomize?: boolean;
  agentName?: string;
  autoDispatch?: boolean;
  hidePhoneNumber?: boolean;
  attributes?: Record<string, string>;
  metadata?: string;
  status?: string;
};

export type UpdateDispatchRuleRequest = {
  name?: string;
  type?: DispatchRuleType;
  trunkIds?: {
    add?: string[];
    remove?: string[];
    set?: string[];
  };
  roomPrefix?: string;
  roomName?: string;
  pin?: string;
  randomize?: boolean;
  agentName?: string;
  autoDispatch?: boolean;
  hidePhoneNumber?: boolean;
  attributes?: Record<string, string>;
  metadata?: string;
  status?: string;
};

// Twilio Configuration Types
// Global Twilio settings used across the application
export type TwilioConfig = {
  accountSid: string; // Twilio Account SID
  authToken?: string; // Twilio Auth Token (masked in responses)
  // Default Twilio Elastic SIP Trunk credentials (can be overridden per-trunk)
  sipTrunkAddress?: string; // Default Twilio trunk Termination SIP URI (e.g., "abc123.pstn.twilio.com")
  sipTrunkUsername?: string; // Default username from Twilio credential list
  sipTrunkPassword?: string; // Default password from Twilio credential list (masked in responses)
  // Webhook URLs for inbound calls/SMS
  inboundVoiceWebhookUrl?: string; // Twilio calls this when receiving inbound calls
  inboundSmsWebhookUrl?: string; // Twilio calls this when receiving SMS
};

export type UpdateTwilioConfigRequest = {
  accountSid?: string;
  authToken?: string;
  sipTrunkAddress?: string;
  sipTrunkUsername?: string;
  sipTrunkPassword?: string;
  inboundVoiceWebhookUrl?: string;
  inboundSmsWebhookUrl?: string;
};

