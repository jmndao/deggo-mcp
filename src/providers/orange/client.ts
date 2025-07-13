/**
 * Orange Money API client - clean implementation
 */

import axios, { AxiosInstance } from "axios";
import { IPaymentProvider } from "../base";
import {
  PaymentRequest,
  PaymentResponse,
  AccountBalance,
  TransactionHistory,
  TransactionFilter,
  ValidationResult,
  PaymentAmount,
} from "../../types/common";
import {
  OrangeConfig,
  OrangeTransferRequest,
  OrangeTransferResponse,
  OrangeBalanceResponse,
  OrangeTransactionHistoryResponse,
  ORANGE_ENDPOINTS,
} from "./types";
import { OrangeAuth } from "./auth";
import { validateOrangePayment } from "./validator";
import { formatPhoneNumber } from "../../utils/phone";
import {
  formatAmountForProvider,
  parseAmountFromProvider,
} from "../../utils/amount";
import { DeggoError, ERROR_CODES } from "../../core/errors";

export class OrangeClient implements IPaymentProvider {
  private httpClient: AxiosInstance;
  private auth: OrangeAuth;

  constructor(private config: OrangeConfig) {
    this.auth = new OrangeAuth(config);
    this.httpClient = axios.create({
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  async sendMoney(request: PaymentRequest): Promise<PaymentResponse> {
    const validation = await this.validatePaymentRequest(request);
    if (!validation.isValid) {
      throw new DeggoError(
        ERROR_CODES.INVALID_AMOUNT,
        `Invalid payment: ${validation.errors.join(", ")}`,
        validation.errors,
        "orange"
      );
    }

    const transferRequest: OrangeTransferRequest = {
      recipient_phone: formatPhoneNumber(request.recipient.phoneNumber),
      amount: formatAmountForProvider(request.amount),
      currency: "XOF",
      reference: request.reference || this.generateReference(),
      description: request.description,
      recipient_name: request.recipient.name,
    };

    const response = await this.makeRequest<OrangeTransferResponse>(
      "POST",
      ORANGE_ENDPOINTS[this.config.environment].transfer,
      transferRequest
    );

    return {
      transactionId: response.transaction_id,
      status: this.mapStatus(response.status),
      amount: request.amount,
      recipient: request.recipient,
      fees: parseAmountFromProvider(response.fees, "XOF"),
      provider: "orange",
      timestamp: new Date(response.created_at),
      reference: response.reference,
      providerReference: response.transaction_id,
    };
  }

  async checkBalance(accountId?: string): Promise<AccountBalance> {
    const response = await this.makeRequest<OrangeBalanceResponse>(
      "GET",
      ORANGE_ENDPOINTS[this.config.environment].balance
    );

    return {
      balance: parseAmountFromProvider(response.balance, response.currency),
      provider: "orange",
      accountId: response.account_id,
      lastUpdated: new Date(),
    };
  }

  async getTransactionHistory(
    filter: TransactionFilter
  ): Promise<TransactionHistory> {
    const params = {
      start_date: filter.startDate?.toISOString(),
      end_date: filter.endDate?.toISOString(),
      page: filter.page || 1,
      limit: filter.limit || 50,
    };

    const response = await this.makeRequest<OrangeTransactionHistoryResponse>(
      "GET",
      ORANGE_ENDPOINTS[this.config.environment].history,
      undefined,
      params
    );

    const transactions = response.transactions.map((tx) => ({
      transactionId: tx.transaction_id,
      status: this.mapStatus(tx.status),
      amount: parseAmountFromProvider(tx.amount, tx.currency),
      recipient: {
        phoneNumber: tx.recipient?.phone_number || "",
        name: tx.recipient?.name,
      },
      fees: parseAmountFromProvider(tx.fees, tx.currency),
      provider: "orange" as const,
      timestamp: new Date(tx.created_at),
      reference: tx.reference,
      providerReference: tx.transaction_id,
    }));

    return {
      transactions,
      total: response.total,
      page: response.page,
      limit: response.limit,
      hasMore: response.has_more,
    };
  }

  async calculateFees(
    amount: PaymentAmount,
    recipient: string
  ): Promise<PaymentAmount> {
    // Orange Money fee structure - simplified
    const value = amount.value;
    let fee = 0;

    if (value <= 2500) fee = 0;
    else if (value <= 5000) fee = 100;
    else if (value <= 15000) fee = 200;
    else if (value <= 25000) fee = 400;
    else if (value <= 50000) fee = 800;
    else if (value <= 125000) fee = 1500;
    else fee = 2500;

    return { value: fee, currency: "XOF" };
  }

  async validatePaymentRequest(
    request: PaymentRequest
  ): Promise<ValidationResult> {
    return validateOrangePayment(request);
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse> {
    // Implementation would depend on Orange Money status endpoint
    throw new DeggoError(
      ERROR_CODES.NETWORK_ERROR,
      "Status check not implemented"
    );
  }

  async testConnection(): Promise<boolean> {
    return this.auth.testConnection();
  }

  getProviderName() {
    return "orange" as const;
  }

  private async makeRequest<T>(
    method: "GET" | "POST",
    url: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const token = await this.auth.getAccessToken();

    try {
      const response = await this.httpClient.request<T>({
        method,
        url,
        data,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new DeggoError(
        ERROR_CODES.NETWORK_ERROR,
        "Orange Money API request failed",
        error.response?.data,
        "orange"
      );
    }
  }

  private mapStatus(
    status: string
  ): "pending" | "completed" | "failed" | "cancelled" {
    switch (status) {
      case "SUCCESS":
        return "completed";
      case "PENDING":
      case "INITIATED":
        return "pending";
      case "FAILED":
        return "failed";
      default:
        return "pending";
    }
  }

  private generateReference(): string {
    return `DEGGO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
