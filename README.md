# Eclexia - Economics-as-Code DSL

**ReScript + Deno + WASM** (NO TypeScript, NO Node.js runtime!)

## Tech Stack

- **ReScript**: Functional programming language that compiles to JavaScript
- **Deno**: Pure JavaScript runtime (NO Node.js!)
- **WASM**: WebAssembly for performance-critical operations
- **Just**: Task runner (replaces npm scripts)
- **npm**: ONLY for ReScript compiler and runtime libraries

## Architecture

```
┌─────────────────┐
│ .res files      │  ReScript source
│ (src/*.res)     │
└────────┬────────┘
         │
         ↓ rescript compiler
┌─────────────────┐
│ .js files       │  ES6 JavaScript
│ (src/*.js)      │
└────────┬────────┘
         │
         ↓ deno run (pure Deno runtime)
┌─────────────────┐
│ Execution       │
└─────────────────┘
```

## Quick Start

### Prerequisites

```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Install Just (task runner)
# macOS
brew install just

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin
```

### Build & Run

```bash
# Complete setup (downloads ReScript compiler)
npm install

# Build ReScript sources
npx rescript build
# OR use Just
just build

# Run an example
deno run --allow-read src/main.js examples/simple_math.ecx

# Start REPL
deno run --allow-read src/repl.js
```

## Development

See `justfile` for all available commands (50+ recipes!):

```bash
# Show all commands
just --list

# Build & watch
just watch

# Run examples
just examples

# Full CI pipeline
just ci
```

Comprehensive documentation available in `just-cookbook.adoc`.

## Key Points

✅ **Compilation**: ReScript (.res → .js)
✅ **Runtime**: Pure Deno (compiled .js files)
✅ **Build**: Just task runner (or npm scripts)
❌ **NO TypeScript**
❌ **NO Node.js runtime** (Deno only!)
❌ **NO npm at runtime** (only for build tools)

## Examples

- `examples/simple_math.ecx` - Basic arithmetic
- `examples/currency.ecx` - Currency calculations
- `examples/compound_interest.ecx` - Financial modeling
- `examples/boolean_logic.ecx` - Logic operations

## RSR Silver Compliance

This project achieves **RSR Silver Level** compliance with:

- ✅ Governance files (LICENSE, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, MAINTAINERS)
- ✅ `.well-known/` directory (security.txt, ai.txt, humans.txt)
- ✅ CHANGELOG.md (Keep a Changelog format)
- ✅ Comprehensive build system (Just recipes)
- ✅ Pure functional architecture (ReScript)

## License

Dual licensed: MIT + Palimpsest v0.8

See `LICENSE.txt` for details.
