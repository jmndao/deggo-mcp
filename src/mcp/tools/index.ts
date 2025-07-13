/**
 * MCP tools exports and handlers
 */

import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { Deggo } from "../../core/deggo";
import { SEND_PAYMENT_TOOL, handleSendPayment } from "./payment";
import {
  CHECK_BALANCE_TOOL,
  TEST_CONNECTIONS_TOOL,
  handleCheckBalance,
  handleTestConnections,
} from "./balance";

export const MCP_TOOLS = [
  SEND_PAYMENT_TOOL,
  CHECK_BALANCE_TOOL,
  TEST_CONNECTIONS_TOOL,
];

export async function handleToolCall(deggo: Deggo, request: any) {
  const parsed = CallToolRequestSchema.parse(request);
  const { name, arguments: args } = parsed.params;

  try {
    switch (name) {
      case "send-payment":
        return await handleSendPayment(deggo, args);

      case "check-balance":
        return await handleCheckBalance(deggo, args);

      case "test-connections":
        return await handleTestConnections(deggo, args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
