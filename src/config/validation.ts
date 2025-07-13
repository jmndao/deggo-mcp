/**
 * Configuration validation
 */

import { DeggoConfig } from "../types/config";

export function validateConfig(config: DeggoConfig): string[] {
  const errors: string[] = [];

  // Check if at least one provider is configured
  const configuredProviders = Object.entries(config.providers).filter(
    ([_, providerConfig]) => providerConfig && providerConfig.apiKey
  );

  if (configuredProviders.length === 0) {
    errors.push(
      "At least one payment provider must be configured with API key"
    );
  }

  // Validate individual provider configurations
  Object.entries(config.providers).forEach(([providerName, providerConfig]) => {
    if (providerConfig) {
      if (!providerConfig.apiKey) {
        errors.push(`${providerName} provider requires apiKey`);
      }

      if (!["production", "sandbox"].includes(providerConfig.environment)) {
        errors.push(
          `${providerName} environment must be 'production' or 'sandbox'`
        );
      }

      if (providerConfig.timeout < 1000 || providerConfig.timeout > 120000) {
        errors.push(
          `${providerName} timeout must be between 1000 and 120000 milliseconds`
        );
      }

      if (
        providerConfig.retryAttempts < 0 ||
        providerConfig.retryAttempts > 10
      ) {
        errors.push(`${providerName} retryAttempts must be between 0 and 10`);
      }
    }
  });

  return errors;
}
