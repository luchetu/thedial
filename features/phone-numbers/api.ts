import { http } from "@/lib/http/client"
import type {
  AvailablePhoneNumbersResponse,
  SearchPhoneNumbersParams,
  Region,
  UserPhoneNumber,
} from "./types"

export function getRegions() {
  return http<Region[]>(`/twilio/regions`)
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
    `/twilio/numbers/search?${searchParams.toString()}`
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
  
  return http<BuyPhoneNumberResponse>(`/twilio/numbers/buy`, {
    method: "POST",
    body: JSON.stringify(requestBody),
  })
}

export function getUserPhoneNumbers() {
  return http<UserPhoneNumber[]>(`/phone-numbers`)
}

