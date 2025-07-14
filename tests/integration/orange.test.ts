/**
 * Orange Money Integration Tests
 */

import { Deggo } from "../../src/core/deggo.js";
import { PaymentProvider } from "../../src/types/common.js";

describe("Orange Integration Tests", () => {
  let deggo: Deggo;

  beforeAll(() => {
    // Skip tests if credentials not available
    if (
      !process.env.ORANGE_API_KEY ||
      !process.env.ORANGE_CLIENT_ID ||
      !process.env.ORANGE_CLIENT_SECRET
    ) {
      console.log("Skipping Orange integration tests - missing credentials");
      return;
    }

    deggo = new Deggo({
      providers: {
        orange: {
          apiKey: process.env.ORANGE_API_KEY,
          pinCode: process.env.ORANGE_PIN_CODE || "1234",
          environment: "sandbox",
          timeout: 30000,
          retryAttempts: 3,
        },
      },
    });
  });

  it("should connect to Orange API", async () => {
    if (!deggo) {
      console.log("Skipping test - no credentials");
      return;
    }

    const result = await deggo.testConnections();
    expect(result.orange).toBe(true);
  });

  it("should check balance", async () => {
    if (!deggo) {
      console.log("Skipping test - no credentials");
      return;
    }

    const balance = await deggo.checkBalance("orange");

    expect(balance).toHaveProperty("balance");
    expect(balance).toHaveProperty("provider", "orange");
    expect(balance.balance).toHaveProperty("value");
    expect(balance.balance).toHaveProperty("currency", "XOF");
  });

  it("should get transaction history", async () => {
    if (!deggo) {
      console.log("Skipping test - no credentials");
      return;
    }

    const history = await deggo.getTransactionHistory({
      provider: "orange",
      page: 1,
      limit: 10,
    });

    expect(history).toHaveProperty("transactions");
    expect(history).toHaveProperty("total");
    expect(Array.isArray(history.transactions)).toBe(true);
  });

  it("should send money", async () => {
    if (!deggo) {
      console.log("Skipping test - no credentials");
      return;
    }

    const result = await deggo.sendMoney({
      provider: "orange" as PaymentProvider,
      amount: { value: 1000, currency: "XOF" },
      recipient: {
        phoneNumber: "221771234567",
        name: "Test User",
      },
      reference: `TEST_${Date.now()}`,
    });

    expect(result).toHaveProperty("transactionId");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("amount");
  });
});
