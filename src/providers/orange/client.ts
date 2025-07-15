/**
 * Orange Money API client
 */

import axios, { AxiosInstance } from "axios";
import { IPaymentProvider } from "../base.js";
import {
  PaymentRequest,
  PaymentResponse,
  AccountBalance,
  TransactionHistory,
  TransactionFilter,
  ValidationResult,
  PaymentAmount,
} from "../../types/common.js";
import {
  OrangeConfig,
  OrangeTransferRequest,
  OrangeTransferResponse,
  OrangeBalanceResponse,
  ORANGE_ENDPOINTS,
  ORANGE_ERROR_CODES,
} from "./types.js";
import { OrangeAuth } from "./auth.js";
import { validateOrangePayment } from "./validator.js";
import { formatPhoneNumber } from "../../utils/phone.js";
import { DeggoError, ERROR_CODES } from "../../core/errors.js";

export class OrangeClient implements IPaymentProvider {
  private readonly httpClient: AxiosInstance;
  private readonly auth: OrangeAuth;

  constructor(private readonly config: OrangeConfig) {
    this.auth = new OrangeAuth(config);

    const baseURL = config.baseUrl || ORANGE_ENDPOINTS[config.environment].base;
    this.httpClient = axios.create({
      baseURL,
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

    if (!this.config.pinCode) {
      throw new DeggoError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "PIN code is required for Orange Money transactions",
        undefined,
        "orange"
      );
    }

    const encryptedPin = await this.auth.encryptPinCode(this.config.pinCode);
    const reference = request.reference || this.generateReference();

    const transferRequest: OrangeTransferRequest = {
      recipient: {
        msisdn: formatPhoneNumber(request.recipient.phoneNumber),
      },
      amount: {
        value: request.amount.value,
        currency: "XOF",
      },
      partner: {
        msisdn: formatPhoneNumber(this.config.apiKey),
        encrypted_pin: encryptedPin,
      },
      reference,
    };

    const response = await this.makeRequest<OrangeTransferResponse>(
      "POST",
      ORANGE_ENDPOINTS[this.config.environment].cashin,
      transferRequest
    );

    return {
      transactionId: response.transaction_id,
      status: this.mapStatus(response.status),
      amount: request.amount,
      recipient: request.recipient,
      fees: response.fees
        ? {
            value: response.fees.value,
            currency: response.fees.currency as "XOF",
          }
        : { value: 0, currency: "XOF" },
      provider: "orange",
      timestamp: new Date(response.created_date),
      reference,
      providerReference: response.transaction_id,
    };
  }

  async checkBalance(accountId?: string): Promise<AccountBalance> {
    const msisdn = accountId || this.config.apiKey;

    const response = await this.makeRequest<OrangeBalanceResponse>(
      "GET",
      `${
        ORANGE_ENDPOINTS[this.config.environment].balance
      }?msisdn=${formatPhoneNumber(msisdn)}`
    );

    return {
      balance: {
        value: response.balance.value,
        currency: response.balance.currency as "XOF",
      },
      provider: "orange",
      accountId: response.msisdn,
      lastUpdated: new Date(),
    };
  }

  async getTransactionHistory(
    filter: TransactionFilter
  ): Promise<TransactionHistory> {
    const params: any = {
      msisdn: formatPhoneNumber(this.config.apiKey),
    };

    if (filter.startDate) {
      params.start_date = filter.startDate.toISOString().split("T")[0];
    }
    if (filter.endDate) {
      params.end_date = filter.endDate.toISOString().split("T")[0];
    }
    if (filter.page) {
      params.page = filter.page;
    }
    if (filter.limit) {
      params.size = filter.limit;
    }

    try {
      const response = await this.makeRequest<any>(
        "POST",
        ORANGE_ENDPOINTS[this.config.environment].history,
        params
      );

      const transactions = (response.transactions || []).map((tx: any) => ({
        transactionId: tx.transaction_id,
        status: this.mapStatus(tx.status),
        amount: {
          value: tx.amount.value,
          currency: "XOF" as const,
        },
        recipient: {
          phoneNumber: tx.recipient?.msisdn || "",
          name: undefined,
        },
        fees: {
          value: tx.fees?.value || 0,
          currency: "XOF" as const,
        },
        provider: "orange" as const,
        timestamp: new Date(tx.created_date),
        reference: tx.reference,
        providerReference: tx.transaction_id,
      }));

      return {
        transactions,
        total: response.total_count || transactions.length,
        page: filter.page || 1,
        limit: filter.limit || 50,
        hasMore: response.has_more || false,
      };
    } catch (error) {
      return {
        transactions: [],
        total: 0,
        page: filter.page || 1,
        limit: filter.limit || 50,
        hasMore: false,
      };
    }
  }

  async calculateFees(
    amount: PaymentAmount,
    recipient: string
  ): Promise<PaymentAmount> {
    const value = amount.value;
    let fee = 0;

    // Updated fees based on official Orange Money Senegal documentation
    if (value <= 500) {
      fee = 0; // Free
    } else if (value <= 2000) {
      fee = 0; // Free
    } else if (value <= 3000) {
      fee = 15;
    } else if (value <= 5000) {
      fee = 25;
    } else if (value <= 10000) {
      fee = 50;
    } else if (value <= 15000) {
      fee = 50;
    } else {
      // For larger amounts, use 0.8% commission rate for transfers
      fee = Math.round(value * 0.008); // 0.8%
    }

    return { value: fee, currency: "XOF" };
  }

  async validatePaymentRequest(
    request: PaymentRequest
  ): Promise<ValidationResult> {
    return validateOrangePayment(request);
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse> {
    const requestData = {
      transaction_id: transactionId,
      msisdn: formatPhoneNumber(this.config.apiKey),
    };

    const response = await this.makeRequest<OrangeTransferResponse>(
      "POST",
      ORANGE_ENDPOINTS[this.config.environment].status,
      requestData
    );

    return {
      transactionId: response.transaction_id,
      status: this.mapStatus(response.status),
      amount: {
        value: response.amount.value,
        currency: response.amount.currency as "XOF",
      },
      recipient: {
        phoneNumber: response.recipient?.msisdn || "",
      },
      fees: response.fees
        ? {
            value: response.fees.value,
            currency: response.fees.currency as "XOF",
          }
        : { value: 0, currency: "XOF" },
      provider: "orange",
      timestamp: new Date(response.created_date),
      reference: response.reference,
      providerReference: response.transaction_id,
    };
  }

  async testConnection(): Promise<boolean> {
    return this.auth.testConnection();
  }

  getProviderName() {
    return "orange" as const;
  }

  private async makeRequest<T>(
    method: "GET" | "POST",
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const headers = await this.auth.getAuthHeaders();

    try {
      const response = await this.httpClient.request<T>({
        method,
        url: endpoint,
        data,
        params,
        headers,
      });

      return response.data;
    } catch (error: any) {
      this.handleApiError(error);
    }
  }

  private handleApiError(error: any): never {
    const errorCode =
      error.response?.data?.error_code ||
      error.response?.status?.toString() ||
      "UNKNOWN";
    const errorMessage =
      error.response?.data?.error_message || error.message || "Unknown error";

    let deggoErrorCode: string = ERROR_CODES.NETWORK_ERROR;

    switch (errorCode) {
      case ORANGE_ERROR_CODES.INSUFFICIENT_FUNDS:
      case ORANGE_ERROR_CODES.INSUFFICIENT_FUNDS_PAYER:
      case ORANGE_ERROR_CODES.INSUFFICIENT_FUNDS_PAYEE:
        deggoErrorCode = ERROR_CODES.INSUFFICIENT_FUNDS;
        break;
      case ORANGE_ERROR_CODES.INVALID_MSISDN:
        deggoErrorCode = ERROR_CODES.INVALID_RECIPIENT;
        break;
      case ORANGE_ERROR_CODES.INVALID_CREDENTIALS:
        deggoErrorCode = ERROR_CODES.INVALID_CREDENTIALS;
        break;
      case ORANGE_ERROR_CODES.TRANSACTION_NOT_ALLOWED:
        deggoErrorCode = ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED;
        break;
      case ORANGE_ERROR_CODES.ACCOUNT_BLOCKED:
        deggoErrorCode = ERROR_CODES.ACCOUNT_SUSPENDED;
        break;
    }

    throw new DeggoError(
      deggoErrorCode,
      errorMessage,
      error.response?.data,
      "orange"
    );
  }

  private mapStatus(
    status: string
  ): "pending" | "completed" | "failed" | "cancelled" {
    switch (status) {
      case "SUCCESS":
        return "completed";
      case "PENDING":
        return "pending";
      case "FAILED":
        return "failed";
      case "EXPIRED":
        return "cancelled";
      default:
        return "pending";
    }
  }

  private generateReference(): string {
    return `DEGGO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
