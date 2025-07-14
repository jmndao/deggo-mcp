/**
 * Error handling classes and utilities
 */

import { PaymentProvider } from "../types/common.js";

export class DeggoError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public provider?: PaymentProvider
  ) {
    super(message);
    this.name = "DeggoError";
  }
}

export const ERROR_CODES = {
  // Configuration errors
  PROVIDER_NOT_CONFIGURED: "PROVIDER_NOT_CONFIGURED",
  INVALID_CONFIG: "INVALID_CONFIG",

  // Authentication errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  API_KEY_INVALID: "API_KEY_INVALID",

  // Transaction errors
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  INVALID_RECIPIENT: "INVALID_RECIPIENT",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  TRANSACTION_LIMIT_EXCEEDED: "TRANSACTION_LIMIT_EXCEEDED",
  DUPLICATE_TRANSACTION: "DUPLICATE_TRANSACTION",

  // System errors
  NETWORK_ERROR: "NETWORK_ERROR",
  MAINTENANCE_MODE: "MAINTENANCE_MODE",
  TRANSACTION_NOT_FOUND: "TRANSACTION_NOT_FOUND",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
