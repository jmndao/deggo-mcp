/**
 * Phone utilities tests
 */

import { formatPhoneNumber, validatePhoneNumber } from "../../src/utils/phone";

describe("Phone Utils", () => {
  describe("formatPhoneNumber", () => {
    it("adds country code to 9-digit numbers", () => {
      expect(formatPhoneNumber("771234567")).toBe("221771234567");
    });

    it("preserves numbers with country code", () => {
      expect(formatPhoneNumber("221771234567")).toBe("221771234567");
    });

    it("removes non-digits", () => {
      expect(formatPhoneNumber("+221 77 123 45 67")).toBe("221771234567");
    });
  });

  describe("validatePhoneNumber", () => {
    it("validates correct Senegalese numbers", () => {
      expect(validatePhoneNumber("771234567")).toBe(true);
      expect(validatePhoneNumber("221771234567")).toBe(true);
    });

    it("rejects invalid prefixes", () => {
      expect(validatePhoneNumber("731234567")).toBe(false);
    });

    it("rejects wrong length", () => {
      expect(validatePhoneNumber("77123456")).toBe(false);
    });
  });
});
