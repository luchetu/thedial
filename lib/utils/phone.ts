/**
 * Phone number formatting and normalization utilities
 */

/**
 * Formats a phone number for display by allowing only digits, spaces, dashes, parentheses, and +
 * This is used for input fields to allow user-friendly formatting
 * 
 * @param value - The phone number string to format
 * @returns Formatted phone number string
 * 
 * @example
 * formatPhoneNumber("(555) 123-4567") // "(555) 123-4567"
 * formatPhoneNumber("555-123-4567") // "555-123-4567"
 * formatPhoneNumber("+1 555 123 4567") // "+1 555 123 4567"
 */
export function formatPhoneNumber(value: string): string {
  // Allow digits, spaces, dashes, parentheses, and +
  return value.replace(/[^\d+\-()\s]/g, "");
}

/**
 * Normalizes a phone number to E.164 format (+[country code][number])
 * E.164 is the international standard for phone numbers
 * 
 * @param phone - The phone number string to normalize
 * @returns E.164 formatted phone number (e.g., "+14155551234")
 * 
 * @example
 * normalizeToE164("(555) 123-4567") // "+15551234567"
 * normalizeToE164("5551234567") // "+15551234567"
 * normalizeToE164("+1 555 123 4567") // "+15551234567"
 * normalizeToE164("01234567890") // "+1234567890" (removes leading zero)
 */
export function normalizeToE164(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // If it doesn't start with +, try to format it
  if (!cleaned.startsWith("+")) {
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, "");
    
    // If it's 10 digits, assume US number (+1)
    if (cleaned.length === 10) {
      cleaned = `+1${cleaned}`;
    } else if (cleaned.length > 0) {
      // Add + if missing
      cleaned = `+${cleaned}`;
    }
  }
  
  return cleaned;
}

/**
 * Validates if a phone number is in valid E.164 format
 * E.164 format: +[country code][number] (1-15 digits total after +)
 * 
 * @param phone - The phone number to validate
 * @returns true if the phone number is in valid E.164 format
 * 
 * @example
 * isValidE164("+14155551234") // true
 * isValidE164("+442071234567") // true
 * isValidE164("5551234567") // false (missing +)
 * isValidE164("+123") // false (too short)
 */
export function isValidE164(phone: string): boolean {
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  return e164Pattern.test(phone);
}

/**
 * Formats a phone number for display in a user-friendly way
 * Converts E.164 format to a more readable format
 * 
 * @param phone - E.164 formatted phone number (e.g., "+14155551234")
 * @returns Formatted phone number string (e.g., "+1 (415) 555-1234")
 * 
 * @example
 * formatPhoneNumberDisplay("+14155551234") // "+1 (415) 555-1234"
 * formatPhoneNumberDisplay("+442071234567") // "+44 20 7123 4567"
 */
export function formatPhoneNumberDisplay(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");
  
  // US/Canada numbers (+1)
  if (digits.startsWith("1") && digits.length === 11) {
    const countryCode = digits.slice(0, 1);
    const areaCode = digits.slice(1, 4);
    const exchange = digits.slice(4, 7);
    const number = digits.slice(7);
    return `+${countryCode} (${areaCode}) ${exchange}-${number}`;
  }
  
  // UK numbers (+44)
  if (digits.startsWith("44") && digits.length >= 10) {
    const countryCode = digits.slice(0, 2);
    const rest = digits.slice(2);
    // Format UK numbers: +44 20 7123 4567
    if (rest.length === 10) {
      return `+${countryCode} ${rest.slice(0, 2)} ${rest.slice(2, 6)} ${rest.slice(6)}`;
    }
  }
  
  // Default: just add + prefix if missing
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  
  return phone;
}

