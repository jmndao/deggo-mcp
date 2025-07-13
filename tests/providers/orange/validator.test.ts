/**
 * Orange validator tests
 */

import { validateOrangePayment } from "../../../src/providers/orange/validator";

describe("Orange Validator", () => {
  const validRequest = {
    provider: "orange" as const,
    amount: { value: 10000, currency: "XOF" as const },
    recipient: { phoneNumber: "771234567" },
    description: "Test payment",
  };

  it("validates correct payment request", () => {
    const result = validateOrangePayment(validRequest);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects zero amount", () => {
    const request = {
      ...validRequest,
      amount: { value: 0, currency: "XOF" as const },
    };
    const result = validateOrangePayment(request);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Amount must be greater than 0");
  });

  it("rejects amount over limit", () => {
    const request = {
      ...validRequest,
      amount: { value: 400000, currency: "XOF" as const },
    };
    const result = validateOrangePayment(request);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Amount exceeds Orange Money limit of 300,000 XOF"
    );
  });

  it("rejects non-XOF currency", () => {
    const request = {
      ...validRequest,
      amount: { value: 10000, currency: "USD" as const },
    };
    const result = validateOrangePayment(request);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Orange Money only supports XOF currency");
  });
});
