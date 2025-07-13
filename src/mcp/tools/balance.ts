/**
 * MCP balance tools
 */

import { z } from "zod";
import { Deggo } from "../../core/deggo";
import { PaymentProvider } from "../../types/common";

export const CHECK_BALANCE_TOOL = {
  name: "check-balance",
  description: "Check account balance for a payment provider",
  inputSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["orange", "wave", "free_money", "poste_finance"],
        description: "Payment provider to check",
      },
      account_id: {
        type: "string",
        description: "Specific account ID (optional)",
      },
    },
    required: ["provider"],
  },
};

export const TEST_CONNECTIONS_TOOL = {
  name: "test-connections",
  description: "Test connectivity to all configured payment providers",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

export async function handleCheckBalance(deggo: Deggo, args: any) {
  const schema = z.object({
    provider: z.enum(["orange", "wave", "free_money", "poste_finance"]),
    account_id: z.string().optional(),
  });

  const params = schema.parse(args);
  const result = await deggo.checkBalance(
    params.provider as PaymentProvider,
    params.account_id
  );

  return {
    content: [
      {
        type: "text",
        text: `Account Balance

Provider: ${result.provider}
Balance: ${result.balance.value} ${result.balance.currency}
Account ID: ${result.accountId}
Last Updated: ${result.lastUpdated.toISOString()}`,
      },
    ],
  };
}

export async function handleTestConnections(deggo: Deggo, args: any) {
  const result = await deggo.testConnections();
  const statusList = Object.entries(result)
    .map(
      ([provider, status]) =>
        `- ${provider}: ${status ? "✓ Connected" : "✗ Failed"}`
    )
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text: `Provider Connection Status

${statusList}`,
      },
    ],
  };
}
