/**
 * Orange Money validation logic
 */

import { PaymentRequest, ValidationResult } from "../../types/common.js";
import { validatePhoneNumber } from "../../utils/phone.js";

export function validateOrangePayment(
  request: PaymentRequest
): ValidationResult {
  const errors: string[] = [];

  // Amount validation
  if (request.amount.value <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (request.amount.value > 300000) {
    errors.push("Amount exceeds Orange Money limit of 300,000 XOF");
  }

  if (request.amount.currency !== "XOF") {
    errors.push("Orange Money only supports XOF currency");
  }

  // Phone number validation
  if (!validatePhoneNumber(request.recipient.phoneNumber)) {
    errors.push("Invalid Senegalese phone number format");
  }

  // Reference validation
  if (request.reference && request.reference.length > 50) {
    errors.push("Reference must be 50 characters or less");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
