/**
 * Orange Money API types - Updated for Orange Sonatel API
 */

import { OrangeProviderConfig } from "../../types/config";

export interface OrangeConfig extends OrangeProviderConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface OrangeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface OrangeTransferRequest {
  partner: {
    idType: "MSISDN";
    id: string;
    encryptedPinCode?: string;
  };
  customer: {
    idType: "MSISDN";
    id: string;
  };
  amount: {
    value: number;
    unit: "XOF";
  };
  reference: string;
  receiveNotification?: boolean;
  metadata?: {
    senderFirstName?: string;
    senderLastName?: string;
  };
}

export interface OrangeTransferResponse {
  transactionId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: {
    value: number;
    unit: "XOF";
  };
  fees?: {
    value: number;
    unit: "XOF";
  };
  reference: string;
  createdAt: string;
}

export interface OrangeBalanceResponse {
  balance: {
    value: number;
    unit: "XOF";
  };
  accountId: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastTransactionDate?: string;
}

export interface OrangePublicKeyResponse {
  publicKey: string;
  keyId: string;
}

export const ORANGE_ENDPOINTS = {
  production: {
    base: "https://api.orange-sonatel.com",
    auth: "/oauth/v1/token",
    publicKey: "/orange-money-webpay/v1/publickey",
    transfer: "/orange-money-webpay/v1/cashin", // or cashout
    balance: "/orange-money-webpay/v1/account/balance",
    history: "/orange-money-webpay/v1/transactions",
    status: "/orange-money-webpay/v1/transactionenquiry",
  },
  sandbox: {
    base: "https://api.sandbox.orange-sonatel.com",
    auth: "/oauth/v1/token",
    publicKey: "/orange-money-webpay/v1/publickey",
    transfer: "/orange-money-webpay/v1/cashin",
    balance: "/orange-money-webpay/v1/account/balance",
    history: "/orange-money-webpay/v1/transactions",
    status: "/orange-money-webpay/v1/transactionenquiry",
  },
} as const;

export const ORANGE_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: "10",
  ACCESS_FORBIDDEN: "11",

  // Business errors
  CUSTOMER_NOT_EXIST: "2000",
  INVALID_MSISDN: "2001",
  PIN_SHOULD_CHANGE: "2010",
  INVALID_PIN_2_ATTEMPTS: "2011",
  INVALID_PIN_1_ATTEMPT: "2012",
  ACCOUNT_BLOCKED: "2013",
  INSUFFICIENT_FUNDS: "2020",
  INSUFFICIENT_FUNDS_PAYER: "2021",
  INSUFFICIENT_FUNDS_PAYEE: "2022",
  BALANCE_MAXIMAL: "2023",
  TRANSACTION_NOT_ALLOWED: "2041",

  // Technical errors
  INVALID_PUBLIC_KEY: "4003",
  INVALID_QR_CODE: "4004",
  BAD_REQUEST: "4099",

  // Parameter errors
  INVALID_INPUT: "20",
  MISSING_BODY: "21",
  INVALID_BODY: "22",
  MISSING_HEADER: "25",

  // Server errors
  INTERNAL_ERROR: "50",
  PENDING_STATE: "51",
  TRY_AGAIN_LATER: "1",
} as const;

export type OrangeErrorCode =
  (typeof ORANGE_ERROR_CODES)[keyof typeof ORANGE_ERROR_CODES];
