# Deggo MCP

AI-Powered Payment Integration for Senegalese Mobile Money Services

## Description

Deggo MCP is a Model Context Protocol server that enables AI applications to interact with Senegalese mobile money services through natural language. It provides secure integration with Orange Money, supporting real-time payments, balance queries, and transaction management with enterprise-grade security including RSA PIN encryption and OAuth 2.0 authentication.

## Installation

```bash
git clone https://github.com/jmndao/deggo-mcp.git
cd deggo-mcp
npm install
npm run build
```

## Configuration

```bash
cp .env.example .env
```

Configure your Orange Money credentials:

```bash
ORANGE_API_KEY=221771234567
ORANGE_CLIENT_ID=your_client_id
ORANGE_CLIENT_SECRET=your_client_secret
ORANGE_PIN_CODE=your_4_digit_pin
ORANGE_ENVIRONMENT=sandbox
```

## Usage

### Basic Integration

```javascript
import { Deggo } from "./dist/index.js";

const deggo = new Deggo();

// Send payment
await deggo.sendMoney({
  provider: "orange",
  amount: { value: 25000, currency: "XOF" },
  recipient: { phoneNumber: "771234567" },
  description: "Payment"
});

// Check balance
const balance = await deggo.checkBalance("orange");
```

### MCP Server

```bash
npx deggo-mcp
```

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "deggo": {
      "command": "node",
      "args": ["/absolute/path/to/deggo-mcp/dist/server.js"],
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

## API Reference

### Core Methods

- `sendMoney(request)` - Execute mobile money transfers
- `checkBalance(provider)` - Query account balance
- `getTransactionHistory(filter)` - Retrieve transaction records
- `testConnections()` - Verify provider connectivity

### MCP Tools

- `send-payment` - Process payment transactions
- `check-balance` - Get account information
- `test-connections` - Validate system status

## Supported Providers

- **Orange Money** - Full integration with Orange Sonatel API
- **Wave** - Planned implementation

## Phone Number Support

Automatically handles Senegalese number formats:
- Local: `77 123 45 67`
- International: `+221 77 123 45 67`
- Full: `221771234567`

Valid prefixes: 70, 75, 76, 77, 78

## Development

```bash
npm install
npm run build
npm test
npm run dev
```

## Orange Money API Access

1. Register at https://developer.orange-sonatel.com
2. Complete KYC verification
3. Obtain API credentials
4. Configure sandbox environment

## Error Handling

```javascript
try {
  await deggo.sendMoney(request);
} catch (error) {
  console.error(`Transaction failed: ${error.message}`);
}
```

Common error codes:
- `INSUFFICIENT_FUNDS`
- `INVALID_RECIPIENT`
- `TRANSACTION_LIMIT_EXCEEDED`

## License

MIT

## Contributing

See `docs/new-provider-guide.md` for provider implementation guidelines.