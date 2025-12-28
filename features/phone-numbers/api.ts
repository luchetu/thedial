import { http } from "@/lib/http/client"
import type {
  AvailablePhoneNumbersResponse,
  SearchPhoneNumbersParams,
  Region,
  UserPhoneNumber,
} from "./types"

export function getRegions() {
  return http<Region[]>(`/telephony/regions`)
}

export function searchPhoneNumbers(params: SearchPhoneNumbersParams) {
  const searchParams = new URLSearchParams()
  searchParams.set("country", params.country)

  if (params.type) searchParams.set("type", params.type)
  if (params.areaCode) searchParams.set("areaCode", params.areaCode)
  if (params.voice !== undefined) searchParams.set("voice", String(params.voice))
  if (params.sms !== undefined) searchParams.set("sms", String(params.sms))
  if (params.mms !== undefined) searchParams.set("mms", String(params.mms))
  if (params.limit) searchParams.set("limit", String(params.limit))

  return http<AvailablePhoneNumbersResponse>(
    `/phone-numbers/search?${searchParams.toString()}`
  )
}

export interface BuyPhoneNumberInput {
  userId: string
  phoneNumber: string
  country: string
  capabilities?: {
    voice?: boolean
    sms?: boolean
    mms?: boolean
  }
  friendlyName?: string
}

export interface BuyPhoneNumberResponse {
  sid: string
  phoneNumber: string
  friendlyName?: string
}

export function buyPhoneNumber(input: BuyPhoneNumberInput) {
  const requestBody: Record<string, unknown> = {
    userId: input.userId,
    phoneNumber: input.phoneNumber,
    country: input.country,
  }

  if (input.friendlyName) {
    requestBody.friendlyName = input.friendlyName
  }

  if (input.capabilities) {
    requestBody.capabilitiesJSON = input.capabilities
  }

  return http<BuyPhoneNumberResponse>(`/phone-numbers/buy`, {
    method: "POST",
    body: JSON.stringify(requestBody),
  })
}

export function getUserPhoneNumbers() {
  return http<UserPhoneNumber[]>(`/phone-numbers`)
}

export function getPhoneNumber(id: string) {
  return http<UserPhoneNumber>(`/phone-numbers/${id}`)
}

export function updatePhoneNumberFriendlyName(id: string, friendlyName: string) {
  return http<void>(`/phone-numbers/${id}/friendly-name`, {
    method: "POST",
    body: JSON.stringify({ friendlyName }),
  })
}

export function updatePhoneNumberForwarding(id: string, forwardingNumber: string) {
  return http<void>(`/phone-numbers/${id}/forwarding`, {
    method: "POST",
    body: JSON.stringify({ forwardingNumber }),
  })
}

export function updatePhoneNumberAIAssistant(id: string, enabled: boolean) {
  return http<void>(`/phone-numbers/${id}/ai-assistant`, {
    method: "POST",
    body: JSON.stringify({ enabled }),
  })
}

export function updatePhoneNumberStatus(id: string, status: string) {
  return http<void>(`/phone-numbers/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  })
}

export function releasePhoneNumber(id: string) {
  return http<void>(`/phone-numbers/${id}/release`, {
    method: "POST",
  })
}

export interface UpdatePhoneNumberCapabilitiesInput {
  capabilities: Record<string, unknown>
}

export function updatePhoneNumberCapabilities(
  id: string,
  capabilities: Record<string, unknown>
) {
  // Clean the capabilities object to remove undefined values and ensure it's JSON-serializable
  const cleanCapabilities = JSON.parse(JSON.stringify(capabilities));

  // Backend expects capabilities as []byte, which in Go JSON decoding expects base64-encoded string
  const capabilitiesJSON = JSON.stringify(cleanCapabilities);
  const capabilitiesBase64 = btoa(capabilitiesJSON);

  return http<void>(`/phone-numbers/${id}/capabilities`, {
    method: "POST",
    body: JSON.stringify({
      capabilities: capabilitiesBase64
    }),
  })
}

// Phone Number Verification APIs
export interface InitiateVerificationInput {
  userId: string
  phoneNumber: string
}

export interface InitiateVerificationResponse {
  success: boolean
  message: string
}

export function initiatePhoneVerification(input: InitiateVerificationInput) {
  return http<InitiateVerificationResponse>(`/phone-numbers/verify/initiate`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export interface VerifyPhoneNumberInput {
  userId: string
  phoneNumber: string
  code: string
}

export interface VerifyPhoneNumberResponse {
  id: string
  phoneNumber: string
  friendlyName: string
  country: string
  status: string
}

export function verifyPhoneNumber(input: VerifyPhoneNumberInput) {
  return http<VerifyPhoneNumberResponse>(`/phone-numbers/verify/confirm`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

