import type { TwilioTrunk, OutboundTrunk, InboundTrunk, DispatchRule } from "./types";

// Mock data for Twilio Trunks
export const mockTwilioTrunks: TwilioTrunk[] = [
  {
    id: "TK1234567890abcdef",
    friendlyName: "Production Twilio Trunk",
    domainName: "abc123.pstn.twilio.com",
    terminationSipDomain: "abc123.pstn.twilio.com",
    credentialListName: "LiveKit-Outbound-Prod",
    credentialListSid: "CLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1",
    credentialsCount: 3,
    usedByCount: 2,
    usedByLiveKitTrunks: ["TR_prod_001", "TR_prod_002"],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "TK0987654321fedcba",
    friendlyName: "Test Twilio Trunk",
    domainName: "test456.pstn.twilio.com",
    terminationSipDomain: "test456.pstn.twilio.com",
    credentialListName: "LiveKit-Outbound-Test",
    credentialListSid: "CLXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2",
    credentialsCount: 1,
    usedByCount: 1,
    usedByLiveKitTrunks: ["TR_test_001"],
    status: "active",
    createdAt: "2024-01-20T14:30:00Z",
  },
];

// Mock data for LiveKit Outbound Trunks
export const mockLiveKitOutboundTrunks: OutboundTrunk[] = [
  {
    id: "lk_trunk_001",
    name: "Production Outbound",
    trunkId: "TR_prod_001",
    numbers: ["*"],
    twilioTrunkId: "TK1234567890abcdef",
    twilioTrunkName: "Production Twilio Trunk",
    twilioSipAddress: "abc123.pstn.twilio.com",
    twilioSipUsername: "livekit-prod-001",
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "lk_trunk_002",
    name: "Sales Outbound",
    trunkId: "TR_prod_002",
    numbers: ["+14155551234", "+15551234567"],
    twilioTrunkId: "TK1234567890abcdef",
    twilioTrunkName: "Production Twilio Trunk",
    twilioSipAddress: "abc123.pstn.twilio.com",
    twilioSipUsername: "livekit-prod-002",
    status: "active",
    createdAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "lk_trunk_003",
    name: "Test Outbound",
    trunkId: "TR_test_001",
    numbers: ["*"],
    twilioTrunkId: "TK0987654321fedcba",
    twilioTrunkName: "Test Twilio Trunk",
    twilioSipAddress: "test456.pstn.twilio.com",
    twilioSipUsername: "livekit-test-001",
    status: "active",
    createdAt: "2024-01-20T15:00:00Z",
  },
];

// Mock data for LiveKit Inbound Trunks
export const mockLiveKitInboundTrunks: InboundTrunk[] = [
  {
    id: "lk_inbound_001",
    name: "Production Inbound",
    trunkId: "IN_prod_001",
    numbers: ["*"],
    allowedAddresses: [],
    allowedNumbers: [],
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "lk_inbound_002",
    name: "Support Inbound",
    trunkId: "IN_support_001",
    numbers: ["+14155559999", "+15559998888"],
    allowedAddresses: [],
    allowedNumbers: [],
    status: "active",
    createdAt: "2024-01-18T14:20:00Z",
  },
];

// Mock data for Twilio Trunks with Origination configured
export const mockTwilioTrunksWithOrigination: TwilioTrunk[] = [
  {
    id: "TK1234567890abcdef",
    friendlyName: "Production Twilio Trunk",
    domainName: "abc123.pstn.twilio.com",
    terminationSipDomain: "abc123.pstn.twilio.com",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

// Mock data for Dispatch Rules
export const mockDispatchRules: DispatchRule[] = [
  {
    id: "rule_001",
    name: "Support Queue",
    ruleId: "DR_prod_001",
    trunkIds: ["IN_prod_001"],
    type: "individual",
    roomPrefix: "support-",
    autoDispatch: true,
    agentName: "support-agent",
    hidePhoneNumber: false,
    status: "active",
    createdAt: "2024-01-15T11:00:00Z",
  },
  {
    id: "rule_002",
    name: "Sales Direct",
    ruleId: "DR_support_001",
    trunkIds: ["IN_support_001"],
    type: "direct",
    roomName: "sales-main",
    pin: "1234",
    autoDispatch: false,
    hidePhoneNumber: false,
    status: "active",
    createdAt: "2024-01-18T15:00:00Z",
  },
];

