module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Basic rules without TypeScript-specific ones
    "no-unused-vars": "off", // Disabled because TypeScript handles this
    "no-undef": "off", // Disabled because TypeScript handles this
    "prefer-const": "error",
    "no-var": "error",
    eqeqeq: "error",
    curly: "error",
  },
  ignorePatterns: ["dist/", "node_modules/", "coverage/", "*.js", "*.d.ts"],
};
