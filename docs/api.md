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
  recipient: { phoneNumber: "771234567", name: "Recipient Name" },
  description: "Payment description",
  reference: "CUSTOM_REF_123", // Optional
});
```

**checkBalance(provider: PaymentProvider)**

```typescript
const balance = await deggo.checkBalance("orange");
// Returns: {
//   balance: { value: 50000, currency: 'XOF' },
//   provider: 'orange',
//   accountId: 'ACC_123',
//   lastUpdated: Date
// }
```

**getTransactionHistory(filter: TransactionFilter)**

```typescript
const history = await deggo.getTransactionHistory({
  provider: "orange",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-01-31"),
  page: 1,
  limit: 20,
});
// Returns paginated transaction history with filtering
```

**testConnections()**

```typescript
const status = await deggo.testConnections();
// Returns: { orange: true, wave: false }
```

## Orange Money Configuration

### Environment Variables

```bash
# Required for Orange Money
ORANGE_API_KEY=221771234567          # Your Orange Money phone number
ORANGE_CLIENT_ID=your_client_id      # From Orange Developer Portal
ORANGE_CLIENT_SECRET=your_secret     # OAuth client secret
ORANGE_PIN_CODE=1234                 # Your 4-digit PIN (encrypted automatically)
ORANGE_ENVIRONMENT=sandbox           # or 'production'
```

### Programmatic Configuration

```typescript
const deggo = new Deggo({
  providers: {
    orange: {
      apiKey: "221771234567",
      clientId: "your_client_id",
      clientSecret: "your_client_secret",
      pinCode: "1234",
      environment: "sandbox",
      timeout: 30000,
      retryAttempts: 3,
    },
  },
});
```

## Types

### PaymentRequest

```typescript
interface PaymentRequest {
  provider: "orange" | "wave" | "free_money" | "poste_finance";
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  description?: string;
  reference?: string;
}

interface PaymentAmount {
  value: number; // Amount in major units (e.g., 10000 for 10,000 XOF)
  currency: "XOF" | "XAF" | "USD" | "EUR";
}

interface PaymentRecipient {
  phoneNumber: string; // Senegalese format: 771234567 or +221771234567
  name?: string;
  accountId?: string;
}
```

### PaymentResponse

```typescript
interface PaymentResponse {
  transactionId: string; // Unique transaction identifier
  status: TransactionStatus; // 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: PaymentAmount;
  recipient: PaymentRecipient;
  fees: PaymentAmount; // Transaction fees charged
  provider: PaymentProvider;
  timestamp: Date;
  reference?: string; // Your custom reference
  providerReference?: string; // Provider's internal reference
}
```

### TransactionFilter

```typescript
interface TransactionFilter {
  provider?: PaymentProvider; // Filter by provider
  status?: TransactionStatus; // Filter by status
  startDate?: Date; // From date (YYYY-MM-DD)
  endDate?: Date; // To date (YYYY-MM-DD)
  minAmount?: number; // Minimum amount filter
  maxAmount?: number; // Maximum amount filter
  page?: number; // Page number (default: 1)
  limit?: number; // Results per page (default: 50)
}
```

## Error Handling

### DeggoError Class

```typescript
import { DeggoError, ERROR_CODES } from "deggo-mcp";

try {
  await deggo.sendMoney(request);
} catch (error) {
  if (error instanceof DeggoError) {
    console.log("Error Code:", error.code);
    console.log("Provider:", error.provider);
    console.log("Details:", error.details);
  }
}
```

### Error Codes

```typescript
// Authentication Errors
ERROR_CODES.INVALID_CREDENTIALS; // Wrong PIN or API credentials
ERROR_CODES.API_KEY_INVALID; // Invalid or expired API key

// Transaction Errors
ERROR_CODES.INSUFFICIENT_FUNDS; // Account balance too low
ERROR_CODES.INVALID_RECIPIENT; // Invalid phone number format
ERROR_CODES.INVALID_AMOUNT; // Amount validation failed
ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED; // Amount exceeds limits
ERROR_CODES.ACCOUNT_SUSPENDED; // Account blocked by provider

