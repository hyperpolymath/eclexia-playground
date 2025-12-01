#!/usr/bin/env -S deno run --allow-read --allow-write
// CLI entry point - minimal JavaScript glue code
import { run } from "./Api.js";

const args = Deno.args;

if (args.length === 0) {
  console.error("Usage: eclexia <file.ecx>");
  Deno.exit(1);
}

const filename = args[0];

try {
  const source = await Deno.readTextFile(filename);
  const result = run(source);

  if (result.errors.length > 0) {
    console.error("Errors:");
    result.errors.forEach(err => console.error("  " + err));
    Deno.exit(1);
  }

  Deno.exit(0);
} catch (error) {
  console.error("Error:", error.message);
  Deno.exit(1);
}
