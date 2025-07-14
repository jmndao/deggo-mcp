/**
 * Config tests
 */

import { createConfig, loadEnvConfig } from "../../src/config/index.js";

describe("Config", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("creates config with defaults", () => {
    const config = createConfig({
      providers: {
        orange: { apiKey: "test-key" },
      },
    });

    expect(config.providers.orange?.apiKey).toBe("test-key");
    expect(config.providers.orange?.environment).toBe("sandbox");
    expect(config.storage?.type).toBe("memory");
    expect(config.analytics?.enabled).toBe(false);
  });

  it("loads config from environment", () => {
    process.env = {
      ...originalEnv,
      ORANGE_API_KEY: "env-key",
      ORANGE_CLIENT_ID: "env-id",
      ORANGE_CLIENT_SECRET: "env-secret",
    };

    const config = loadEnvConfig();
    expect(config.providers?.orange?.apiKey).toBe("env-key");
  });

  it("validates required providers", () => {
    expect(() => createConfig({})).toThrow("At least one payment provider");
  });

  it("merges user and env config", () => {
    process.env = {
      ...originalEnv,
      ORANGE_API_KEY: "env-key",
      ORANGE_CLIENT_ID: "env-id",
      ORANGE_CLIENT_SECRET: "env-secret",
    };

    const config = createConfig({
      providers: {
        orange: { timeout: 5000 },
      },
    });

    expect(config.providers.orange?.apiKey).toBe("env-key");
    expect(config.providers.orange?.timeout).toBe(5000);
  });
});
