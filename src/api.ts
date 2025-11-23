/**
 * High-level API for Eclexia
 */

import type { Program, RuntimeValue } from "./types.ts";
import { tokenize } from "./lexer/mod.ts";
import { parse } from "./parser/mod.ts";
import { interpret } from "./runtime/mod.ts";

export interface CompileResult {
  ast: Program;
  errors: Error[];
}

export function compile(source: string): CompileResult {
  const errors: Error[] = [];
  let ast: Program | null = null;

  try {
    const tokens = tokenize(source);
    ast = parse(tokens);
  } catch (error) {
    errors.push(error as Error);
  }

  return {
    ast: ast!,
    errors,
  };
}

export interface RunResult {
  value: RuntimeValue;
  errors: Error[];
}

export function run(source: string): RunResult {
  const errors: Error[] = [];
  let value: RuntimeValue = { type: "null" };

  try {
    const tokens = tokenize(source);
    const ast = parse(tokens);
    value = interpret(ast);
  } catch (error) {
    errors.push(error as Error);
  }

  return {
    value,
    errors,
  };
}
