/**
 * Amount formatting utilities
 */

import { PaymentAmount, Currency } from "../types/common.js";

export function formatAmountForProvider(amount: PaymentAmount): number {
  if (amount.currency === "XOF" || amount.currency === "XAF") {
    return Math.round(amount.value * 100);
  }
  return amount.value;
}

export function parseAmountFromProvider(
  value: number,
  currency: string
): PaymentAmount {
  if (currency === "XOF" || currency === "XAF") {
    return {
      value: value / 100,
      currency: currency as Currency,
    };
  }

  return {
    value,
    currency: currency as Currency,
  };
}
