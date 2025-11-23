# Eclexia - Economics-as-Code DSL

**Economics-as-Code**: A domain-specific language for modeling economic systems, designed for educators, students, and researchers.

[![RSR Silver](https://img.shields.io/badge/RSR-Silver-silver)](./)
[![License](https://img.shields.io/badge/license-MIT%20%2B%20Palimpsest-blue)](LICENSE.txt)
[![Deno](https://img.shields.io/badge/deno-1.40.0+-black)](https://deno.land)

## Features

- 🎯 **Economics-First Design**: Native support for agents, markets, goods, and policies
- 💰 **Economic Types**: Built-in currency, quantity, and time types
- 📊 **Rich Standard Library**: Present value, NPV, IRR, utility functions, elasticity
- 🔒 **Type-Safe**: Full TypeScript implementation with strict mode
- 🚀 **Zero Dependencies**: Pure Deno, no npm packages
- 🧪 **Well-Tested**: 160+ tests with comprehensive coverage
- 📚 **Educational**: Designed for teaching and learning economics
- 🌐 **RSR Silver Compliant**: Professional governance and community health

## Quick Start

### Installation

```bash
# Install Deno if you haven't already
curl -fsSL https://deno.land/install.sh | sh

# Clone the repository
git clone https://github.com/Hyperpolymath/eclexia-playground.git
cd eclexia-playground

# Run tests to verify installation
deno task test
```

### Your First Eclexia Program

Create `hello.ecx`:

```eclexia
// Calculate present value
const futureValue = 10000
const discountRate = 0.05
const years = 10

const pv = presentValue(futureValue, discountRate, years)
print("Present Value:", pv)
```

Run it:

```bash
deno run --allow-read src/cli/main.ts hello.ecx
```

### Interactive REPL

```bash
deno task repl
```

```
eclexia> const x = 100USD
eclexia> const y = presentValue(1000, 0.05, 10)
eclexia> print(y)
613.91
```

## Language Features

### Economics-Specific Types

```eclexia
// Currency
const price = 100USD
const cost = 50EUR

// Quantity with units
const weight = 10kg
const distance = 5miles

// Time
const duration = 30days
const period = 5years
```

### Agent-Based Modeling

```eclexia
agent Consumer {
  wealth: number;
  utility: number;

  behavior buy(price: currency, quantity: number) {
    wealth = wealth - price * quantity;
    utility = logarithmicUtility(wealth);
  }
}

agent Producer {
  inventory: number;
  revenue: currency;

  behavior sell(price: currency, quantity: number) {
    inventory = inventory - quantity;
    revenue = revenue + price * quantity;
  }
}
```

### Goods and Markets

```eclexia
good Apple fungible divisible {
  quality: number;
  price: currency;
}

market FruitMarket {
  goods: [Apple];
  mechanism: double-auction;
  rule: price > 0;
}
```

### Economic Functions

```eclexia
// Time value of money
const pv = presentValue(1000, 0.05, 10)
const fv = futureValue(1000, 0.05, 10)

// Investment analysis
const cashFlows = [-1000, 300, 400, 500]
const netPresentValue = npv(0.1, cashFlows)
const internalRate = irr(cashFlows)

// Utility theory
const utility = logarithmicUtility(1000)
const powerUtil = powerUtility(1000, 0.5)

// Elasticity
const elasticity = priceElasticity(100, 90, 10, 12)
```

## Examples

See the `examples/` directory for complete programs:

- [Simple Market](examples/01_simple_market.ecx) - Basic supply and demand
- [Present Value](examples/02_present_value.ecx) - Time value of money
- [NPV Analysis](examples/03_npv_analysis.ecx) - Investment decisions
- [Utility Theory](examples/04_utility_theory.ecx) - Risk preferences
- [Elasticity](examples/05_elasticity.ecx) - Price responsiveness
- [Statistics](examples/06_statistics.ecx) - Economic data analysis
- [Compound Interest](examples/07_compound_interest.ecx) - Growth modeling
- [Portfolio Returns](examples/08_portfolio_return.ecx) - Asset allocation

Run all examples:

```bash
just examples
```

## Documentation

- [Language Tutorial](docs/tutorial.md) - Step-by-step introduction
- [Language Reference](docs/reference.md) - Complete syntax guide
- [Standard Library](docs/stdlib.md) - All built-in functions
- [Economics Guide](docs/economics.md) - Economic modeling patterns
- [API Documentation](docs/api/) - Generated from source

## Development

### Prerequisites

- Deno 1.40.0 or higher
- Git

### Development Commands

```bash
# Run in development mode
just dev

# Run tests
just test

# Run tests in watch mode
just test-watch

# Lint code
just lint

# Format code
just fmt

# Type-check
just check

# Run full CI pipeline
just ci
```

### Project Structure

```
eclexia-playground/
├── src/
│   ├── lexer/          # Tokenization
│   ├── parser/         # AST generation
│   ├── runtime/        # Interpreter & execution
│   ├── cli/            # Command-line interface
│   └── types.ts        # Core type definitions
├── tests/              # Test suites
├── examples/           # Example programs
├── docs/               # Documentation
└── .well-known/        # RFC-compliant metadata
```

## Architecture

```
Source Code (.ecx)
    ↓
Lexer (tokenization)
    ↓
Parser (AST generation)
    ↓
Interpreter (execution)
    ↓
Result
```

## Contributing

We welcome contributions! Eclexia follows the **TPCF Perimeter 3** (Open Contribution) model.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Fork the repository
3. Create a feature branch
4. Make your changes with tests
5. Submit a pull request

See also:
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Framework](TPCF.md)
- [Maintainers](MAINTAINERS.md)

## License

Dual-licensed under:
- [MIT License](LICENSE.txt)
- [Palimpsest License v0.8](LICENSE.txt)

Choose the license that best fits your use case.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and vulnerability reporting process.

We follow [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html) with coordinated vulnerability disclosure.

## Roadmap

### v0.2.0 (Planned)
- WASM compilation target
- Performance optimizations
- Enhanced error messages
- More economics examples

### v0.3.0 (Planned)
- Language Server Protocol (LSP)
- VS Code extension
- Debugger with time-travel
- Web playground

### v1.0.0 (Future)
- Stable API
- Production-ready
- Comprehensive stdlib
- Multi-language support

## Community

- **Discussions**: [GitHub Discussions](https://github.com/Hyperpolymath/eclexia-playground/discussions)
- **Issues**: [GitHub Issues](https://github.com/Hyperpolymath/eclexia-playground/issues)
- **Email**: hello@eclexia.dev

## Acknowledgments

- Inspired by economics education and agent-based modeling
- Built with [Deno](https://deno.land)
- Follows RSR framework for responsible software development

## Citation

If you use Eclexia in academic work, please cite:

```bibtex
@software{eclexia2025,
  title = {Eclexia: Economics-as-Code Domain-Specific Language},
  author = {Eclexia Contributors},
  year = {2025},
  url = {https://github.com/Hyperpolymath/eclexia-playground}
}
```

---

**Made with ❤️ for economics education**

*Eclexia makes economic modeling accessible through code*
