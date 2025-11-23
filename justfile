# Eclexia Playground - Just Task Runner
# https://github.com/casey/just

# List all available recipes
default:
    @just --list

# ============================================================================
# Development
# ============================================================================

# Run in development mode with watch
dev:
    deno run --watch --allow-read --allow-write src/cli/main.ts

# Start development REPL
repl:
    deno run --allow-read src/cli/repl.ts

# Start playground server
playground:
    deno run --allow-read --allow-net --allow-write playground/server.ts

# ============================================================================
# Testing
# ============================================================================

# Run all tests
test:
    deno test --allow-read --allow-write

# Run tests in watch mode
test-watch:
    deno test --allow-read --allow-write --watch

# Run tests with coverage
test-coverage:
    deno test --allow-read --allow-write --coverage=coverage
    deno coverage coverage --lcov --output=coverage.lcov

# Run specific test file
test-file FILE:
    deno test --allow-read --allow-write {{FILE}}

# ============================================================================
# Quality Assurance
# ============================================================================

# Run linter
lint:
    deno lint

# Fix linting issues automatically
lint-fix:
    deno lint --fix

# Format code
fmt:
    deno fmt

# Check formatting without making changes
fmt-check:
    deno fmt --check

# Type-check all TypeScript files
check:
    deno check src/**/*.ts

# Run full CI pipeline locally
ci: fmt-check lint check test

# ============================================================================
# Building
# ============================================================================

# Bundle for distribution
bundle:
    deno bundle src/mod.ts dist/eclexia.js

# Compile CLI binary
compile:
    deno compile --allow-read --allow-write --output=bin/eclexia src/cli/main.ts

# Build all artifacts
build: bundle compile

# Clean build artifacts
clean:
    rm -rf dist/ bin/ coverage/ *.lcov

# ============================================================================
# Documentation
# ============================================================================

# Generate API documentation
docs:
    deno doc --html --name=Eclexia --output=docs/api src/mod.ts

# Serve documentation locally
docs-serve:
    deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts docs/

# Generate README badges
badges:
    @echo "Generating badges..."
    @echo "See docs/badges.md for badge URLs"

# ============================================================================
# Examples
# ============================================================================

# Run all examples
examples:
    @echo "Running example programs..."
    @for file in examples/*.ecx; do \
        echo "Running $$file..."; \
        deno run --allow-read src/cli/main.ts "$$file"; \
    done

# Run specific example
example NAME:
    deno run --allow-read src/cli/main.ts examples/{{NAME}}.ecx

# ============================================================================
# Benchmarking
# ============================================================================

# Run benchmarks
bench:
    deno bench --allow-read

# Run benchmarks and generate report
bench-report:
    deno bench --allow-read --json > benchmarks/results.json

# Compare benchmark results
bench-compare BEFORE AFTER:
    @echo "Comparing benchmarks: {{BEFORE}} vs {{AFTER}}"
    deno run --allow-read scripts/compare-benchmarks.ts {{BEFORE}} {{AFTER}}

# ============================================================================
# Code Analysis
# ============================================================================

# Count lines of code
loc:
    @echo "Lines of Code:"
    @find src -name "*.ts" | xargs wc -l | tail -1

# Show project statistics
stats:
    @echo "=== Eclexia Project Statistics ==="
    @echo ""
    @echo "Source Files:"
    @find src -name "*.ts" | wc -l
    @echo ""
    @echo "Test Files:"
    @find tests -name "*.ts" 2>/dev/null | wc -l || echo "0"
    @echo ""
    @echo "Total Lines (src):"
    @find src -name "*.ts" | xargs wc -l | tail -1
    @echo ""
    @echo "Example Programs:"
    @find examples -name "*.ecx" 2>/dev/null | wc -l || echo "0"
    @echo ""
    @echo "Documentation Files:"
    @find . -maxdepth 1 -name "*.md" | wc -l

# Check for TODO comments
todos:
    @echo "=== TODO Items ==="
    @grep -rn "TODO" src/ tests/ || echo "No TODOs found!"

# Check for FIXME comments
fixmes:
    @echo "=== FIXME Items ==="
    @grep -rn "FIXME" src/ tests/ || echo "No FIXMEs found!"

# ============================================================================
# Dependencies
# ============================================================================

# Show dependency tree
deps:
    deno info src/mod.ts

# Check for outdated dependencies
deps-check:
    @echo "Checking for outdated dependencies..."
    @echo "Deno version: $(deno --version)"

# Update dependencies
deps-update:
    @echo "Updating dependencies in deno.json..."
    @echo "Manual update required - check JSR for latest versions"

# ============================================================================
# Git Helpers
# ============================================================================

# Create a new release branch
release VERSION:
    git checkout -b release/{{VERSION}}
    @echo "Created release branch: release/{{VERSION}}"

# Tag a release
tag VERSION:
    git tag -a v{{VERSION}} -m "Release v{{VERSION}}"
    git push origin v{{VERSION}}

# ============================================================================
# RSR Compliance
# ============================================================================

# Check RSR compliance
rsr-check:
    @echo "=== RSR Compliance Check ==="
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
    @echo "Build & CI:"
    @test -f justfile && echo "✓ justfile" || echo "✗ justfile"
    @test -f .gitlab-ci.yml && echo "✓ .gitlab-ci.yml" || echo "✗ .gitlab-ci.yml"
    @echo ""
    @echo "Framework:"
    @test -f TPCF.md && echo "✓ TPCF.md" || echo "✗ TPCF.md"
    @test -f RSR_AUDIT.md && echo "✓ RSR_AUDIT.md" || echo "✗ RSR_AUDIT.md"

# Update RSR audit
rsr-audit:
    @echo "Updating RSR_AUDIT.md..."
    @echo "Manual update required - document compliance status"

# ============================================================================
# Utilities
# ============================================================================

# Install git hooks
hooks-install:
    @echo "Installing git hooks..."
    @mkdir -p .git/hooks
    @echo '#!/bin/sh\njust ci' > .git/hooks/pre-commit
    @chmod +x .git/hooks/pre-commit
    @echo "Pre-commit hook installed!"

# Remove git hooks
hooks-remove:
    rm -f .git/hooks/pre-commit
    @echo "Git hooks removed"

# Setup development environment
setup:
    @echo "Setting up development environment..."
    @deno --version
    @just hooks-install
    @echo "Setup complete! Run 'just dev' to start developing"

# Validate all configuration files
validate-config:
    @echo "Validating configuration files..."
    @deno check deno.json 2>/dev/null && echo "✓ deno.json valid" || echo "✗ deno.json invalid"
    @just --summary > /dev/null && echo "✓ justfile valid" || echo "✗ justfile invalid"

# Show environment info
env-info:
    @echo "=== Environment Information ==="
    @echo "Deno: $(deno --version | head -1)"
    @echo "OS: $(uname -s)"
    @echo "Arch: $(uname -m)"
    @echo "PWD: $(pwd)"
    @echo "Just: $(just --version)"

# ============================================================================
# Help
# ============================================================================

# Show detailed help
help:
    @echo "Eclexia Playground - Task Runner"
    @echo ""
    @echo "Usage: just <task>"
    @echo ""
    @echo "Run 'just' to see all available tasks"
    @echo "Run 'just --help' for Just CLI help"
    @echo ""
    @echo "Common workflows:"
    @echo "  just dev          - Start development"
    @echo "  just test         - Run tests"
    @echo "  just ci           - Run full CI pipeline"
    @echo "  just build        - Build all artifacts"
    @echo "  just rsr-check    - Check RSR compliance"
