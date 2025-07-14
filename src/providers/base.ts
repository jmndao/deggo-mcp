/**
 * Base provider interface - clean and simple
 */

import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  AccountBalance,
  TransactionHistory,
  TransactionFilter,
  ValidationResult,
  PaymentAmount,
} from "../types/common.js";

export interface IPaymentProvider {
  sendMoney(request: PaymentRequest): Promise<PaymentResponse>;
  checkBalance(accountId?: string): Promise<AccountBalance>;
  getTransactionHistory(filter: TransactionFilter): Promise<TransactionHistory>;
  calculateFees(
    amount: PaymentAmount,
    recipient: string
  ): Promise<PaymentAmount>;
  validatePaymentRequest(request: PaymentRequest): Promise<ValidationResult>;
  getTransactionStatus(transactionId: string): Promise<PaymentResponse>;
  testConnection(): Promise<boolean>;
  getProviderName(): PaymentProvider;
}
