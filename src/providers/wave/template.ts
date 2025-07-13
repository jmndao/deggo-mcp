/**
 * Wave Provider Implementation Template
 * TODO: Research Wave API and implement these interfaces
 */

import { ProviderConfig } from "../../types/config";

// TODO: Research Wave API documentation to fill these out
export interface WaveConfig extends ProviderConfig {
  // Does Wave need additional config beyond base ProviderConfig?
  // Example: Some APIs need webhook secrets, API versions, etc.
}

export interface WaveTransferRequest {
  // TODO: What fields does Wave's transfer API expect?
  // Research Wave API docs for:
  // - recipient field name and format
  // - amount field and currency handling
  // - reference/description fields
  // - any Wave-specific required fields
}

export interface WaveTransferResponse {
  // TODO: What does Wave return after a transfer?
  // Research response format for:
  // - transaction ID field name
  // - status values Wave uses
  // - fee information format
  // - timestamp format
}

export interface WaveBalanceResponse {
  // TODO: Wave's balance response format
}

export interface WaveTransaction {
  // TODO: Wave's transaction history format
}

export const WAVE_ENDPOINTS = {
  production: {
    // TODO: Research Wave's production API base URL
    base: "https://api.wave.com/v1/", // Example - verify actual URL
    transfer: "transfers", // Example - verify actual endpoint
    balance: "balance",
    history: "transactions",
  },
  sandbox: {
    // TODO: Research Wave's sandbox/test environment
    base: "https://sandbox-api.wave.com/v1/", // Example
    transfer: "transfers",
    balance: "balance",
    history: "transactions",
  },
} as const;

// TODO: Research Wave's error codes
export const WAVE_ERROR_CODES = {
  // What error codes does Wave API return?
  // Examples:
  // INSUFFICIENT_BALANCE: 'insufficient_balance',
  // INVALID_PHONE: 'invalid_phone_number',
  // etc.
} as const;

/**
 * Learning Exercise Questions:
 *
 * 1. Authentication:
 *    - Does Wave use API keys, OAuth, or something else?
 *    - Are there special headers required?
 *
 * 2. Request Format:
 *    - How does Wave expect phone numbers? (with/without country code?)
 *    - Does Wave use centimes or francs for amounts?
 *    - What's the maximum transfer amount?
 *
 * 3. Response Format:
 *    - What field names does Wave use for transaction ID?
 *    - What status values does Wave return?
 *    - How are fees represented?
 *
 * 4. Business Rules:
 *    - What are Wave's minimum/maximum transfer limits?
 *    - What phone number formats does Wave accept?
 *    - What currencies does Wave support?
 *
 * 5. Error Handling:
 *    - What HTTP status codes does Wave use?
 *    - What error response format does Wave use?
 *    - How should we map Wave errors to our common error codes?
 */
