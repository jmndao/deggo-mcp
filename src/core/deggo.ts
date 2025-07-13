/**
 * Main Deggo class - clean and focused
 */

import { DeggoConfig, PartialDeggoConfig } from "../types/config";
import {
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  AccountBalance,
  TransactionHistory,
  TransactionFilter,
} from "../types/common";
import { IPaymentProvider } from "../providers/base";
import { createConfig } from "../config";
import { createProviders } from "../providers/factory";
import { DeggoError, ERROR_CODES } from "./errors";

export class Deggo {
  private config: DeggoConfig;
  private providers: Map<PaymentProvider, IPaymentProvider> = new Map();

  constructor(config?: PartialDeggoConfig) {
    this.config = createConfig(config);
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const providers = createProviders(this.config);

    providers.forEach((provider, name) => {
      this.providers.set(name, provider);
    });

    if (this.providers.size === 0) {
      throw new DeggoError(
        ERROR_CODES.INVALID_CONFIG,
        "No payment providers configured"
      );
    }
  }

  async sendMoney(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.getProvider(request.provider);
    return provider.sendMoney(request);
  }

  async checkBalance(
    providerName: PaymentProvider,
    accountId?: string
  ): Promise<AccountBalance> {
    const provider = this.getProvider(providerName);
    return provider.checkBalance(accountId);
  }

  async getTransactionHistory(
    filter: TransactionFilter
  ): Promise<TransactionHistory> {
    if (filter.provider) {
      const provider = this.getProvider(filter.provider);
      return provider.getTransactionHistory(filter);
    }

    // Aggregate from all providers if none specified
    const allTransactions: PaymentResponse[] = [];

    for (const [, provider] of this.providers) {
      try {
        const history = await provider.getTransactionHistory(filter);
        allTransactions.push(...history.transactions);
      } catch (error) {
        console.warn(`Failed to get history from provider:`, error);
      }
    }

    allTransactions.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const page = filter.page || 1;
    const limit = filter.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      transactions: allTransactions.slice(startIndex, endIndex),
      total: allTransactions.length,
      page,
      limit,
      hasMore: endIndex < allTransactions.length,
    };
  }

  getAvailableProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }

  async testConnections(): Promise<Record<PaymentProvider, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [providerName, provider] of this.providers) {
      try {
        results[providerName] = await provider.testConnection();
      } catch {
        results[providerName] = false;
      }
    }

    return results as Record<PaymentProvider, boolean>;
  }

  private getProvider(providerName: PaymentProvider): IPaymentProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new DeggoError(
        ERROR_CODES.PROVIDER_NOT_CONFIGURED,
        `Provider ${providerName} is not configured`
      );
    }
    return provider;
  }
}
