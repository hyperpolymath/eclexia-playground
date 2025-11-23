# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- WASM compilation target
- Language Server Protocol (LSP) implementation
- Advanced debugger with time-travel
- Interactive tutorial system
- Plugin architecture

## [0.1.0] - 2025-11-22

### Added

#### Core Language Features

- Complete lexer with tokenization for Eclexia syntax
- Recursive descent parser generating full AST
- Tree-walking interpreter with runtime execution
- Comprehensive type system (primitives, arrays, objects, functions)
- Economics-specific types (currency, quantity, time)
- Agent, Good, Market, Policy, and Model declarations
- Behavior declarations with trigger support
- Transaction statements for economic transfers
- Lambda expressions with type inference
- Array comprehensions
- Range expressions (inclusive and exclusive)

#### Standard Library

- Math functions (abs, ceil, floor, round, sqrt, pow, log, exp, sin, cos, tan)
- Statistical functions (sum, mean, median, variance, stddev, min, max)
- Economics functions (presentValue, futureValue, npv, irr, compoundInterest)
- Utility theory (logarithmicUtility, powerUtility, priceElasticity)
- Array operations (length, sum, mean, etc.)
- String operations (toLowerCase, toUpperCase, substring, split, join)
- Type conversion (toString, toNumber)
- I/O (print)
- Constants (PI, E)

#### Project Infrastructure

- Deno-based development environment (zero npm dependencies)
- Comprehensive deno.json configuration with 15+ tasks
- TypeScript strict mode enforcement
- Complete .gitignore for Deno projects

#### RSR Silver Level Compliance

- **Community Health Files**:
  - `LICENSE.txt` - Dual MIT + Palimpsest v0.8 licensing
  - `SECURITY.md` - RFC 9116 compliant security policy with CVD process
  - `CONTRIBUTING.md` - TPCF Perimeter 3 contribution guidelines
  - `CODE_OF_CONDUCT.md` - CCCP-based with emotional safety monitoring
  - `MAINTAINERS.md` - BDFN governance model documentation
  - `CHANGELOG.md` - Keep a Changelog format (this file)

- **RFC Compliance**:
  - `.well-known/security.txt` - RFC 9116 compliant security contact
  - `.well-known/ai.txt` - AI training policy declaration
  - `.well-known/humans.txt` - Comprehensive team attribution

- **Build & Development**:
  - `justfile` - Task runner with 30+ recipes
  - `.gitlab-ci.yml` - Multi-stage CI/CD pipeline

- **Framework Documentation**:
  - `TPCF.md` - Tri-Perimeter Contribution Framework declaration
  - `RSR_AUDIT.md` - Compliance tracking and achievement documentation

#### Documentation

- README.md with quick start guide
- Examples directory with sample Eclexia programs
- API documentation via JSDoc comments
- Inline code documentation

### Technical Details

- **Lines of Code**: ~3,500+ core language implementation
- **Type Safety**: 100% TypeScript strict mode compliance
- **Architecture**: Modular design (lexer, parser, runtime separation)
- **Performance**: Tree-walking interpreter (baseline, optimizations planned)
- **Platform**: Deno 1.40.0+, cross-platform (Linux, macOS, Windows)

### Security

- No use of `eval()` or dynamic code execution
- Input validation in lexer and parser
- Type-safe runtime with explicit error handling
- No dependency on npm packages (Deno std only)

### Breaking Changes

- N/A (initial release)

### Deprecated

- N/A (initial release)

### Known Issues

- No WASM compilation yet (planned for 0.2.0)
- LSP not implemented (planned for 0.3.0)
- Limited error recovery in parser (fails fast)
- No optimization passes (future enhancement)

### Contributors

- Initial implementation and architecture
- RSR Silver compliance achievement
- Documentation and examples

## Release Notes

### v0.1.0 - "Foundation" Release

This initial release establishes the foundational architecture for Eclexia as an Economics-as-Code DSL. Key achievements:

1. **Complete Language Core**: Full lexer, parser, and interpreter
2. **Economic Modeling**: Native support for economic concepts (agents, markets, policies)
3. **RSR Silver Compliance**: Comprehensive governance and community health
4. **Zero npm Dependencies**: Pure Deno implementation using JSR packages
5. **Educational Focus**: Designed for teaching and learning economics

The 0.1.0 release focuses on correctness and completeness rather than performance. Future releases will add optimizations, tooling, and advanced features.

### Migration Guide

- N/A (initial release)

### Upgrade Path

- N/A (initial release)

## Version History

| Version | Date       | Focus              | LOC Added |
|---------|------------|--------------------|-----------|
| 0.1.0   | 2025-11-22 | Foundation Release | ~3,500    |

## Semantic Versioning

Given a version number MAJOR.MINOR.PATCH:

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality (backwards-compatible)
- **PATCH**: Bug fixes (backwards-compatible)

Additional labels:
- **-alpha.X**: Pre-release alpha versions
- **-beta.X**: Pre-release beta versions
- **-rc.X**: Release candidates

## How to Read This Changelog

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes (marked with [SECURITY] prefix)

## Links

- [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Eclexia Repository](https://github.com/Hyperpolymath/eclexia-playground)
- [Release Notes](https://github.com/Hyperpolymath/eclexia-playground/releases)

---

For detailed commit history, see: https://github.com/Hyperpolymath/eclexia-playground/commits/main
