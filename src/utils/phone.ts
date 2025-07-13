/**
 * Phone number utilities for Senegalese numbers
 */

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length === 9) {
    return `221${cleaned}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith("221")) {
    return cleaned;
  }

  return cleaned;
}

export function validatePhoneNumber(phoneNumber: string): boolean {
  const formatted = formatPhoneNumber(phoneNumber);

  if (formatted.length === 12 && formatted.startsWith("221")) {
    const prefix = formatted.substring(3, 5);
    const validPrefixes = ["70", "75", "76", "77", "78"];
    return validPrefixes.includes(prefix);
  }

  return false;
}
