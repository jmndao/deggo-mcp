/**
 * MCP payment tools
 */

import { z } from "zod";
import { Deggo } from "../../core/deggo.js";
import { PaymentProvider, Currency } from "../../types/common.js";

export const SEND_PAYMENT_TOOL = {
  name: "send-payment",
  description: "Send money to a recipient using specified payment provider",
  inputSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["orange", "wave", "free_money", "poste_finance"],
        description: "Payment provider to use",
      },
      amount: {
        type: "number",
        description: "Amount to send in major currency units",
      },
      currency: {
        type: "string",
        enum: ["XOF", "XAF", "USD", "EUR"],
        default: "XOF",
        description: "Currency code",
      },
      recipient_phone: {
        type: "string",
        description: "Recipient phone number (Senegalese format)",
      },
      recipient_name: {
        type: "string",
        description: "Recipient name (optional)",
      },
      description: {
        type: "string",
        description: "Payment description (optional)",
      },
      reference: {
        type: "string",
        description: "Custom reference for tracking (optional)",
      },
    },
    required: ["provider", "amount", "recipient_phone"],
  },
};

export async function handleSendPayment(deggo: Deggo, args: any) {
  const schema = z.object({
    provider: z.enum(["orange", "wave", "free_money", "poste_finance"]),
    amount: z.number().positive(),
    currency: z.enum(["XOF", "XAF", "USD", "EUR"]).default("XOF"),
    recipient_phone: z.string(),
    recipient_name: z.string().optional(),
    description: z.string().optional(),
    reference: z.string().optional(),
  });

  const params = schema.parse(args);

  const result = await deggo.sendMoney({
    provider: params.provider as PaymentProvider,
    amount: {
      value: params.amount,
      currency: params.currency as Currency,
    },
    recipient: {
      phoneNumber: params.recipient_phone,
      name: params.recipient_name,
    },
    description: params.description,
    reference: params.reference,
  });

  return {
    content: [
      {
        type: "text",
        text: `Payment sent successfully!

Transaction ID: ${result.transactionId}
Status: ${result.status}
Amount: ${result.amount.value} ${result.amount.currency}
Fees: ${result.fees.value} ${result.fees.currency}
Provider: ${result.provider}
Timestamp: ${result.timestamp.toISOString()}`,
      },
    ],
  };
}
