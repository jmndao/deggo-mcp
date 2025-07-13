/**
 * Orange Money integration tests
 * These run against sandbox environment when credentials are provided
 */

import { Deggo } from "../../src";

describe("Orange Integration Tests", () => {
  let deggo: Deggo;

  beforeAll(() => {
    // Skip if no sandbox credentials
    if (!process.env.ORANGE_API_KEY || !process.env.ORANGE_CLIENT_ID) {
      console.log("Skipping Orange integration tests - no sandbox credentials");
      return;
    }

    deggo = new Deggo({
      providers: {
        orange: {
          apiKey: process.env.ORANGE_API_KEY!,
          environment: "sandbox",
          timeout: 30000,
          retryAttempts: 3,
        },
      },
    });
  });

  it("should connect to Orange Money sandbox", async () => {
    if (!deggo) return;

    const connections = await deggo.testConnections();
    expect(connections.orange).toBe(true);
  }, 10000);

  it("should check account balance", async () => {
    if (!deggo) return;

    const balance = await deggo.checkBalance("orange");
    expect(balance.provider).toBe("orange");
    expect(balance.balance.currency).toBe("XOF");
    expect(typeof balance.balance.value).toBe("number");
  }, 10000);

  it("should validate payment amounts", async () => {
    if (!deggo) return;

    await expect(
      deggo.sendMoney({
        provider: "orange",
        amount: { value: 0, currency: "XOF" },
        recipient: { phoneNumber: "771234567" },
      })
    ).rejects.toThrow();

    await expect(
      deggo.sendMoney({
        provider: "orange",
        amount: { value: 400000, currency: "XOF" },
        recipient: { phoneNumber: "771234567" },
      })
    ).rejects.toThrow();
  }, 10000);

  // Note: Actual money transfer tests should be done carefully in sandbox
  // and with very small amounts to avoid charges
});
