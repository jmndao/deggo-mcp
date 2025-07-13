# Adding a New Payment Provider

This guide helps contributors add support for any new payment provider to Deggo MCP.

## Overview

Deggo MCP uses a provider pattern that makes it easy to add new payment services. Each provider implements the same interface, ensuring consistent behavior across all payment methods.

## Implementation Steps

### 1. Research the Provider API

Before implementation, gather information about:

- **API Documentation**: Endpoints, authentication, request/response formats
- **Business Rules**: Transaction limits, fees, supported currencies
- **Error Handling**: Error codes and status messages
- **Authentication**: API keys, OAuth, or other auth methods

### 2. Create Provider Structure

Create a new directory: `src/providers/your-provider/`

```
src/providers/your-provider/
├── types.ts      # API types and interfaces
├── auth.ts       # Authentication handling
├── client.ts     # Main implementation
└── validator.ts  # Business validation rules
```

### 3. Define Types

In `types.ts`, define provider-specific interfaces:

```typescript
import { ProviderConfig } from "../../types/config";

export interface YourProviderConfig extends ProviderConfig {
  // Add any provider-specific config
}

export interface YourProviderRequest {
  // Define API request format
}

export interface YourProviderResponse {
  // Define API response format
}

export const YOUR_PROVIDER_ENDPOINTS = {
  production: {
    base: "https://api.yourprovider.com/v1/",
    // ... endpoints
  },
  sandbox: {
    base: "https://sandbox.yourprovider.com/v1/",
    // ... endpoints
  },
} as const;
```

### 4. Implement Authentication

In `auth.ts`, handle authentication:

```typescript
export class YourProviderAuth {
  constructor(private config: YourProviderConfig) {}

  async getAuthHeaders(): Promise<Record<string, string>> {
    // Return required headers for API calls
  }

  async testConnection(): Promise<boolean> {
    // Test if authentication works
  }
}
```

### 5. Create Main Client

In `client.ts`, implement the `IPaymentProvider` interface:

```typescript
import { IPaymentProvider } from "../base";

export class YourProviderClient implements IPaymentProvider {
  async sendMoney(request: PaymentRequest): Promise<PaymentResponse> {
    // Implement money transfer
  }

  async checkBalance(accountId?: string): Promise<AccountBalance> {
    // Implement balance checking
  }

  async getTransactionHistory(
    filter: TransactionFilter
  ): Promise<TransactionHistory> {
    // Implement transaction history
  }

  async calculateFees(
    amount: PaymentAmount,
    recipient: string
  ): Promise<PaymentAmount> {
    // Implement fee calculation
  }

  async validatePaymentRequest(
    request: PaymentRequest
  ): Promise<ValidationResult> {
    // Implement validation
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse> {
    // Implement status checking
  }

  async testConnection(): Promise<boolean> {
    // Test provider connection
  }

  getProviderName() {
    return "your_provider" as const;
  }
}
```

### 6. Add Validation Rules

In `validator.ts`, implement business rules:

```typescript
export function validateYourProviderPayment(
  request: PaymentRequest
): ValidationResult {
  const errors: string[] = [];

  // Add provider-specific validation:
  // - Amount limits
  // - Currency support
  // - Phone number formats
  // - etc.

  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 7. Update Provider Factory

Add your provider to `src/providers/factory.ts`:

```typescript
import { YourProviderClient } from "./your-provider/client";

export function createProviders(
  config: DeggoConfig
): Map<PaymentProvider, IPaymentProvider> {
  const providers = new Map<PaymentProvider, IPaymentProvider>();

  // Existing providers...

  // Add your provider
  if (config.providers.your_provider) {
    providers.set(
      "your_provider",
      new YourProviderClient(config.providers.your_provider)
    );
  }

  return providers;
}
```

### 8. Update Type Definitions

Add your provider to `src/types/common.ts`:

```typescript
export type PaymentProvider =
  | "orange"
  | "wave"
  | "your_provider"
  | "other_providers";
```

And to `src/types/config.ts`:

```typescript
export interface DeggoConfig {
  providers: {
    orange?: ProviderConfig;
    wave?: ProviderConfig;
    your_provider?: ProviderConfig;
    // ... other providers
  };
  // ... rest of config
}
```

### 9. Write Tests

Create comprehensive tests in `tests/providers/your-provider/`:

```
tests/providers/your-provider/
├── client.test.ts     # Main functionality tests
└── validator.test.ts  # Validation tests
```

Mock the provider's API responses:

```typescript
// tests/__mocks__/your-provider-api.ts
export const mockYourProviderAuth = {
  // Mock auth response
};

export const mockYourProviderTransfer = {
  // Mock transfer response
};
```

### 10. Update Documentation

- Update `README.md` with configuration example
- Update `docs/API.md` with provider-specific notes
- Add provider to MCP tools enum lists

## Implementation Checklist

- [ ] Provider directory created
- [ ] Types defined for all API interactions
- [ ] Authentication implemented and tested
- [ ] All `IPaymentProvider` methods implemented
- [ ] Validation rules for business logic
- [ ] Error handling with proper error codes
- [ ] Provider added to factory
- [ ] Type definitions updated
- [ ] Unit tests written with mocks
- [ ] Integration tests (optional)
- [ ] Documentation updated

## Common Patterns

### Error Mapping

```typescript
private mapProviderError(error: any): DeggoError {
  // Map provider-specific errors to common error codes
  switch (error.code) {
    case 'INSUFFICIENT_BALANCE':
      return new DeggoError(ERROR_CODES.INSUFFICIENT_FUNDS, error.message, error, 'your_provider');
    default:
      return new DeggoError(ERROR_CODES.NETWORK_ERROR, error.message, error, 'your_provider');
  }
}
```

### Status Mapping

```typescript
private mapStatus(providerStatus: string): TransactionStatus {
  switch (providerStatus) {
    case 'completed':
    case 'success':
      return 'completed';
    case 'pending':
    case 'processing':
      return 'pending';
    case 'failed':
    case 'error':
      return 'failed';
    default:
      return 'pending';
  }
}
```

### Amount Formatting

```typescript
// Use utility functions for consistent formatting
import {
  formatAmountForProvider,
  parseAmountFromProvider,
} from "../../utils/amount";

const providerAmount = formatAmountForProvider(request.amount);
const standardAmount = parseAmountFromProvider(
  response.amount,
  response.currency
);
```

## Best Practices

1. **Follow existing patterns** from Orange Money implementation
2. **Use TypeScript strictly** - avoid `any` types
3. **Handle errors gracefully** - map to common error codes
4. **Test thoroughly** - unit tests with mocks, integration tests if possible
5. **Document differences** - note any unique features or limitations
6. **Keep it simple** - follow the established provider interface
7. **Validate input** - implement proper business rule validation

## Getting Help

- Review the Orange Money implementation as a reference
- Check existing tests for patterns
- Ask questions in GitHub discussions
- Follow the contributing guidelines

Thank you for expanding Deggo MCP's payment provider support! 🎉
