/**
 * Main module exports for Eclexia language
 * Economics-as-Code DSL
 */

export * from "./types.ts";
export * from "./lexer/mod.ts";
export * from "./parser/mod.ts";
export * from "./runtime/mod.ts";

// Main API
export { compile, run } from "./api.ts";
