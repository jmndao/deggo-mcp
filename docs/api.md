# Deggo MCP API Reference

## Core Classes

### Deggo

Main class for payment operations.

```typescript
import { Deggo } from 'deggo-mcp';

const deggo = new Deggo(config?);
```

#### Methods

**sendMoney(request: PaymentRequest)**

```typescript
await deggo.sendMoney({
  provider: "orange",
  amount: { value: 10000, currency: "XOF" },
  recipient: { phoneNumber: "771234567" },
  description: "Payment",
});
```

**checkBalance(provider: PaymentProvider)**

```typescript
const balance = await deggo.checkBalance("orange");
// Returns: { balance: { value: 50000, currency: 'XOF' }, provider: 'orange', ... }
```

**getTransactionHistory(filter: TransactionFilter)**

```typescript
const history = await deggo.getTransactionHistory({
  provider: "orange",
  startDate: new Date("2024-01-01"),
  limit: 10,
});
```

**testConnections()**

```typescript
const status = await deggo.testConnections();
// Returns: { orange: true, wave: false }
```

## Types

### PaymentRequest

```typescript
interface PaymentRequest {
  provider: PaymentProvider;
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  description?: string;
  reference?: string;
}
```

### PaymentResponse

```typescript
interface PaymentResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  fees: PaymentAmount;
  provider: PaymentProvider;
  timestamp: Date;
  reference?: string;
}
```

### Configuration

```typescript
interface DeggoConfig {
  providers: {
    orange?: ProviderConfig;
    wave?: ProviderConfig;
  };
  storage?: StorageConfig;
  analytics?: AnalyticsConfig;
}
```

## Error Handling

```typescript
import { DeggoError, ERROR_CODES } from "deggo-mcp";

try {
  await deggo.sendMoney(request);
} catch (error) {
  if (error instanceof DeggoError) {
    console.log(error.code); // ERROR_CODES.INSUFFICIENT_FUNDS
    console.log(error.provider); // 'orange'
  }
}
```

### Error Codes

- `INVALID_CREDENTIALS` - Authentication failed
- `INSUFFICIENT_FUNDS` - Account balance too low
- `INVALID_RECIPIENT` - Phone number invalid
- `TRANSACTION_LIMIT_EXCEEDED` - Amount exceeds limits
- `NETWORK_ERROR` - Connection issues

## MCP Integration

### Tools

- `send-payment` - Execute money transfers
- `check-balance` - Query account balances
- `test-connections` - Verify provider connectivity

### Resources

- `deggo://payment-methods` - Available providers
- `deggo://provider-status` - Real-time status

## Phone Number Format

Supported formats:

- `77 123 45 67` (local)
- `+221 77 123 45 67` (international)
- `221771234567` (full)

Valid prefixes: 70, 75, 76, 77, 78
