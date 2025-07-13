/**
 * Orange Money API mocks - Updated for Orange Sonatel API
 */

export const mockOrangeAuth = {
  access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  token_type: "bearer",
  expires_in: 300,
  scope: "apimanagement email profile",
};

export const mockOrangePublicKey = {
  publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`,
  keyId: "key_123456",
};

export const mockOrangeTransfer = {
  transactionId: "TXN_123456789",
  status: "SUCCESS",
  amount: {
    value: 10000,
    unit: "XOF",
  },
  fees: {
    value: 200,
    unit: "XOF",
  },
  reference: "DEGGO_TEST_REF",
  createdAt: "2024-01-15T10:30:00Z",
};

export const mockOrangeBalance = {
  balance: {
    value: 50000,
    unit: "XOF",
  },
  accountId: "ACC_123",
  status: "ACTIVE",
  lastTransactionDate: "2024-01-15T09:00:00Z",
};

export const mockOrangeHistory = {
  transactions: [
    {
      transactionId: "TXN_001",
      status: "SUCCESS",
      amount: {
        value: 5000,
        unit: "XOF",
      },
      fees: {
        value: 100,
        unit: "XOF",
      },
      reference: "REF_001",
      createdAt: "2024-01-15T08:00:00Z",
      customer: {
        id: "221771234567",
      },
    },
  ],
  total: 1,
  page: 1,
  limit: 50,
  hasMore: false,
};
