export interface TrunkFormValues extends Record<string, unknown> {
  name: string;
  type: "twilio" | "livekit_outbound" | "livekit_inbound" | "custom";
  direction: "outbound" | "inbound" | "bidirectional";
  externalId: string;
  status: "active" | "inactive" | "pending";
  // LiveKit Outbound fields
  outboundNumberMode: "any" | "specific";
  outboundNumbers: string[];
  address: string;
  authUsername: string;
  authPassword: string;
  livekitCredentialMode?: "existing" | "create"; // Credential mode for LiveKit outbound (use existing Twilio credentials or create new)
  twilioTrunkSid?: string; // Twilio trunk SID for selecting credentials
  twilioCredentialListSid?: string; // Credential list SID from selected Twilio trunk (for LiveKit outbound)
  twilioCredentialSid?: string; // Selected credential SID (for LiveKit outbound)
  // LiveKit Inbound fields
  inboundNumberMode: "any" | "specific";
  inboundNumbers: string[];
  allowedNumbers: string[];
  allowedAddresses: string[];
  inboundAuthUsername: string;
  inboundAuthPassword: string;
  krispEnabled: boolean;
  restrictAllowedNumbers: boolean;
  // Twilio fields
  terminationSipDomain: string;
  originationSipUri?: string;
  credentialMode: "existing" | "create";
  credentialListSid?: string; // Optional - only used when credentialMode is "existing"
  credentialListName: string;
  twilioUsername: string;
  twilioPassword: string;
}

// Derive provider from trunk type
export const getProviderFromType = (type: TrunkFormValues["type"]): "twilio" | "livekit" | "custom" => {
  switch (type) {
    case "twilio":
      return "twilio";
    case "livekit_outbound":
    case "livekit_inbound":
      return "livekit";
    case "custom":
      return "custom";
    default:
      return "custom";
  }
};

