/**
 * Provider factory - creates configured providers
 */

import { DeggoConfig } from "../types/config.js";
import { PaymentProvider } from "../types/common.js";
import { IPaymentProvider } from "./base.js";
import { OrangeClient } from "./orange/client.js";

export function createProviders(
  config: DeggoConfig
): Map<PaymentProvider, IPaymentProvider> {
  const providers = new Map<PaymentProvider, IPaymentProvider>();

  // Create Orange Money provider if configured
  if (config.providers.orange) {
    const orangeConfig = {
      ...config.providers.orange,
      clientId: process.env.ORANGE_CLIENT_ID || "",
      clientSecret: process.env.ORANGE_CLIENT_SECRET || "",
    };

    if (
      orangeConfig.clientId &&
      orangeConfig.clientSecret &&
      orangeConfig.apiKey
    ) {
      providers.set("orange", new OrangeClient(orangeConfig));
    }
  }

  // Future providers will be added here
  // if (config.providers.wave) {
  //   providers.set('wave', new WaveClient(config.providers.wave));
  // }

  return providers;
}
