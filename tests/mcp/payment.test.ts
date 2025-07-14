/**
 * MCP Payment tools tests
 */

import { handleSendPayment } from "../../src/mcp/tools/payment.js";
import { Deggo } from "../../src/core/deggo.js";

jest.mock("../../src/core/deggo.js");

describe("MCP Payment Tools", () => {
  let mockDeggo: jest.Mocked<Deggo>;

  beforeEach(() => {
    mockDeggo = {
      sendMoney: jest.fn(),
    } as any;
  });

  it("handles send payment", async () => {
    mockDeggo.sendMoney.mockResolvedValue({
      transactionId: "TXN_123",
      status: "completed",
      amount: { value: 1000, currency: "XOF" },
      recipient: { phoneNumber: "221771234567" },
      fees: { value: 50, currency: "XOF" },
      provider: "orange",
      timestamp: new Date("2024-01-01")
    });

    const result = await handleSendPayment(mockDeggo, {
      provider: "orange",
      amount: 1000,
      currency: "XOF",
      recipient_phone: "221771234567"
    });
    
    expect(result.content[0].text).toContain("Transaction ID: TXN_123");
    expect(result.content[0].text).toContain("Status: completed");
    expect(mockDeggo.sendMoney).toHaveBeenCalled();
  });
});