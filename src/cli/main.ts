#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * CLI entry point for Eclexia
 */

import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { run } from "../api.ts";

const VERSION = "0.1.0";

async function main() {
  const args = parse(Deno.args, {
    boolean: ["help", "version", "ast", "tokens"],
    string: ["output"],
    alias: {
      h: "help",
      v: "version",
      o: "output",
    },
  });

  if (args.help) {
    printHelp();
    Deno.exit(0);
  }

  if (args.version) {
    console.log(`Eclexia v${VERSION}`);
    Deno.exit(0);
  }

  const inputFile = args._[0] as string | undefined;

  if (!inputFile) {
    console.error("Error: No input file specified");
    console.error("Run with --help for usage information");
    Deno.exit(1);
  }

  try {
    const source = await Deno.readTextFile(inputFile);
    const result = run(source);

    if (result.errors.length > 0) {
      console.error("Errors:");
      for (const error of result.errors) {
        console.error(`  ${error.message}`);
      }
      Deno.exit(1);
    }

    if (args.output) {
      await Deno.writeTextFile(
        args.output,
        JSON.stringify(result.value, null, 2),
      );
      console.log(`Output written to ${args.output}`);
    }

    Deno.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  }
}

function printHelp() {
  console.log(`
Eclexia - Economics-as-Code DSL

USAGE:
    eclexia [OPTIONS] <FILE>

OPTIONS:
    -h, --help       Show this help message
    -v, --version    Show version information
    -o, --output     Write output to file
    --ast            Print AST instead of executing
    --tokens         Print tokens instead of executing

EXAMPLES:
    eclexia program.ecx
    eclexia --output result.json program.ecx
    eclexia --ast program.ecx

For more information, visit: https://github.com/Hyperpolymath/eclexia-playground
  `);
}

if (import.meta.main) {
  main();
}
