/**
 * Core type definitions - kept minimal and focused
 */

export type Currency = "XOF" | "XAF" | "USD" | "EUR";
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled";
export type PaymentProvider =
  | "orange"
  | "wave"
  | "free_money"
  | "poste_finance";

export interface PaymentAmount {
  value: number;
  currency: Currency;
}

export interface PaymentRecipient {
  phoneNumber: string;
  name?: string;
  accountId?: string;
}

export interface PaymentRequest {
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  description?: string;
  reference?: string;
  provider: PaymentProvider;
}

export interface PaymentResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  fees: PaymentAmount;
  provider: PaymentProvider;
  timestamp: Date;
  reference?: string;
  providerReference?: string;
}

export interface AccountBalance {
  balance: PaymentAmount;
  provider: PaymentProvider;
  accountId: string;
  lastUpdated: Date;
}

export interface TransactionFilter {
  provider?: PaymentProvider;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface TransactionHistory {
  transactions: PaymentResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
