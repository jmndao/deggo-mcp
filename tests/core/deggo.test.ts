/**
 * Core Deggo tests
 */

import { Deggo } from "../../src/core/deggo";

describe("Deggo Core", () => {
  it("throws error with no providers configured", () => {
    expect(() => new Deggo({})).toThrow(
      "Configuration errors: At least one payment provider must be configured with API key"
    );
  });

  it("throws error for unconfigured provider", async () => {
    // Mock environment variables to create a provider
    const originalEnv = process.env;
    process.env.ORANGE_API_KEY = "test-key";
    process.env.ORANGE_CLIENT_ID = "test-id";
    process.env.ORANGE_CLIENT_SECRET = "test-secret";

    try {
      const deggo = new Deggo();

      await expect(deggo.checkBalance("wave" as any)).rejects.toThrow(
        "Provider wave is not configured"
      );
    } finally {
      // Restore environment
      process.env = originalEnv;
    }
  });

  it("lists available providers", () => {
    // Mock environment for test
    const originalEnv = process.env;
    process.env.ORANGE_API_KEY = "test-key";
    process.env.ORANGE_CLIENT_ID = "test-id";
    process.env.ORANGE_CLIENT_SECRET = "test-secret";

    try {
      const deggo = new Deggo();
      const providers = deggo.getAvailableProviders();

      expect(providers).toContain("orange");
    } finally {
      // Restore environment
      process.env = originalEnv;
    }
  });
});
