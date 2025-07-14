/**
 * Orange Money API client - Complete implementation
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

    // Orange Money requires PIN for transactions
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
      partner: {
        idType: "MSISDN",
        id: formatPhoneNumber(this.config.apiKey), // Partner's phone number
        encryptedPinCode: encryptedPin,
      },
      customer: {
        idType: "MSISDN",
        id: formatPhoneNumber(request.recipient.phoneNumber),
      },
      amount: {
        value: request.amount.value,
        unit: "XOF",
      },
      reference,
      receiveNotification: true,
      metadata: {
        senderFirstName: request.recipient.name?.split(" ")[0] || "Deggo",
        senderLastName: request.recipient.name?.split(" ")[1] || "User",
      },
    };

    const response = await this.makeRequest<OrangeTransferResponse>(
      "POST",
      ORANGE_ENDPOINTS[this.config.environment].transfer,
      transferRequest
    );

    return {
      transactionId: response.transactionId,
      status: this.mapStatus(response.status),
      amount: request.amount,
      recipient: request.recipient,
      fees: response.fees
        ? {
            value: response.fees.value,
            currency: response.fees.unit as "XOF",
          }
        : { value: 0, currency: "XOF" },
      provider: "orange",
      timestamp: new Date(response.createdAt),
      reference,
      providerReference: response.transactionId,
    };
  }

  async checkBalance(accountId?: string): Promise<AccountBalance> {
    const response = await this.makeRequest<OrangeBalanceResponse>(
      "GET",
      ORANGE_ENDPOINTS[this.config.environment].balance
    );

    return {
      balance: {
        value: response.balance.value,
        currency: response.balance.unit as "XOF",
      },
      provider: "orange",
      accountId: response.accountId,
      lastUpdated: new Date(),
    };
  }

  async getTransactionHistory(
    filter: TransactionFilter
  ): Promise<TransactionHistory> {
    // Based on Orange Sonatel API, implement transaction search
    const params: any = {};

    if (filter.startDate) {
      params.fromDate = filter.startDate.toISOString().split("T")[0];
    }
    if (filter.endDate) {
      params.toDate = filter.endDate.toISOString().split("T")[0];
    }
    if (filter.page) {
      params.page = filter.page;
    }
    if (filter.limit) {
      params.size = filter.limit;
    }

    try {
      const response = await this.makeRequest<any>(
        "GET",
        ORANGE_ENDPOINTS[this.config.environment].history,
        undefined,
        params
      );

      // Transform Orange response to our format
      const transactions = (response.transactions || []).map((tx: any) => ({
        transactionId: tx.transactionId || tx.id,
        status: this.mapStatus(tx.status),
        amount: {
          value: tx.amount?.value || tx.amount,
          currency: "XOF" as const,
        },
        recipient: {
          phoneNumber: tx.customer?.id || tx.recipient?.phoneNumber || "",
          name: tx.customer?.name || tx.recipient?.name,
        },
        fees: {
          value: tx.fees?.value || tx.fees || 0,
          currency: "XOF" as const,
        },
        provider: "orange" as const,
        timestamp: new Date(tx.createdAt || tx.date),
        reference: tx.reference,
        providerReference: tx.transactionId || tx.id,
      }));

      return {
        transactions,
        total: response.totalElements || response.total || transactions.length,
        page: filter.page || 1,
        limit: filter.limit || 50,
        hasMore: response.hasMore || false,
      };
    } catch (error) {
      // If endpoint fails, return empty but don't crash
      console.warn("Transaction history endpoint failed:", error);
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
    // Orange Money fee structure from documentation
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
    const response = await this.makeRequest<OrangeTransferResponse>(
      "GET",
      `${ORANGE_ENDPOINTS[this.config.environment].status}/${transactionId}`
    );

    return {
      transactionId: response.transactionId,
      status: this.mapStatus(response.status),
      amount: {
        value: response.amount.value,
        currency: response.amount.unit as "XOF",
      },
      recipient: { phoneNumber: "" },
      fees: response.fees
        ? {
            value: response.fees.value,
            currency: response.fees.unit as "XOF",
          }
        : { value: 0, currency: "XOF" },
      provider: "orange",
      timestamp: new Date(response.createdAt),
      reference: response.reference,
      providerReference: response.transactionId,
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
      error.response?.data?.error?.code ||
      error.response?.status?.toString() ||
      "UNKNOWN";
    const errorMessage =
      error.response?.data?.error?.message || error.message || "Unknown error";

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
      default:
        return "pending";
    }
  }

  private generateReference(): string {
    return `DEGGO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
