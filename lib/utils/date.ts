/**
 * Format a date string to a localized short date format
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "-"
 */
export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  } catch {
    return "-";
  }
}

/**
 * Format a date string to a localized long date format
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string (e.g., "January 15, 2024") or "N/A"
 */
export function formatLongDate(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}




