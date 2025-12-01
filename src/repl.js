#!/usr/bin/env -S deno run --allow-read
// REPL entry point - minimal JavaScript glue code
import { run } from "./Api.js";

const VERSION = "0.1.0";
const PROMPT = "eclexia> ";

console.log(`Eclexia REPL v${VERSION} (ReScript Edition)`);
console.log('Type ".exit" to quit\n');

const decoder = new TextDecoder();
const encoder = new TextEncoder();

while (true) {
  await Deno.stdout.write(encoder.encode(PROMPT));

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);

  if (n === null) break;

  const input = decoder.decode(buf.subarray(0, n)).trim();

  if (input === ".exit" || input === ".quit") {
    console.log("Goodbye!");
    break;
  }

  if (input === "") continue;

  try {
    const result = run(input);

    if (result.errors.length > 0) {
      result.errors.forEach(err => console.error("Error: " + err));
    } else if (result.value) {
      // Format value for display
      console.log(formatValue(result.value));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }

  console.log();
}

function formatValue(val) {
  if (!val) return "null";
  if (val.TAG === 0) return "null"; // VNull
  if (val.TAG === 1) return String(val._0); // VNumber
  if (val.TAG === 2) return `"${val._0}"`; // VString
  if (val.TAG === 3) return String(val._0); // VBool
  if (val.TAG === 4) return "[...]"; // VArray
  if (val.TAG === 5) return "{...}"; // VObject
  if (val.TAG === 6) return "<function>"; // VFunction
  return "<value>";
}
