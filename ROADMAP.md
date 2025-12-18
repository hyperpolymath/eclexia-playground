# Eclexia Roadmap

**Last Updated**: 2025-12-17
**Current Version**: 0.1.0
**RSR Level**: Silver (achieved 2025-11-22)

---

## Executive Summary

This roadmap outlines the development priorities for Eclexia, an Economics-as-Code DSL. It covers immediate security improvements, technical debt from the ReScript 12 upgrade, and feature development goals.

---

## Immediate Priorities (Q1 2026)

### 1. Security Hardening

#### GitHub Actions SHA Pinning
**Status**: In Progress
**Priority**: Critical
**Impact**: Supply Chain Security

All GitHub Actions should be pinned to full SHA commits to prevent supply chain attacks (see [tj-actions incident](https://www.stepsecurity.io/blog/pinning-github-actions-for-enhanced-security-a-complete-guide)).

**Workflows requiring updates**:
- [ ] `.github/workflows/ci.yml` - Replace `@v6` tags with SHA pins
- [ ] `.github/workflows/scorecard.yml` - Pin `ossf/scorecard-action`
- [ ] `.github/workflows/quality.yml` - Pin `trufflesecurity/trufflehog`
- [ ] `.github/workflows/rescript-deno-ci.yml` - Pin `denoland/setup-deno`
- [ ] `.github/workflows/generator-generic-ossf-slsa3-publish.yml` - Pin SLSA actions

**Example pinning format**:
```yaml
# Before (vulnerable)
- uses: actions/checkout@v4

# After (secure)
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

**Recommended approach**: Use [Renovate](https://docs.renovatebot.com/) or [pinact](https://github.com/suzuki-shunsuke/pinact) for automated SHA pinning and updates.

#### SPDX License Headers
**Status**: Partial
**Priority**: High

Add SPDX headers to all workflow files per RSR compliance:
```yaml
# SPDX-License-Identifier: MIT OR AGPL-3.0-or-later
```

**Files requiring headers**:
- `.github/workflows/ci.yml`
- `.github/workflows/scorecard.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/rescript-deno-ci.yml`
- `.github/workflows/npm-bun-blocker.yml`
- `.github/workflows/ts-blocker.yml`
- `.github/workflows/guix-nix-policy.yml`
- `.github/workflows/jekyll-gh-pages.yml`
- `.github/workflows/mirror.yml`

#### Permissions Hardening
**Status**: Partial
**Priority**: High

Ensure all workflows have explicit `permissions: read-all` at workflow level, with specific permissions granted only at job level.

---

### 2. ReScript 12 Migration

**Status**: In Progress
**Priority**: High

The project upgraded to ReScript 12.0.1, which introduced breaking API changes.

#### Completed Fixes
- [x] `String.charCodeAt` now returns `option<int>` - Fixed in `Lexer.res`
- [x] `Array.findIndex` now returns `int` (-1 if not found) - Fixed in `Runtime.res`
- [x] Array indexing now returns `option<T>` - Fixed in `Runtime.res`
- [x] `mod_float` deprecated, use `Float.mod` - Fixed in `Runtime.res`
- [x] Empty `if` blocks not allowed - Fixed in `Parser.res`
- [x] Renamed `Stdlib.res` to `EclexiaStdlib.res` (avoid reserved name conflict)

#### Pending Fixes
- [ ] `EclexiaStdlib.res` - Full ReScript 12 compatibility:
  - `Float.abs` → `Math.abs`
  - `Float.floor` → `Math.floor`
  - `Float.ceil` → `Math.ceil`
  - `Float.round` → `Math.round`
  - `Float.Constants.pi` → `Math.Constants.pi`
  - `Float.Constants.e` → `Math.Constants.e`
  - Array element access needs option handling
- [ ] Resolve circular dependency between `Runtime` and `EclexiaStdlib`
- [ ] Update `bsconfig.json` deprecated fields (already done):
  - `bs-dependencies` → `dependencies`
  - `bsc-flags` → `compiler-flags`
  - Remove unsupported `version` field

#### Configuration Updates
```json
// bsconfig.json - Updated for ReScript 12
{
  "name": "@hyperpolymath/eclexia",
  "sources": [{"dir": "src", "subdirs": true}],
  "package-specs": [{"module": "es6", "in-source": true}],
  "suffix": ".js",
  "dependencies": [],
  "warnings": {"error": "+101"},
  "compiler-flags": ["-bs-no-version-header"]
}
```

---

## Short-Term Goals (Q2 2026)

### 3. Language Features

#### WASM Compilation Target
**Status**: Planned
**Priority**: Medium

Enable compilation of Eclexia programs to WebAssembly for:
- Browser execution without JavaScript runtime
- Embedded use in economic simulation tools
- Performance-critical calculations

#### Language Server Protocol (LSP)
**Status**: Planned
**Priority**: Medium

Implement LSP for IDE support:
- Syntax highlighting
- Auto-completion
- Go-to-definition
- Hover documentation
- Error diagnostics

### 4. Developer Experience

#### Interactive Tutorial System
**Status**: Planned
**Priority**: Medium

Web-based interactive tutorials teaching economics concepts through Eclexia:
- Supply and demand modeling
- Market equilibrium
- Time value of money
- Risk and utility theory

#### Advanced Debugger
**Status**: Planned
**Priority**: Low

Time-travel debugging for economic simulations:
- Step forward/backward through model execution
- Inspect agent states at any point
- Visualize market dynamics

---

## Long-Term Goals (2026+)

### 5. RSR Gold Level

**Target**: Q3 2026

Requirements for Gold Level:
- [ ] Automated dependency scanning (enabled)
- [ ] Regular security audits
- [ ] Active vulnerability disclosure program
- [ ] Signed commits and releases
- [ ] Funding model documented
- [ ] Multiple active maintainers (bus factor > 2)
- [ ] Succession planning
- [ ] 1.0 release with stable API commitment
- [ ] LTS version support
- [ ] Production usage examples
- [ ] Performance benchmarks tracked over time
- [ ] Reproducible builds

### 6. Ecosystem Growth

- [ ] Plugin architecture for custom economic models
- [ ] Integration with economic data APIs
- [ ] Visualization library for model outputs
- [ ] Academic use cases and publications
- [ ] Community contribution program

---

## Security Considerations

### Current Security Status

| Area | Status | Notes |
|------|--------|-------|
| RFC 9116 (security.txt) | ✅ Compliant | Expires 2026-11-20 |
| Dependency scanning | ✅ Active | Dependabot + Trivy |
| CodeQL analysis | ✅ Active | JavaScript/TypeScript |
| OSSF Scorecard | ✅ Active | Weekly scans |
| Secret scanning | ✅ Active | TruffleHog |
| SHA pinning | ⚠️ Partial | Requires updates |
| SPDX headers | ⚠️ Partial | Some workflows missing |

### Security.txt Renewal

The security.txt file expires on **2026-11-20**. Set a reminder to renew before expiration.

---

## Version History

| Version | Date | Focus |
|---------|------|-------|
| 0.1.0 | 2025-11-22 | Foundation Release |
| 0.2.0 | TBD | WASM compilation, security hardening |
| 0.3.0 | TBD | LSP implementation |
| 1.0.0 | TBD | Stable API, production ready |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved. Priority areas:
1. ReScript 12 migration fixes
2. Security workflow improvements
3. Documentation
4. Test coverage

---

## References

- [RSR Framework](RSR_AUDIT.md) - Compliance tracking
- [SECURITY.md](SECURITY.md) - Security policy
- [CHANGELOG.md](CHANGELOG.md) - Release history
- [TPCF.md](TPCF.md) - Contribution framework
- [GitHub Actions Security Best Practices](https://www.stepsecurity.io/blog/pinning-github-actions-for-enhanced-security-a-complete-guide)