// System Errors
ERROR_CODES.NETWORK_ERROR; // Connection or API issues
ERROR_CODES.MAINTENANCE_MODE; // Provider under maintenance
ERROR_CODES.TRANSACTION_NOT_FOUND; // Transaction ID not found
```

### Orange Money Specific Errors

Orange Sonatel API errors are automatically mapped to common error codes:

- Code `2020`, `2021`, `2022` → `INSUFFICIENT_FUNDS`
- Code `2001` → `INVALID_RECIPIENT`
- Code `2041`, `2042`, `2043` → `TRANSACTION_LIMIT_EXCEEDED`
- Code `2013` → `ACCOUNT_SUSPENDED`

## MCP Integration

### Tools Available to AI

- `send-payment` - Execute money transfers
- `check-balance` - Query account balances
- `get-transaction-history` - Retrieve transaction records
- `compare-fees` - Compare costs across providers
- `test-connections` - Verify provider connectivity

### Natural Language Examples

```
✅ "Send 25,000 XOF to 771234567"
✅ "Check my Orange Money balance"
✅ "Show transactions from last week"
✅ "What are the fees for sending 50,000 XOF?"
✅ "Test my Orange Money connection"
```

## Phone Number Validation

### Supported Formats

Deggo automatically handles Senegalese phone number formats:

```typescript
// All these formats work:
"77 123 45 67"; // Local format with spaces
"771234567"; // Local format without spaces
"+221 77 123 45 67"; // International with spaces
"+221771234567"; // International without spaces
"221771234567"; // Full format
```

### Valid Prefixes

- `70` - Orange network
- `75` - Orange network
- `76` - Orange network
- `77` - Orange network (most common)
- `78` - Orange network

## Fee Structure (Orange Money)

Current Orange Money fee structure:

```typescript
// Amount ranges and corresponding fees (in XOF)
const fees = {
  "100 - 2,500": 0, // Free transfers
  "2,501 - 5,000": 100,
  "5,001 - 15,000": 200,
  "15,001 - 25,000": 400,
  "25,001 - 50,000": 800,
  "50,001 - 125,000": 1500,
  "125,001 - 300,000": 2500,
};
```

## Security Features

### RSA PIN Encryption

- Automatic PIN encryption using RSA public key
- PKCS#1 v1.5 padding for compatibility
- Public key fetched from Orange Sonatel API
- No plain text PIN transmission

### Best Practices

```typescript
// ✅ Good - Use environment variables
process.env.ORANGE_PIN_CODE = "1234";

// ❌ Bad - Hardcode in source
const config = { pinCode: "1234" };

// ✅ Good - Validate before sending
const validation = await client.validatePaymentRequest(request);
if (!validation.isValid) {
  throw new Error(validation.errors.join(", "));
}
```

## Rate Limiting

Orange Sonatel API limits:

- **Sandbox**: 60 requests per minute
- **Production**: Varies by agreement
- Automatic retry with exponential backoff
- Rate limit errors handled gracefully

## Testing

### Unit Testing

```bash
npm test                    # Run all unit tests
npm run test:coverage      # Generate coverage report
```

### Integration Testing

```bash
# Requires real Orange Money sandbox credentials
ORANGE_API_KEY=221771234567 \
ORANGE_CLIENT_ID=test_id \
ORANGE_CLIENT_SECRET=test_secret \
ORANGE_PIN_CODE=1234 \
npm run test:integration
```

### Manual Testing

```typescript
// Test connection
const deggo = new Deggo();
console.log(await deggo.testConnections());

// Test balance
console.log(await deggo.checkBalance("orange"));

// Test small transfer (sandbox)
await deggo.sendMoney({
  provider: "orange",
  amount: { value: 100, currency: "XOF" },
  recipient: { phoneNumber: "771234567" },
});
```
