// Twilio Trunk Types
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

