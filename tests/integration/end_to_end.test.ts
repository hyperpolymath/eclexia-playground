/**
 * End-to-end integration tests
 * Tests complete programs from parsing to execution
 */

import { assertEquals } from "@std/assert";
import { run } from "../../src/api.ts";

Deno.test("E2E: Simple arithmetic program", () => {
  const source = `
    const a = 10
    const b = 20
    const sum = a + b
    const product = a * b
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Function definition and usage", () => {
  const source = `
    function square(x: number) -> number {
      return x * x;
    }

    const result = square(5);
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Conditional logic", () => {
  const source = `
    function max(a: number, b: number) -> number {
      if a > b {
        return a;
      } else {
        return b;
      }
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Array operations", () => {
  const source = `
    const numbers = [1, 2, 3, 4, 5]
    const total = sum(numbers)
    const average = mean(numbers)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Object manipulation", () => {
  const source = `
    const person = {
      name: "Alice",
      age: 30,
      city: "NYC"
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Lambda expressions", () => {
  const source = `
    const double = (x: number) => x * 2
    const triple = (x: number) => x * 3
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Economic calculation - present value", () => {
  const source = `
    const futureAmount = 10000
    const discountRate = 0.05
    const years = 10

    const pv = presentValue(futureAmount, discountRate, years)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Economic calculation - NPV", () => {
  const source = `
    const initialInvestment = -50000
    const cashFlows = [initialInvestment, 15000, 20000, 25000, 30000]
    const discountRate = 0.1

    const netPresentValue = npv(discountRate, cashFlows)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Statistical analysis", () => {
  const source = `
    const data = [10, 20, 30, 40, 50]

    const average = mean(data)
    const middle = median(data)
    const spread = stddev(data)
    const minimum = min(data)
    const maximum = max(data)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Range and comprehension", () => {
  const source = `
    const range = 1..10
    const squares = [x * x for x in range]
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Currency operations", () => {
  const source = `
    const priceUSD = 100USD
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Agent declaration (basic)", () => {
  const source = `
    agent Consumer {
      wealth: number;
      utility: number;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Good declaration", () => {
  const source = `
    good Apple fungible {
      quality: number;
      price: currency;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Complex nested expressions", () => {
  const source = `
    const result = ((10 + 20) * (30 - 15)) / (5 + 5)
    const comparison = result > 50 && result < 100
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: String operations", () => {
  const source = `
    const greeting = "Hello" + " " + "World"
    const upper = toUpperCase(greeting)
    const lower = toLowerCase(greeting)
    const parts = split(greeting, " ")
    const joined = join(parts, "-")
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Loop constructs", () => {
  const source = `
    function sumRange(n: number) -> number {
      for i in 1..n {
        return i;
      }
      return 0;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Utility function - logarithmic utility", () => {
  const source = `
    const wealth = 10000
    const utility = logarithmicUtility(wealth)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Price elasticity calculation", () => {
  const source = `
    const q1 = 100
    const q2 = 90
    const p1 = 10
    const p2 = 12

    const elasticity = priceElasticity(q1, q2, p1, p2)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("E2E: Compound interest calculation", () => {
  const source = `
    const principal = 1000
    const rate = 0.05
    const time = 10
    const compoundingsPerYear = 12

    const finalAmount = compoundInterest(principal, rate, time, compoundingsPerYear)
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});
