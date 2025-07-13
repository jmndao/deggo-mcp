# Deggo MCP

AI-Powered Payment Integration for Senegalese Mobile Money Services

## How It Works

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Assistant  │    │    Deggo MCP     │    │ Payment Providers│
│   (Claude, etc) │    │     Server       │    │  (Orange, Wave) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ MCP Protocol          │ HTTP/REST APIs        │
         │ (stdio/websocket)     │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ "Send 25,000    │───▶│ Tool: send-      │───▶│ Orange Money    │
│  XOF to my      │    │ payment          │    │ API Call        │
│  sister"        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       │                       │
         │                       │ Response              │
         │                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ "Payment sent   │◀───│ Formatted        │◀───│ Transaction     │
│  successfully!" │    │ Response         │    │ Confirmed       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Flow**:

1. AI receives natural language: "Send money to my sister"
2. MCP Protocol translates to structured tool call
3. Deggo executes payment via provider APIs
4. Provider processes transaction
5. Deggo formats response for AI
6. AI gives user natural language feedback

## Quick Start

```bash
npm install deggo-mcp
```

### Environment Setup

```bash
cp .env.example .env
```

Add your Orange Money credentials:

```bash
ORANGE_API_KEY=221771234567  # Your Orange Money phone number
ORANGE_CLIENT_ID=your_client_id
ORANGE_CLIENT_SECRET=your_client_secret
ORANGE_PIN_CODE=your_4_digit_pin
ORANGE_ENVIRONMENT=sandbox
```

### Basic Usage

```javascript
import { Deggo } from "deggo-mcp";

const deggo = new Deggo();

// Send money
await deggo.sendMoney({
  provider: "orange",
  amount: { value: 25000, currency: "XOF" },
  recipient: { phoneNumber: "771234567", name: "Recipient" },
  description: "Payment",
});

// Check balance
const balance = await deggo.checkBalance("orange");
```

## AI Integration Setup

### Claude Desktop

1. **Install Deggo globally**:

```bash
npm install -g deggo-mcp
```

2. **Configure Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "deggo": {
      "command": "deggo-mcp",
      "env": {
        "ORANGE_API_KEY": "221771234567",
        "ORANGE_CLIENT_ID": "your_client_id",
        "ORANGE_CLIENT_SECRET": "your_client_secret",
        "ORANGE_PIN_CODE": "your_pin",
        "ORANGE_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

3. **Restart Claude Desktop** and start using natural language:
   - "Send 10,000 XOF to 771234567"
   - "Check my Orange Money balance"
   - "Show my recent transactions"

### Custom AI Application

```javascript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Start Deggo MCP server
const deggo = new DeggoMCP();
await deggo.start();

// Your AI can now use MCP tools:
// - send-payment
// - check-balance
// - test-connections
```

### Cline/Cursor Integration

For AI coding assistants like Cline:

1. **Add to workspace settings**:

```json
{
  "mcp.servers": {
    "deggo": {
      "command": "npx",
      "args": ["deggo-mcp"],
      "env": {
        "ORANGE_API_KEY": "your_api_key"
      }
    }
  }
}
```

2. **Use in prompts**:
   - "Help me build a payment dashboard using Deggo"
   - "Create a script to send bulk payments"
   - "Check if my Orange Money integration is working"

## MCP Server

Start the server directly:

```bash
npx deggo-mcp
```

Or run in development:

```bash
npm run dev
```

## Features

- **Complete Orange Money Integration**: RSA PIN encryption, transfers, balance checks, transaction history
- **MCP Protocol**: Native AI application support
- **TypeScript**: Type-safe development with comprehensive error handling
- **Phone Validation**: Senegalese number formats (70, 75, 76, 77, 78)
- **Security**: Production-ready RSA encryption for PIN codes
- **Fee Calculation**: Real Orange Money fee structure
- **Error Handling**: Comprehensive Orange Sonatel API error mapping

## API

### Core Methods

- `sendMoney(request)` - Execute payments
- `checkBalance(provider)` - Get account balance
- `getTransactionHistory(filter)` - Retrieve transactions
- `testConnections()` - Verify provider status

### MCP Tools

- `send-payment` - Execute transfers
- `check-balance` - Query balances
- `test-connections` - Check provider status

## Development

```bash
npm install
npm run build
npm test
```

## Orange Money API Access

1. **Visit Orange Sonatel Developer Portal**: https://developer.orange-sonatel.com
2. **Create developer account** and complete verification
3. **Submit application** with detailed use case description
4. **Complete KYC requirements** and business verification
5. **Receive credentials**:
   - API Key (your Orange Money phone number)
   - Client ID & Secret for OAuth authentication
   - Access to sandbox environment

**Required Information:**

- Orange Money account with sufficient balance
- Valid Senegalese phone number (77xxxxxxx format)
- 4-digit PIN code for transaction authorization
- Business documentation for production access

**Sandbox Testing:**

- Use sandbox environment for development
- Rate limit: 60 requests per minute
- Test with small amounts (100-1000 XOF)
- PIN encryption required for all transactions

## Supported Phone Numbers

Deggo automatically handles Senegalese formats:

- `77 123 45 67` (local)
- `+221 77 123 45 67` (international)
- `221771234567` (full)

Valid prefixes: 70, 75, 76, 77, 78

## Error Handling

```javascript
try {
  await deggo.sendMoney(request);
} catch (error) {
  if (error.code === "INSUFFICIENT_FUNDS") {
    // Handle low balance
  }
}
```

Common error codes:

- `INSUFFICIENT_FUNDS` - Account balance too low
- `INVALID_RECIPIENT` - Phone number invalid
- `TRANSACTION_LIMIT_EXCEEDED` - Amount exceeds limits

## License

MIT

## Contributing

We welcome contributions! See `docs/WAVE_IMPLEMENTATION_GUIDE.md` to add Wave support.
