/**
 * Amount utils tests
 */

import {
  formatAmountForProvider,
  parseAmountFromProvider,
} from "../../src/utils/amount.js";

describe("Amount Utils", () => {
  it("formats XOF amounts", () => {
    const result = formatAmountForProvider({ value: 100, currency: "XOF" });
    expect(result).toBe(10000);
  });

  it("formats USD amounts", () => {
    const result = formatAmountForProvider({ value: 100, currency: "USD" });
    expect(result).toBe(100);
  });

  it("parses XOF amounts", () => {
    const result = parseAmountFromProvider(10000, "XOF");
    expect(result).toEqual({ value: 100, currency: "XOF" });
  });

  it("parses USD amounts", () => {
    const result = parseAmountFromProvider(100, "USD");
    expect(result).toEqual({ value: 100, currency: "USD" });
  });
});
