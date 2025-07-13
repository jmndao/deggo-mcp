/**
 * Orange Money API mocks
 */

export const mockOrangeAuth = {
  access_token: "mock_access_token",
  token_type: "Bearer",
  expires_in: 3600,
};

export const mockOrangeTransfer = {
  transaction_id: "TXN_123456789",
  status: "SUCCESS",
  amount: 1000000, // 10,000 XOF in centimes
  currency: "XOF",
  fees: 20000, // 200 XOF in centimes
  reference: "DEGGO_TEST_REF",
  recipient_phone: "221771234567",
  message: "Transfer successful",
  created_at: "2024-01-15T10:30:00Z",
};

export const mockOrangeBalance = {
  balance: 5000000, // 50,000 XOF in centimes
  currency: "XOF",
  account_id: "ACC_123",
  account_name: "Test Account",
  status: "ACTIVE",
  last_transaction_date: "2024-01-15T09:00:00Z",
};

export const mockOrangeHistory = {
  transactions: [
    {
      transaction_id: "TXN_001",
      order_id: "ORD_001",
      amount: 500000,
      currency: "XOF",
      fees: 10000,
      status: "SUCCESS",
      type: "TRANSFER",
      reference: "REF_001",
      recipient: {
        phone_number: "221771234567",
        name: "Test Recipient",
      },
      created_at: "2024-01-15T08:00:00Z",
      updated_at: "2024-01-15T08:01:00Z",
    },
  ],
  total: 1,
  page: 1,
  limit: 50,
  has_more: false,
};
