import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { subDays, format } from "date-fns";
import { Participant } from "livekit-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getDefaultRangeDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = subDays(to, days);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function secondsToMinutes(seconds: number): string {
  if (!seconds) return "0";
  const mins = seconds / 60;
  return mins.toFixed(1);
}

// Simple US phone formatter: +14155551234 -> (415) 555-1234
export function formatPhoneNumber(phoneNumberString: string) {
  const cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const intlCode = (match[1] ? "+1 " : "");
    return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
  }
  return phoneNumberString;
}


export function getFriendlyName(participant: Participant) {
  const id = participant?.identity || "";
  const name = participant?.name;

  // 1. If we have a real name, use it
  if (name) return name;

  // 2. If it's the Agent
  if (id.startsWith("agent")) return "Dial AI Code";

  // 3. If it's a Phone Caller (SIP)
  if (id.startsWith("sip_")) {
    const number = id.replace("sip_", "");
    return `Client ${formatPhoneNumber(number)}`;
  }

  // 4. Default
  return "Me";
}

