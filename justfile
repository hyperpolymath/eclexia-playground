# Eclexia Playground - Pure ReScript + Deno + WASM
# NO npm, NO bun, NO TypeScript, NO Node.js runtime!

# Configuration
export RESCRIPT_PATH := "./tools/rescript/rescript"
export DENO_DIR := "./.deno_cache"
export WASM_DIR := "./wasm"

# Default recipe - show all available commands
default:
    @just --list --unsorted

# ============================================================================
# Setup & Installation (NO npm!)
# ============================================================================

# Complete project setup
setup: install-rescript create-dirs
    @echo "✓ Setup complete!"
    @echo "Next: just build"

# Download standalone ReScript compiler (NO npm!)
install-rescript:
    @echo "Downloading standalone ReScript compiler..."
    @mkdir -p tools
    @if [ "$(uname)" = "Darwin" ]; then \
        curl -L https://github.com/rescript-lang/rescript-compiler/releases/download/v11.1.0/rescript-darwin-v11.1.0.tar.gz | tar -xz -C tools/; \
    elif [ "$(uname)" = "Linux" ]; then \
        curl -L https://github.com/rescript-lang/rescript-compiler/releases/download/v11.1.0/rescript-linux-v11.1.0.tar.gz | tar -xz -C tools/; \
    fi
    @chmod +x tools/rescript/rescript
    @echo "✓ ReScript compiler installed to ./tools/rescript/"

# Create necessary directories
create-dirs:
    @mkdir -p src examples wasm lib .deno_cache

# Clean downloaded tools
clean-tools:
    rm -rf tools/

# ============================================================================
# Building (ReScript → JavaScript)
# ============================================================================

# Build all ReScript sources
build:
    @echo "Compiling ReScript → JavaScript..."
    @if [ -f "{{RESCRIPT_PATH}}" ]; then \
        {{RESCRIPT_PATH}} build; \
    else \
        echo "❌ ReScript compiler not found!"; \
        echo "Run: just install-rescript"; \
        exit 1; \
    fi
    @echo "✓ Build complete!"

# Watch mode - rebuild on file changes
watch:
    @echo "Watching ReScript files..."
    {{RESCRIPT_PATH}} build -w

# Clean build artifacts
clean:
    @echo "Cleaning build artifacts..."
    @{{RESCRIPT_PATH}} clean 2>/dev/null || true
    @find src -name "*.js" -type f -delete 2>/dev/null || true
    @rm -rf lib/ .deno_cache/
    @echo "✓ Clean complete!"

# Rebuild from scratch
rebuild: clean build

# Type-check without building
check:
    @echo "Type-checking ReScript sources..."
    @{{RESCRIPT_PATH}} build -with-deps

# ============================================================================
# Running (Pure Deno - NO Node.js!)
# ============================================================================

# Run development mode
dev FILE: build
    @echo "Running: {{FILE}}"
    @deno run --allow-read src/Main.js {{FILE}}

# Run without rebuilding (faster)
run FILE:
    @deno run --allow-read src/Main.js {{FILE}}

# Start interactive REPL
repl: build
    @deno run --allow-read src/Repl.js

# ============================================================================
# Examples
# ============================================================================

