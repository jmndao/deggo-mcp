/**
 * Orange (SONATEL) Money API types
 */

import { OrangeProviderConfig } from "../../types/config.js";

export interface OrangeConfig extends OrangeProviderConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface OrangeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface OrangeTransferRequest {
  recipient: {
    msisdn: string;
  };
  amount: {
    value: number;
    currency: "XOF";
  };
  partner: {
    msisdn: string;
    encrypted_pin: string;
  };
  reference?: string;
  callback_url?: string;
}

export interface OrangeTransferResponse {
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
  transaction_id: string;
  amount: {
    value: number;
    currency: "XOF";
  };
  fees?: {
    value: number;
    currency: "XOF";
  };
  recipient: {
    msisdn: string;
  };
  partner: {
    msisdn: string;
  };
  created_date: string;
  reference?: string;
}

export interface OrangeBalanceResponse {
  msisdn: string;
  balance: {
    value: number;
    currency: "XOF";
  };
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export interface OrangePublicKeyResponse {
  public_key: string;
}

export const ORANGE_ENDPOINTS = {
  production: {
    base: "https://api.orange-sonatel.com",
    auth: "/oauth/v1/token",
    publicKey: "/api/eWallet/v1/publickeys",
    cashin: "/api/eWallet/v1/cashins",
    balance: "/api/eWallet/v1/account/customer/balance",
    history: "/api/eWallet/v1/transactions",
    status: "/api/eWallet/v1/transactionstatus",
  },
  sandbox: {
    base: "https://api.sandbox.orange-sonatel.com",
    auth: "/oauth/v1/token",
    publicKey: "/api/eWallet/v1/publickeys",
    cashin: "/api/eWallet/v1/cashins",
    balance: "/api/eWallet/v1/account/customer/balance",
    history: "/api/eWallet/v1/transactions",
    status: "/api/eWallet/v1/transactionstatus",
  },
} as const;

export const ORANGE_ERROR_CODES = {
  INVALID_CREDENTIALS: "10",
  CUSTOMER_NOT_EXIST: "2000",
  INVALID_MSISDN: "2001",
  ACCOUNT_BLOCKED: "2013",
  INSUFFICIENT_FUNDS: "2020",
  INSUFFICIENT_FUNDS_PAYER: "2021",
  INSUFFICIENT_FUNDS_PAYEE: "2022",
  TRANSACTION_NOT_ALLOWED: "2041",
  BAD_REQUEST: "4099",
  INTERNAL_ERROR: "50",
} as const;

export type OrangeErrorCode =
  (typeof ORANGE_ERROR_CODES)[keyof typeof ORANGE_ERROR_CODES];
