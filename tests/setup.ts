/**
 * Test setup
 */

import dotenv from "dotenv";

// Load test environment
dotenv.config({ path: ".env.test" });

// Mock console.error for cleaner test output
global.console = {
  ...console,
  error: jest.fn(),
};
