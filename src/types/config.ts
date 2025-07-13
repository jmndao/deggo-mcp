/**
 * Configuration type definitions
 */

export interface ProviderConfig {
  apiKey: string;
  environment: "production" | "sandbox";
  timeout: number;
  retryAttempts: number;
  webhookUrl?: string;
}

export interface PartialProviderConfig {
  apiKey?: string;
  environment?: "production" | "sandbox";
  timeout?: number;
  retryAttempts?: number;
  webhookUrl?: string;
}

export interface StorageConfig {
  type: "memory" | "file" | "database";
  location?: string;
  connection?: unknown;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingLevel: "basic" | "detailed";
  reportingFrequency: "daily" | "weekly" | "monthly";
}

export interface DeggoConfig {
  providers: {
    orange?: ProviderConfig;
    wave?: ProviderConfig;
    free_money?: ProviderConfig;
    poste_finance?: ProviderConfig;
  };
  storage?: StorageConfig;
  analytics?: AnalyticsConfig;
}

export interface PartialDeggoConfig {
  providers?: {
    orange?: PartialProviderConfig;
    wave?: PartialProviderConfig;
    free_money?: PartialProviderConfig;
    poste_finance?: PartialProviderConfig;
  };
  storage?: Partial<StorageConfig>;
  analytics?: Partial<AnalyticsConfig>;
}
