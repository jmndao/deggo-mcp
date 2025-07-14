/**
 * Main configuration loader
 */

import {
  DeggoConfig,
  PartialDeggoConfig,
  ProviderConfig,
} from "../types/config.js";
import { validateConfig } from "./validation.js";

// Define defaults directly here
const DEFAULT_PROVIDER_CONFIG = {
  environment: "sandbox" as const,
  timeout: 30000,
  retryAttempts: 3,
};

const DEFAULT_STORAGE_CONFIG = {
  type: "memory" as const,
};

const DEFAULT_ANALYTICS_CONFIG = {
  enabled: false,
  trackingLevel: "basic" as const,
  reportingFrequency: "weekly" as const,
};

export function loadEnvConfig(): PartialDeggoConfig {
  const config: PartialDeggoConfig = { providers: {} };

  // Orange Money
  if (
    process.env.ORANGE_API_KEY &&
    process.env.ORANGE_CLIENT_ID &&
    process.env.ORANGE_CLIENT_SECRET
  ) {
    config.providers!.orange = {
      apiKey: process.env.ORANGE_API_KEY,
      environment:
        (process.env.ORANGE_ENVIRONMENT as "production" | "sandbox") ||
        "sandbox",
      timeout: parseInt(process.env.ORANGE_TIMEOUT || "30000"),
      retryAttempts: parseInt(process.env.ORANGE_RETRY_ATTEMPTS || "3"),
      webhookUrl: process.env.ORANGE_WEBHOOK_URL,
      pinCode: process.env.ORANGE_PIN_CODE,
    };
  }

  // Wave (future implementation)
  if (process.env.WAVE_API_KEY) {
    config.providers!.wave = {
      apiKey: process.env.WAVE_API_KEY,
      environment:
        (process.env.WAVE_ENVIRONMENT as "production" | "sandbox") || "sandbox",
      timeout: parseInt(process.env.WAVE_TIMEOUT || "30000"),
      retryAttempts: parseInt(process.env.WAVE_RETRY_ATTEMPTS || "3"),
      webhookUrl: process.env.WAVE_WEBHOOK_URL,
    };
  }

  // Storage configuration
  if (process.env.STORAGE_TYPE) {
    config.storage = {
      type: process.env.STORAGE_TYPE as "memory" | "file" | "database",
      location: process.env.STORAGE_LOCATION,
      connection: process.env.STORAGE_CONNECTION
        ? JSON.parse(process.env.STORAGE_CONNECTION)
        : undefined,
    };
  }

  // Analytics configuration
  if (process.env.ANALYTICS_ENABLED) {
    config.analytics = {
      enabled: process.env.ANALYTICS_ENABLED === "true",
      trackingLevel:
        (process.env.ANALYTICS_TRACKING_LEVEL as "basic" | "detailed") ||
        "basic",
      reportingFrequency:
        (process.env.ANALYTICS_REPORTING_FREQUENCY as
          | "daily"
          | "weekly"
          | "monthly") || "weekly",
    };
  }

  return config;
}

export function createConfig(userConfig?: PartialDeggoConfig): DeggoConfig {
  const envConfig = loadEnvConfig();

  const merged: DeggoConfig = {
    providers: {},
    storage: {
      ...DEFAULT_STORAGE_CONFIG,
      ...envConfig.storage,
      ...userConfig?.storage,
    },
    analytics: {
      ...DEFAULT_ANALYTICS_CONFIG,
      ...envConfig.analytics,
      ...userConfig?.analytics,
    },
  };

  // Merge provider configs
  const allProviders = [
    "orange",
    "wave",
    "free_money",
    "poste_finance",
  ] as const;

  for (const provider of allProviders) {
    const envProvider = envConfig.providers?.[provider];
    const userProvider = userConfig?.providers?.[provider];

    if (envProvider?.apiKey || userProvider?.apiKey) {
      merged.providers[provider] = {
        ...DEFAULT_PROVIDER_CONFIG,
        ...envProvider,
        ...userProvider,
      } as ProviderConfig;
    }
  }

  const errors = validateConfig(merged);
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(", ")}`);
  }

  return merged;
}

export { validateConfig };