# Run all examples
examples: build
    @echo "Running all examples..."
    @for file in examples/*.ecx; do \
        echo "▶ $$file"; \
        deno run --allow-read src/Main.js "$$file" || true; \
        echo ""; \
    done

# Run specific example
example NAME: build
    @deno run --allow-read src/Main.js examples/{{NAME}}.ecx

# ============================================================================
# Testing (Deno test framework)
# ============================================================================

# Run all tests
test: build
    @deno test --allow-read --allow-write tests/

# Run tests in watch mode
test-watch: build
    @deno test --allow-read --allow-write --watch tests/

# Run unit tests only
test-unit: build
    @deno test --allow-read tests/unit/

# Run integration tests only
test-integration: build
    @deno test --allow-read tests/integration/

# Run with coverage
test-coverage: build
    @deno test --allow-read --allow-write --coverage=coverage tests/
    @deno coverage coverage --lcov --output=coverage.lcov

# ============================================================================
# Code Quality
# ============================================================================

# Format ReScript code
fmt:
    @echo "Formatting ReScript code..."
    @{{RESCRIPT_PATH}} format -all

# Check formatting
fmt-check:
    @echo "Checking ReScript formatting..."
    @{{RESCRIPT_PATH}} format -all -check

# Run full CI pipeline
ci: fmt-check check build test
    @echo "✓ CI pipeline passed!"

# ============================================================================
# WASM Compilation
# ============================================================================

# Build WASM modules from Rust
wasm-build:
    @echo "Building WASM modules..."
    @if [ -d "{{WASM_DIR}}" ]; then \
        cd {{WASM_DIR}} && \
        cargo build --target wasm32-unknown-unknown --release && \
        cp target/wasm32-unknown-unknown/release/*.wasm ../lib/; \
        echo "✓ WASM build complete!"; \
    else \
        echo "No WASM directory found. Skipping."; \
    fi

# Optimize WASM binaries
wasm-optimize:
    @echo "Optimizing WASM modules..."
    @for wasm in lib/*.wasm; do \
        if [ -f "$$wasm" ]; then \
            wasm-opt -Oz "$$wasm" -o "$$wasm.opt" && \
            mv "$$wasm.opt" "$$wasm"; \
            echo "✓ Optimized: $$wasm"; \
        fi \
    done

# Test WASM modules
wasm-test:
    @if [ -d "{{WASM_DIR}}" ]; then \
        cd {{WASM_DIR}} && cargo test; \
    fi

# Clean WASM artifacts
wasm-clean:
    @if [ -d "{{WASM_DIR}}" ]; then \
        cd {{WASM_DIR}} && cargo clean; \
    fi
    @rm -f lib/*.wasm

# ============================================================================
# Documentation
# ============================================================================

# Generate documentation
docs:
    @echo "Generating documentation..."
    @mkdir -p docs/api
    @deno doc --html --name=Eclexia src/Main.js > docs/api/index.html

# Serve documentation
docs-serve:
    @deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts docs/

# ============================================================================
# Project Information
# ============================================================================

# Show project statistics
stats:
    @echo "=== Eclexia Project Statistics ==="
    @echo ""
    @echo "ReScript Source Files:"
    @find src -name "*.res" 2>/dev/null | wc -l
    @echo ""
    @echo "Compiled JavaScript Files:"
    @find src -name "*.js" 2>/dev/null | wc -l
    @echo ""
    @echo "Example Programs:"
    @find examples -name "*.ecx" 2>/dev/null | wc -l
    @echo ""
    @echo "WASM Modules:"
    @find lib -name "*.wasm" 2>/dev/null | wc -l || echo "0"
    @echo ""
    @echo "ReScript Lines:"
    @find src -name "*.res" -exec wc -l {} + 2>/dev/null | tail -1 || echo "0"
    @echo ""
    @echo "Documentation Files:"
    @find . -maxdepth 1 -name "*.md" -o -name "*.adoc" | wc -l

# Count lines of code
loc:
    @echo "Lines of Code:"
    @echo ""
    @echo "ReScript:"
    @find src -name "*.res" -exec wc -l {} + 2>/dev/null | tail -1 || echo "0"
    @echo ""
    @echo "JavaScript (compiled):"
    @find src -name "*.js" -exec wc -l {} + 2>/dev/null | tail -1 || echo "0"
    @echo ""
    @echo "Rust (WASM):"
    @find wasm -name "*.rs" -exec wc -l {} + 2>/dev/null | tail -1 || echo "0"

# Show environment info
env-info:
    @echo "=== Environment Information ==="
    @echo "Deno: $$(deno --version | head -1)"
    @echo "ReScript: $$({{RESCRIPT_PATH}} -version 2>/dev/null || echo 'Not installed')"
    @echo "Just: $$(just --version)"
    @echo "OS: $$(uname -s)"
    @echo "Arch: $$(uname -m)"
    @echo "PWD: $$(pwd)"

# Show dependency info
deps:
    @echo "=== Dependencies ==="
    @echo "✓ Deno (runtime)"
    @echo "✓ ReScript (compiler)"
    @echo "✓ WASM (optional, for performance)"
    @echo ""
    @echo "❌ NO npm"
    @echo "❌ NO bun"
    @echo "❌ NO TypeScript"
    @echo "❌ NO Node.js"

# ============================================================================
# RSR Compliance
# ============================================================================

# Check RSR Silver compliance
rsr-check:
    @echo "=== RSR Silver Compliance Check ==="
    @echo ""
    @echo "Community Health Files:"
    @test -f LICENSE.txt && echo "✓ LICENSE.txt" || echo "✗ LICENSE.txt"
    @test -f SECURITY.md && echo "✓ SECURITY.md" || echo "✗ SECURITY.md"
    @test -f CONTRIBUTING.md && echo "✓ CONTRIBUTING.md" || echo "✗ CONTRIBUTING.md"
    @test -f CODE_OF_CONDUCT.md && echo "✓ CODE_OF_CONDUCT.md" || echo "✗ CODE_OF_CONDUCT.md"
    @test -f MAINTAINERS.md && echo "✓ MAINTAINERS.md" || echo "✗ MAINTAINERS.md"
    @test -f CHANGELOG.md && echo "✓ CHANGELOG.md" || echo "✗ CHANGELOG.md"
    @echo ""
    @echo ".well-known Files:"
    @test -f .well-known/security.txt && echo "✓ security.txt" || echo "✗ security.txt"
    @test -f .well-known/ai.txt && echo "✓ ai.txt" || echo "✗ ai.txt"
    @test -f .well-known/humans.txt && echo "✓ humans.txt" || echo "✗ humans.txt"
    @echo ""
    @echo "Build System:"
    @test -f justfile && echo "✓ justfile" || echo "✗ justfile"
    @test -f bsconfig.json && echo "✓ bsconfig.json (ReScript)" || echo "✗ bsconfig.json"
    @echo ""
    @echo "Tech Stack:"
    @echo "✓ ReScript (functional, type-safe)"
    @echo "✓ Deno (pure runtime)"
    @echo "✓ WASM (performance)"
    @echo "❌ NO npm/TypeScript!"

# Generate RSR audit report
rsr-audit:
    @echo "Generating RSR audit report..."
    @echo "See RSR_AUDIT.md for compliance status"

# ============================================================================
# Utilities
# ============================================================================

# Find TODO comments
todos:
    @echo "=== TODO Items ==="
    @grep -rn "TODO" src/ 2>/dev/null || echo "No TODOs found!"

# Find FIXME comments
fixmes:
    @echo "=== FIXME Items ==="
    @grep -rn "FIXME" src/ 2>/dev/null || echo "No FIXMEs found!"

# Search code
search TERM:
    @grep -rn "{{TERM}}" src/

# ============================================================================
# Benchmarking
# ============================================================================

# Run benchmarks
bench: build
    @deno bench --allow-read benchmarks/

# Compare benchmarks
bench-compare BEFORE AFTER:
    @echo "Comparing {{BEFORE}} vs {{AFTER}}"
    @echo "Not implemented yet"

# ============================================================================
# Git & Release
# ============================================================================

# Create conventional commit
commit MESSAGE:
    @git add -A
    @git commit -m "{{MESSAGE}}"

# Create release
release VERSION:
    @echo "Creating release {{VERSION}}"
    @git tag -a v{{VERSION}} -m "Release v{{VERSION}}"
    @echo "Push with: git push --tags"

# ============================================================================
# Help & Documentation
# ============================================================================

# Show detailed help
help:
    @echo "Eclexia Playground - ReScript + Deno + WASM"
    @echo ""
    @echo "See just-cookbook.adoc for comprehensive documentation"
    @echo ""
    @echo "Quick start:"
    @echo "  just setup     - Initial setup"
    @echo "  just build     - Compile ReScript"
    @echo "  just dev FILE  - Run a file"
    @echo "  just repl      - Interactive REPL"
    @echo "  just ci        - Full CI pipeline"
    @echo ""
    @echo "Run 'just' to see all commands"

# Show cookbook
cookbook:
    @less just-cookbook.adoc || cat just-cookbook.adoc
