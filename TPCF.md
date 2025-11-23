# Tri-Perimeter Contribution Framework (TPCF)

## Framework Overview

The **Tri-Perimeter Contribution Framework (TPCF)** defines three distinct contribution models for open source projects, each with different levels of openness and governance.

**Eclexia Project Status**: **Perimeter 3** (Open Contribution Model)

## TPCF Perimeter Levels

### Perimeter 1: Core Team Only

- **Access**: Restricted to designated core maintainers
- **Contributions**: Internal only, no external contributors
- **Visibility**: May be private or public (read-only)
- **Governance**: Centralized decision-making
- **Use Case**: Early-stage projects, security-critical components

**Status**: ❌ Not applicable to Eclexia

### Perimeter 2: Curated Contribution

- **Access**: Invitation-only contributors
- **Contributions**: External contributions by invitation
- **Visibility**: Public repository
- **Governance**: Core team approves contributors
- **Use Case**: Projects requiring expertise vetting, specialized domains

**Status**: ❌ Not applicable to Eclexia

### Perimeter 3: Open Contribution ✅

- **Access**: Public, anyone can contribute
- **Contributions**: Open pull request model
- **Visibility**: Fully public
- **Governance**: Maintainer review and merge
- **Use Case**: Community-driven projects, educational tools

**Status**: ✅ **Current model for Eclexia**

## Eclexia's TPCF Perimeter 3 Implementation

### Contribution Process

1. **Anyone can contribute** - No invitation required
2. **Fork and pull request** - Standard GitHub workflow
3. **Public discussion** - All decisions discussed publicly
4. **Maintainer review** - PRs reviewed by maintainers
5. **Community input** - Major decisions involve community feedback
6. **Transparent governance** - Decision process documented

### How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick Start**:

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/eclexia-playground.git

# 3. Create a feature branch
git checkout -b feature/your-feature

# 4. Make changes and test
deno task test

# 5. Submit pull request
git push origin feature/your-feature
# Then create PR on GitHub
```

### Contribution Types Welcome

- **Code**: Features, bug fixes, refactoring
- **Documentation**: Guides, tutorials, API docs, examples
- **Testing**: Unit tests, integration tests, test coverage
- **Examples**: Economic models, use cases
- **Design**: UI/UX for playground, logos, graphics
- **Community**: Answering questions, helping others
- **Tooling**: Build scripts, CI/CD, development tools
- **Translation**: i18n support (future)

### Review Process

1. **Automated Checks**:
   - Code formatting (deno fmt)
   - Linting (deno lint)
   - Type checking (deno check)
   - Tests (deno test)
   - CI pipeline (GitLab CI)

2. **Maintainer Review**:
   - Code quality assessment
   - Architecture alignment
   - Test coverage verification
   - Documentation completeness
   - Breaking change analysis

3. **Community Feedback**:
   - Public discussion on significant changes
   - RFC process for major features
   - Issue tracking for feature requests

4. **Approval and Merge**:
   - Minimum 1 maintainer approval for minor changes
   - Minimum 2 maintainer approvals for major changes
   - BDFN approval for breaking changes
   - Squash or merge (maintainer discretion)

### Integration Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Review**: Within 7 days
- **Feedback Cycle**: Ongoing until approved
- **Merge Decision**: Within 14 days for standard PRs

## Perimeter Transitions

### Moving Between Perimeters

Projects may transition between perimeters as they evolve:

- **Perimeter 1 → 2**: Invite trusted external contributors
- **Perimeter 2 → 3**: Open to public contributions
- **Perimeter 3 → 2**: Restrict to curated contributors (rare)
- **Perimeter 2 → 1**: Return to core team only (rare)

### Eclexia's Perimeter Path

```
Start: Perimeter 3 (Open Contribution) ✅
│
└─→ Current: Perimeter 3 maintained indefinitely
    - Educational mission requires open access
    - Community-driven development
    - Transparent governance
