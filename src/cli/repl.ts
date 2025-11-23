#!/usr/bin/env -S deno run --allow-read
/**
 * REPL for Eclexia
 */

import { run } from "../api.ts";

const VERSION = "0.1.0";
const PROMPT = "eclexia> ";

async function repl() {
  console.log(`Eclexia REPL v${VERSION}`);
  console.log('Type ".help" for help, ".exit" to quit\n');

  const decoder = new TextDecoder();

  while (true) {
    // Print prompt
    await Deno.stdout.write(new TextEncoder().encode(PROMPT));

    // Read line
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);

    if (n === null) break;

    const input = decoder.decode(buf.subarray(0, n)).trim();

    // Handle REPL commands
    if (input === ".exit" || input === ".quit") {
      console.log("Goodbye!");
      break;
    }

    if (input === ".help") {
      printHelp();
      continue;
    }

    if (input === ".version") {
      console.log(`Eclexia v${VERSION}`);
      continue;
    }

    if (input === "") {
      continue;
    }

    // Execute code
    try {
      const result = run(input);

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.error(`Error: ${error.message}`);
        }
      } else {
        console.log(formatValue(result.value));
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    console.log(); // Empty line for readability
  }
}

function printHelp() {
  console.log(`
REPL Commands:
  .help      Show this help
  .exit      Exit REPL
  .quit      Exit REPL
  .version   Show version

Eclexia Language Quick Reference:
  const x = 42              # Constant declaration
  function f(x) { ... }     # Function declaration
  agent Consumer { ... }    # Agent declaration
  [1, 2, 3]                 # Array literal
  { x: 10, y: 20 }          # Object literal
  x + y                     # Arithmetic
  presentValue(1000, 0.05, 10)  # Economics functions
  `);
}

function formatValue(value: any): string {
  switch (value.type) {
    case "null":
      return "null";
    case "number":
      return value.value.toString();
    case "string":
      return `"${value.value}"`;
    case "boolean":
      return value.value.toString();
    case "array":
      return `[${value.elements.map(formatValue).join(", ")}]`;
    case "object":
      return "{...}";
    case "function":
      return "<function>";
    default:
      return `<${value.type}>`;
  }
}

if (import.meta.main) {
  repl();
}
