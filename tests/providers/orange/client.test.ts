/**
 * Orange Money client tests with mocking
 */

import axios, { AxiosInstance } from "axios";
import { OrangeClient } from "../../../src/providers/orange/client";
import {
  mockOrangeAuth,
  mockOrangeTransfer,
  mockOrangeBalance,
  mockOrangeHistory,
} from "../../__mocks__/orange-api";

// Mock the entire axios module
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    request: jest.fn(),
  })),
  post: jest.fn(),
  request: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OrangeClient", () => {
  let client: OrangeClient;
  let mockHttpClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Create a mock HTTP client
    mockHttpClient = {
      post: jest.fn(),
      request: jest.fn(),
    } as any;

    // Make axios.create return our mock client
    mockedAxios.create.mockReturnValue(mockHttpClient);

    client = new OrangeClient({
      apiKey: "test-api-key",
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
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
      // Mock auth request
      mockHttpClient.post.mockResolvedValueOnce({
        data: mockOrangeAuth,
      });

      // Mock transfer request
      mockHttpClient.request.mockResolvedValueOnce({
        data: mockOrangeTransfer,
      });

      const result = await client.sendMoney({
        provider: "orange",
        amount: { value: 10000, currency: "XOF" },
        recipient: { phoneNumber: "771234567", name: "Test User" },
        description: "Test payment",
      });

      expect(result.transactionId).toBe("TXN_123456789");
      expect(result.status).toBe("completed");
      expect(result.amount.value).toBe(10000);
      expect(result.fees.value).toBe(200);
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
      // Mock auth request
      mockHttpClient.post.mockResolvedValueOnce({
        data: mockOrangeAuth,
      });

      // Mock balance request
      mockHttpClient.request.mockResolvedValueOnce({
        data: mockOrangeBalance,
      });

      const result = await client.checkBalance();

      expect(result.balance.value).toBe(50000);
      expect(result.balance.currency).toBe("XOF");
      expect(result.provider).toBe("orange");
    });
  });

  describe("getTransactionHistory", () => {
    it("returns transaction history", async () => {
      // Mock auth request
      mockHttpClient.post.mockResolvedValueOnce({
        data: mockOrangeAuth,
      });

      // Mock history request
      mockHttpClient.request.mockResolvedValueOnce({
        data: mockOrangeHistory,
      });

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
    it("calculates correct fees for different amounts", async () => {
      const testCases = [
        { amount: 1000, expectedFee: 0 },
        { amount: 3000, expectedFee: 100 },
        { amount: 10000, expectedFee: 200 },
        { amount: 20000, expectedFee: 400 },
        { amount: 40000, expectedFee: 800 },
        { amount: 100000, expectedFee: 1500 },
        { amount: 200000, expectedFee: 2500 },
      ];

      for (const testCase of testCases) {
        const result = await client.calculateFees(
          { value: testCase.amount, currency: "XOF" },
          "771234567"
        );
        expect(result.value).toBe(testCase.expectedFee);
      }
    });
  });

  describe("testConnection", () => {
    it("returns true when authentication succeeds", async () => {
      mockHttpClient.post.mockResolvedValueOnce({
        data: mockOrangeAuth,
      });

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    it("returns false when authentication fails", async () => {
      mockHttpClient.post.mockRejectedValueOnce(new Error("Auth failed"));

      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });
});
