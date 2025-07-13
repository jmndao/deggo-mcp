/**
 * Orange Money API types - clean and focused
 */

import { ProviderConfig } from "../../types/config";

export interface OrangeConfig extends ProviderConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface OrangeAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface OrangeTransferRequest {
  recipient_phone: string;
  amount: number;
  currency: "XOF";
  reference: string;
  description?: string;
  recipient_name?: string;
}

export interface OrangeTransferResponse {
  transaction_id: string;
  status: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  currency: "XOF";
  fees: number;
  reference: string;
  recipient_phone: string;
  message: string;
  created_at: string;
}

export interface OrangeBalanceResponse {
  balance: number;
  currency: "XOF";
  account_id: string;
  account_name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  last_transaction_date: string;
}

export interface OrangeTransaction {
  transaction_id: string;
  order_id: string;
  amount: number;
  currency: "XOF";
  fees: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  type: "PAYMENT" | "TRANSFER" | "WITHDRAWAL" | "DEPOSIT";
  description?: string;
  reference?: string;
  recipient?: {
    phone_number: string;
    name?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrangeTransactionHistoryResponse {
  transactions: OrangeTransaction[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export const ORANGE_ENDPOINTS = {
  production: {
    auth: "https://api.orange.com/oauth/v3/token",
    transfer:
      "https://api.orange.com/orange-money-webpay/v1/transactionenquiry",
    balance: "https://api.orange.com/orange-money-webpay/v1/account/balance",
    history: "https://api.orange.com/orange-money-webpay/v1/transactions",
  },
  sandbox: {
    auth: "https://api.orange.com/oauth/v3/token",
    transfer:
      "https://api.orange.com/orange-money-webpay/v1/transactionenquiry",
    balance: "https://api.orange.com/orange-money-webpay/v1/account/balance",
    history: "https://api.orange.com/orange-money-webpay/v1/transactions",
  },
} as const;
