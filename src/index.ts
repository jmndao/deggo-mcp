/**
 * Main exports
 */

export { Deggo } from "./core/deggo.js";
export { DeggoError, ERROR_CODES } from "./core/errors.js";
export { createConfig } from "./config/index.js";

// Type exports
export * from "./types/common.js";
export * from "./types/config.js";

// Provider exports
export { IPaymentProvider } from "./providers/base.js";

// Set as default export
export { Deggo as default } from "./core/deggo.js";
