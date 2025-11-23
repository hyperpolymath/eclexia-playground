# Contributing to Eclexia

Thank you for your interest in contributing to Eclexia! This document provides guidelines for contributing to the project.

## Tri-Perimeter Contribution Framework (TPCF)

This project follows the **Tri-Perimeter Contribution Framework (TPCF) Perimeter 3** model. See `TPCF.md` for full details.

**Perimeter 3 Summary**: Open contribution model with maintainer review and integration.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Areas of Contribution](#areas-of-contribution)

## Code of Conduct

All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally
3. **Add upstream remote**: `git remote add upstream https://github.com/Hyperpolymath/eclexia-playground.git`
4. **Create a branch** for your contribution: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- **Deno** 1.40.0 or higher
- **Git** for version control
- **Code editor** (VS Code recommended with Deno extension)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/eclexia-playground.git
cd eclexia-playground

# Install Deno (if not already installed)
curl -fsSL https://deno.land/install.sh | sh

# Run tests to verify setup
deno task test

# Start development
deno task dev
```

### Development Commands

```bash
deno task dev          # Run in watch mode
deno task test         # Run all tests
deno task test:watch   # Run tests in watch mode
deno task lint         # Lint code
deno task fmt          # Format code
deno task check        # Type-check code
deno task ci           # Run full CI suite locally
```

## Contribution Workflow

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   deno task ci  # Runs fmt, lint, check, test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add support for X"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill out the PR template completely
   - Link any related issues

## Coding Standards

### TypeScript/Deno Standards

- **Strict Mode**: TypeScript strict mode is enforced
- **No `any`**: Avoid using `any` type; use proper types or `unknown`
- **Formatting**: Use `deno fmt` (configured in `deno.json`)
- **Linting**: Pass `deno lint` without warnings
- **Imports**: Use Deno-style imports (no npm, use JSR when possible)

### Code Style

```typescript
// ✅ Good
export function calculateUtility(wealth: number, gamma: number): number {
  if (wealth <= 0) {
    throw new Error("Wealth must be positive");
  }
  return Math.pow(wealth, 1 - gamma) / (1 - gamma);
}

// ❌ Bad
export function calc(w: any, g: any) {
  return Math.pow(w, 1 - g) / (1 - g);
}
```

### File Organization

```
src/
├── lexer/         # Tokenization
├── parser/        # AST generation
├── runtime/       # Interpreter & execution
├── cli/           # Command-line interface
├── lsp/           # Language server
├── types.ts       # Shared type definitions
└── mod.ts         # Public API exports
```

## Testing Requirements

All contributions must include appropriate tests:

### Unit Tests

```typescript
import { assertEquals } from "@std/assert";
import { tokenize } from "./lexer.ts";

Deno.test("lexer tokenizes number literals", () => {
  const tokens = tokenize("42");
  assertEquals(tokens[0].type, "NUMBER");
  assertEquals(tokens[0].value, "42");
  assertEquals(tokens[0].literal, 42);
});
```

### Integration Tests

Test interactions between components (parser + interpreter, etc.)

### Test Coverage

- **Minimum Coverage**: 80% for new code
- **Critical Paths**: 100% coverage for parser, runtime core
- **Run Coverage**: `deno task coverage`

## Documentation

### Code Documentation

```typescript
/**
 * Calculates present value of future cash flows
 *
 * @param futureValue - The future value to discount
 * @param rate - The discount rate (e.g., 0.05 for 5%)
 * @param periods - Number of periods
 * @returns The present value
 *
 * @example
 * ```ts
 * const pv = presentValue(1000, 0.05, 10);
 * console.log(pv); // 613.91
 * ```
 */
export function presentValue(
  futureValue: number,
  rate: number,
  periods: number,
): number {
  return futureValue / Math.pow(1 + rate, periods);
}
```

### Update Documentation

When adding features, update:
- `README.md` - User-facing features
- `docs/` - Detailed guides
- API documentation (JSDoc comments)
- `CHANGELOG.md` - User-visible changes

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, tooling changes
- `ci`: CI/CD changes

### Examples

```
feat(parser): add support for lambda expressions

Implement lambda expression parsing with support for:
- Single expression bodies
- Multi-statement bodies
- Type annotations

Closes #123
```

```
fix(runtime): handle division by zero in binary expressions

Previously, division by zero would crash the interpreter.
Now throws a RuntimeError with descriptive message.

Fixes #456
```

## Pull Request Process

1. **PR Title**: Use conventional commit format
2. **Description**: Clearly explain what and why
3. **Checklist**: Complete the PR template checklist
4. **Tests**: All tests must pass
5. **Review**: Address all reviewer feedback
6. **Squash**: Maintainers may squash commits on merge

### PR Template

```markdown
## Description
Brief description of changes

## Motivation
Why is this change needed?

## Changes
- List of changes made

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code formatted (`deno fmt`)
- [ ] Linter passes (`deno lint`)
- [ ] Type-check passes (`deno check`)
- [ ] Changelog updated
```

## Areas of Contribution

### High Priority

- Economic model examples
- Standard library functions (economics, statistics)
- Performance optimizations
- Documentation and tutorials
- Test coverage improvements

### Medium Priority

- LSP features (autocomplete, diagnostics)
- CLI enhancements
- Error message improvements
- Playground UI features

### Low Priority

- IDE plugins
- Syntax highlighting for editors
- Benchmarking suite
- Alternative backends (WASM optimization)

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue with the "bug" label
- **Features**: Propose in GitHub Discussions first
- **Chat**: Join our community chat (if available)

## Recognition

Contributors are recognized in:
- `CHANGELOG.md` for each release
- `CONTRIBUTORS.md` file
- GitHub contributors graph
- Project documentation

## License

By contributing, you agree to license your contributions under the project's dual MIT + Palimpsest v0.8 license. See `LICENSE.txt`.

---

Thank you for contributing to Eclexia! Your work helps advance economics-as-code for everyone.
