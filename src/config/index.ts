/**
 * Main configuration loader
 */

import {
  DeggoConfig,
  PartialDeggoConfig,
  ProviderConfig,
} from "../types/config";
import {
  DEFAULT_PROVIDER_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_ANALYTICS_CONFIG,
} from "../core/defaults";
import { validateConfig } from "./validation";

export function loadEnvConfig(): PartialDeggoConfig {
  const config: PartialDeggoConfig = { providers: {} };

  // Orange Money
  if (process.env.ORANGE_API_KEY) {
    config.providers!.orange = {
      apiKey: process.env.ORANGE_API_KEY,
      environment:
        (process.env.ORANGE_ENVIRONMENT as "production" | "sandbox") ||
        "sandbox",
      timeout: parseInt(process.env.ORANGE_TIMEOUT || "30000"),
      retryAttempts: parseInt(process.env.ORANGE_RETRY_ATTEMPTS || "3"),
      webhookUrl: process.env.ORANGE_WEBHOOK_URL,
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
