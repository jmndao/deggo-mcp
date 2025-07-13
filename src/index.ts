/**
 * Main exports - clean and organized
 */

export { Deggo } from "./core/deggo";
export { DeggoError, ERROR_CODES } from "./core/errors";
export { createConfig } from "./config";

// Type exports
export * from "./types/common";
export * from "./types/config";

// Provider exports
export { IPaymentProvider } from "./providers/base";

// Set as default export
export { Deggo as default } from "./core/deggo";
