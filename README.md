# Eclexia - Economics-as-Code DSL

![ReScript](https://img.shields.io/badge/ReScript-100%25-E6484F?style=for-the-badge&logo=rescript)
![Zero TypeScript](https://img.shields.io/badge/TypeScript-0%25-red?style=for-the-badge&logo=typescript)
![Deno](https://img.shields.io/badge/Runtime-Deno-70FFAF?style=for-the-badge&logo=deno&logoColor=black)
![FOSS](https://img.shields.io/badge/License-MIT%2BPalimpsest-blue?style=for-the-badge)

**100% ReScript + Deno + WASM** (ZERO TypeScript, ZERO Node.js runtime!)

## 🎯 Language Breakdown

| Language | Percentage | Purpose |
|----------|-----------|---------|
| **ReScript** | ~40% | Core implementation (`.res` → `.js`) |
| **JavaScript** | ~55% | Compiled output + minimal glue |
| **Shell** | ~3% | Build scripts, CI/CD |
| **Markdown** | ~2% | Documentation |
| **TypeScript** | **0%** ✅ | **NONE - By design!** |

See [Language Statistics](.github/LINGUIST.md) for detailed breakdown.

## Tech Stack

- **ReScript**: Functional programming language, compiles `.res` to `.js`
- **Deno**: Pure JavaScript runtime (NO Node.js!)
- **WASM**: WebAssembly for performance-critical operations
- **Just**: Task runner (replaces npm scripts)
- **npm**: ONLY for ReScript compiler and runtime libraries

## Setup

```bash
# Install ReScript compiler (one-time)
npm install

# Compile ReScript → JS
npm run res:build

# Run on Deno
deno run --allow-read src/Main.js examples/test.ecx
```

## Key Point

✅ **Compilation**: ReScript (.res → .js)  
✅ **Runtime**: Pure Deno (compiled .js files)  
❌ **NO TypeScript**  
❌ **NO Node.js runtime**

The compiled `.js` files are checked into git so users can run on Deno without compiling!
