/**
 * MCP Balance tools tests
 */

import {
  handleCheckBalance,
  handleTestConnections,
} from "../../src/mcp/tools/balance.js";
import { Deggo } from "../../src/core/deggo.js";

jest.mock("../../src/core/deggo.js");

describe("MCP Balance Tools", () => {
  let mockDeggo: jest.Mocked<Deggo>;

  beforeEach(() => {
    mockDeggo = {
      checkBalance: jest.fn(),
      testConnections: jest.fn(),
    } as any;
  });

  it("handles check balance", async () => {
    mockDeggo.checkBalance.mockResolvedValue({
      balance: { value: 1000, currency: "XOF" },
      provider: "orange",
      accountId: "123",
      lastUpdated: new Date("2024-01-01"),
    });

    const result = await handleCheckBalance(mockDeggo, { provider: "orange" });

    expect(result.content[0].text).toContain("Provider: orange");
    expect(result.content[0].text).toContain("Balance: 1000 XOF");
  });

  it("handles test connections", async () => {
    mockDeggo.testConnections.mockResolvedValue({
      orange: true,
      wave: false,
      free_money: false,
      poste_finance: false,
    });

    const result = await handleTestConnections(mockDeggo, {});

    expect(result.content[0].text).toContain("orange: ✓ Connected");
    expect(result.content[0].text).toContain("wave: ✗ Failed");
  });
});
