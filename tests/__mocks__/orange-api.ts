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
  public_key: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`,
};

export const mockOrangeTransfer = {
  transaction_id: "TXN_123456789",
  status: "SUCCESS",
  amount: {
    value: 10000,
    currency: "XOF",
  },
  fees: {
    value: 50,
    currency: "XOF",
  },
  recipient: {
    msisdn: "221771234567",
  },
  partner: {
    msisdn: "221776543210",
  },
  created_date: "2024-01-15T10:30:00Z",
  reference: "DEGGO_TEST_REF",
};

export const mockOrangeBalance = {
  msisdn: "221771234567",
  balance: {
    value: 50000,
    currency: "XOF",
  },
  status: "ACTIVE",
};

export const mockOrangeHistory = {
  transactions: [
    {
      transaction_id: "TXN_001",
      status: "SUCCESS",
      amount: {
        value: 5000,
        currency: "XOF",
      },
      fees: {
        value: 25,
        currency: "XOF",
      },
      recipient: {
        msisdn: "221771234567",
      },
      created_date: "2024-01-15T08:00:00Z",
      reference: "REF_001",
    },
  ],
  total_count: 1,
  page: 1,
  size: 50,
  has_more: false,
};