import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { subDays, format } from "date-fns";

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
