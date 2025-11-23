# Security Policy

## RFC 9116 Compliance

This project follows [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html) for security vulnerability disclosure.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

### Coordinated Vulnerability Disclosure (CVD) Process

We follow a coordinated vulnerability disclosure process to ensure security issues are addressed responsibly.

### How to Report

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, please report security vulnerabilities through one of these channels:

1. **Email**: Send details to `security@eclexia.dev` (if available)
2. **security.txt**: See `.well-known/security.txt` for current contact information
3. **Private Disclosure**: Use GitHub's private vulnerability reporting feature

### What to Include

Please include the following in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact assessment
- Suggested remediation (if known)
- Your contact information for follow-up

### Response Timeline

- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 7 days
- **Status Update**: Every 14 days until resolved
- **Disclosure**: Coordinated with reporter, typically 90 days after fix

### Disclosure Policy

1. **Private Disclosure Period**: 90 days from initial report or fix availability
2. **Coordinated Publication**: Work with reporter on public disclosure timing
3. **Credit**: Security researchers will be credited (unless anonymity requested)
4. **CVE Assignment**: Critical vulnerabilities will receive CVE identifiers

## Security Best Practices

### For Users

- Keep Eclexia updated to the latest stable version
- Review `CHANGELOG.md` for security-related updates
- Follow least-privilege principles in economic model configurations
- Validate all input data to economic models
- Use sandboxed environments for untrusted Eclexia programs

### For Contributors

- Follow secure coding guidelines in `CONTRIBUTING.md`
- Never commit secrets, API keys, or credentials
- Use type-safe practices (TypeScript strict mode enabled)
- Write tests for security-sensitive code
- Review dependencies for known vulnerabilities

## Security Features

Eclexia includes the following security measures:

- **Input Validation**: All parser inputs are validated
- **Type Safety**: TypeScript strict mode enforced
- **Sandboxing**: Runtime execution isolation (planned)
- **No Eval**: No use of `eval()` or similar dynamic code execution
- **Dependency Auditing**: Regular security audits of dependencies

## Security Advisories

Security advisories will be published:

- In this repository's Security Advisories section
- In `CHANGELOG.md` with `[SECURITY]` prefix
- Via project communication channels

## Threat Model

### In Scope

- Code execution vulnerabilities in the parser/interpreter
- Denial of service through malicious Eclexia programs
- Information disclosure through economic model execution
- Dependency vulnerabilities

### Out of Scope

- Social engineering attacks
- Physical security
- Attacks requiring physical access to systems
- Issues in dependencies (report to their respective maintainers)

## Security Testing

We encourage security testing including:

- Static analysis
- Fuzzing of parser/lexer
- Property-based testing
- Penetration testing of example applications

Please conduct testing responsibly and report findings through proper channels.

## Recognition

We maintain a Security Hall of Fame to recognize researchers who responsibly
disclose vulnerabilities. Contributors will be listed in `SECURITY_HALL_OF_FAME.md`
(unless anonymity is requested).

## Contact

- Security Email: `security@eclexia.dev`
- Encrypted Communication: PGP key available in `.well-known/security.txt`
- Security.txt: See `.well-known/security.txt` per RFC 9116

## Updates

This security policy is reviewed and updated quarterly. Last review: 2025-11-22

---

For the most current security contact information, always refer to:
`.well-known/security.txt` (per RFC 9116)