```

**Commitment**: Eclexia will remain Perimeter 3 as part of its educational mission.

## Rationale for Perimeter 3

### Why Open Contribution?

1. **Educational Mission**: Making economics accessible requires community input
2. **Diverse Perspectives**: Economic modeling benefits from varied viewpoints
3. **Learning Opportunity**: Contributors learn by contributing
4. **Transparency**: Open source principles align with educational goals
5. **Community Building**: Foster a supportive learning community
6. **Innovation**: Best ideas come from anywhere
7. **Trust**: Openness builds trust in educational tools

### Benefits

- **Faster Development**: More contributors = faster progress
- **Better Quality**: More eyes find more bugs
- **Broader Use Cases**: Community contributes real-world examples
- **Sustainability**: Distributed maintenance reduces bus factor
- **Learning**: Contributors gain practical experience
- **Network Effects**: Community attracts more community

### Challenges and Mitigations

| Challenge | Mitigation |
|-----------|------------|
| Quality control | Automated CI/CD, maintainer review, strict testing |
| Spam/noise | Code of Conduct, moderation, clear guidelines |
| Scope creep | Roadmap, RFC process, maintainer discretion |
| Security | CVD process, security review, dependency audits |
| Burnout | Multiple maintainers, sustainable pace, boundaries |

## Governance Alignment

### TPCF + BDFN Governance

Eclexia combines:

- **TPCF Perimeter 3**: Open contribution model
- **BDFN**: Benevolent Dictator For Now (see [MAINTAINERS.md](MAINTAINERS.md))

This combination provides:

- **Openness**: Anyone can contribute (Perimeter 3)
- **Direction**: Clear decision-making (BDFN)
- **Flexibility**: Can evolve as project grows
- **Transparency**: Public governance process

### Decision Authority

```
┌─────────────────────────────────────────┐
│        Community Contributions          │
│   (Anyone can propose via PR/Issue)     │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       Maintainer Review/Discussion      │
│    (Technical assessment, alignment)    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          BDFN Final Decision            │
│     (Strategic, breaking changes)       │
└─────────────────────────────────────────┘
```

## Community Guidelines

### Expected Behavior

- **Respect**: Value all contributions, regardless of size
- **Constructive**: Provide helpful, actionable feedback
- **Patient**: Remember contributors have varying experience levels
- **Inclusive**: Welcome diverse perspectives and backgrounds
- **Collaborative**: Work together toward shared goals

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for complete guidelines.

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Pull Requests**: Code contributions
- **Email**: For private matters (see MAINTAINERS.md)

## Recognition

### Contributor Recognition

- **GitHub Contributors Graph**: Automatic recognition
- **CHANGELOG.md**: Contributors listed in release notes
- **CONTRIBUTORS.md**: Comprehensive contributor list
- **Public Thanks**: Acknowledgment in project updates

### Paths to Maintainer

Open contribution (Perimeter 3) provides a path to becoming a maintainer:

1. **Contribute consistently** (6+ months)
2. **Demonstrate technical skill**
3. **Engage constructively** with community
4. **Review others' PRs**
5. **Align with project values**

See [MAINTAINERS.md](MAINTAINERS.md) for complete criteria.

## Frequently Asked Questions

### Q: Do I need permission to contribute?

**A**: No! Perimeter 3 means anyone can fork and submit pull requests.

### Q: How do I get started?

**A**: See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide.

### Q: What if my PR is rejected?

**A**: Feedback explains why. You can revise and resubmit or discuss alternatives.

### Q: Can I suggest major changes?

**A**: Yes! Open a GitHub Discussion first to gather feedback before implementing.

### Q: How long until my PR is reviewed?

**A**: Initial review within 7 days. Complex PRs may take longer.

### Q: What if I disagree with a decision?

**A**: Discuss in the PR/issue. BDFN makes final call, but all input is valued.

## TPCF Resources

- **TPCF Specification**: (Link to TPCF documentation)
- **Eclexia Governance**: [MAINTAINERS.md](MAINTAINERS.md)
- **Contribution Guide**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Updates to This Framework

This TPCF implementation may be updated by project maintainers. Major changes will be announced with a 30-day community comment period.

**Last Updated**: 2025-11-22
**Version**: 1.0
**Perimeter**: 3 (Open Contribution)

---

**Thank you for being part of the Eclexia open contribution community!**

We're excited to work with contributors from around the world to make economics more accessible through code.
