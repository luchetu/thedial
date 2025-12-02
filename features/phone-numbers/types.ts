export interface AvailablePhoneNumber {
  phoneNumber: string
  friendlyName: string
  locality: string
  region: string
  postalCode: string
  country: string
  capabilities: {
    voice?: boolean
    sms?: boolean
    mms?: boolean
  }
  price: string
  currency: string
  beta: boolean
}

export interface Region {
  countryCode: string
  countryName: string
}

export interface AvailablePhoneNumbersResponse {
  country: string
  type: string
  numbers: AvailablePhoneNumber[]
  totalResults?: number
}

export interface SearchPhoneNumbersParams {
  country: string
  type?: string
  areaCode?: string
  voice?: boolean
  sms?: boolean
  mms?: boolean
  limit?: number
}

export interface UserPhoneNumber {
  id: string
  userId: string
  provider: string // 'twilio', 'vonage', 'sms-verified', etc.
  providerId: string // Provider-specific identifier
  twilioSid: string // DEPRECATED: Use providerId. Kept for backward compatibility
  phoneNumber: string
  friendlyName: string
  country: string
  status: string
  capabilities: unknown
  forwardingNumber: string
  aiAssistantEnabled: boolean
  purchasedAt?: string
  releasedAt?: string
  createdAt?: string
  updatedAt?: string
}
