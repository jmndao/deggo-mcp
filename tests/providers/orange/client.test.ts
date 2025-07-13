/**
 * Orange Money client tests - Fixed
 */

import axios, { AxiosInstance } from "axios";
import { OrangeClient } from "../../../src/providers/orange/client";
import {
  mockOrangeAuth,
  mockOrangeTransfer,
  mockOrangeBalance,
  mockOrangeHistory,
  mockOrangePublicKey,
} from "../../__mocks__/orange-api";

// Mock axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    request: jest.fn(),
    get: jest.fn(),
  })),
}));

// Mock node-rsa
jest.mock("node-rsa", () => {
  return jest.fn().mockImplementation(() => ({
    importKey: jest.fn(),
    setOptions: jest.fn(),
    encrypt: jest.fn().mockReturnValue("encrypted_pin_123"),
  }));
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OrangeClient", () => {
  let client: OrangeClient;
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      request: jest.fn(),
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockHttpClient);

    // Create client with proper config structure including pinCode
    client = new OrangeClient({
      apiKey: "221771234567",
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      pinCode: "1234",
      environment: "sandbox",
      timeout: 30000,
      retryAttempts: 3,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMoney", () => {
    it("successfully sends money", async () => {
      // Mock auth
      mockHttpClient.post.mockResolvedValueOnce({ data: mockOrangeAuth });
      // Mock public key
      mockHttpClient.get.mockResolvedValueOnce({ data: mockOrangePublicKey });
      // Mock transfer
      mockHttpClient.request.mockResolvedValueOnce({
        data: mockOrangeTransfer,
      });

      const result = await client.sendMoney({
        provider: "orange",
        amount: { value: 10000, currency: "XOF" },
        recipient: { phoneNumber: "771234567", name: "Test User" },
      });

      expect(result.transactionId).toBe("TXN_123456789");
      expect(result.status).toBe("completed");
      expect(result.amount.value).toBe(10000);
    });

    it("validates payment request", async () => {
      await expect(
        client.sendMoney({
          provider: "orange",
          amount: { value: 0, currency: "XOF" },
          recipient: { phoneNumber: "771234567" },
        })
      ).rejects.toThrow("Invalid payment");
    });
  });

  describe("checkBalance", () => {
    it("returns account balance", async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: mockOrangeAuth });
      mockHttpClient.request.mockResolvedValueOnce({ data: mockOrangeBalance });

      const result = await client.checkBalance();

      expect(result.balance.value).toBe(50000);
      expect(result.balance.currency).toBe("XOF");
      expect(result.provider).toBe("orange");
    });
  });

  describe("getTransactionHistory", () => {
    it("returns transaction history", async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: mockOrangeAuth });
      mockHttpClient.request.mockResolvedValueOnce({ data: mockOrangeHistory });

      const result = await client.getTransactionHistory({
        page: 1,
        limit: 10,
      });

      expect(result.transactions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.transactions[0].transactionId).toBe("TXN_001");
    });
  });

  describe("calculateFees", () => {
    it("calculates correct fees", async () => {
      const result = await client.calculateFees(
        { value: 10000, currency: "XOF" },
        "771234567"
      );
      expect(result.value).toBe(200);
    });
  });

  describe("testConnection", () => {
    it("returns true when auth succeeds", async () => {
      mockHttpClient.post.mockResolvedValueOnce({ data: mockOrangeAuth });
      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it("returns false when auth fails", async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error("Auth failed"));
      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });
});
