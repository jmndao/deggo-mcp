/**
 * Default configuration values
 */

import { PartialDeggoConfig } from "../types/config";

export const DEFAULT_PROVIDER_CONFIG = {
  environment: "sandbox" as const,
  timeout: 30000,
  retryAttempts: 3,
};

export const DEFAULT_STORAGE_CONFIG = {
  type: "memory" as const,
};

export const DEFAULT_ANALYTICS_CONFIG = {
  enabled: false,
  trackingLevel: "basic" as const,
  reportingFrequency: "weekly" as const,
};

export const defaultConfig: PartialDeggoConfig = {
  providers: {},
  storage: DEFAULT_STORAGE_CONFIG,
  analytics: DEFAULT_ANALYTICS_CONFIG,
};
