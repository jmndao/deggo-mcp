/**
 * MCP Tools tests
 */

import { Deggo } from "../../src/core/deggo.js";
import { handleToolCall, MCP_TOOLS } from "../../src/mcp/tools/index.js";

jest.mock("../../src/core/deggo.js");
jest.mock("@modelcontextprotocol/sdk/types.js", () => ({
  CallToolRequestSchema: {
    parse: jest.fn((req) => req)
  }
}));

describe("MCP Tools", () => {
  let mockDeggo: jest.Mocked<Deggo>;

  beforeEach(() => {
    mockDeggo = {
      checkBalance: jest.fn(),
      testConnections: jest.fn(),
      sendMoney: jest.fn(),
    } as any;
  });

  it("exports tool definitions", () => {
    expect(MCP_TOOLS).toHaveLength(3);
    expect(MCP_TOOLS[0].name).toBe("send-payment");
    expect(MCP_TOOLS[1].name).toBe("check-balance");
    expect(MCP_TOOLS[2].name).toBe("test-connections");
  });

  it("handles check-balance tool", async () => {
    mockDeggo.checkBalance.mockResolvedValue({
      balance: { value: 1000, currency: "XOF" },
      provider: "orange",
      accountId: "123",
      lastUpdated: new Date()
    });

    const result = await handleToolCall(mockDeggo, {
      params: { name: "check-balance", arguments: { provider: "orange" } }
    });

    expect(result.content[0].text).toContain("orange");
    expect(mockDeggo.checkBalance).toHaveBeenCalled();
  });

  it("handles test-connections tool", async () => {
    mockDeggo.testConnections.mockResolvedValue({ 
      orange: true, 
      wave: false, 
      free_money: false, 
      poste_finance: false 
    });

    const result = await handleToolCall(mockDeggo, {
      params: { name: "test-connections", arguments: {} }
    });

    expect(result.content[0].text).toContain("orange");
    expect(mockDeggo.testConnections).toHaveBeenCalled();
  });

  it("handles send-payment tool", async () => {
    mockDeggo.sendMoney.mockResolvedValue({
      transactionId: "123",
      status: "completed",
      amount: { value: 1000, currency: "XOF" },
      recipient: { phoneNumber: "221771234567" },
      fees: { value: 50, currency: "XOF" },
      provider: "orange",
      timestamp: new Date()
    });

    const result = await handleToolCall(mockDeggo, {
      params: { 
        name: "send-payment", 
        arguments: {
          provider: "orange",
          amount: 1000,
          currency: "XOF",
          recipient_phone: "221771234567"
        }
      }
    });

    expect(result.content[0].text).toContain("123");
    expect(mockDeggo.sendMoney).toHaveBeenCalled();
  });

  it("handles errors", async () => {
    mockDeggo.checkBalance.mockRejectedValue(new Error("Failed"));

    const result = await handleToolCall(mockDeggo, {
      params: { name: "check-balance", arguments: { provider: "orange" } }
    });

    expect(result.content[0].text).toContain("Error: Failed");
  });
});