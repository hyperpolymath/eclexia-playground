/**
 * Standard library tests
 */

import { assertEquals } from "@std/assert";
import { run } from "../src/api.ts";

// Note: These tests check that stdlib functions execute without errors
// In a full implementation, we'd capture and verify return values

Deno.test("Stdlib: abs function", () => {
  const { errors } = run("const result = abs(-5)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: sqrt function", () => {
  const { errors } = run("const result = sqrt(16)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: pow function", () => {
  const { errors } = run("const result = pow(2, 8)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: min function with arguments", () => {
  const { errors } = run("const result = min(5, 3, 8, 1)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: max function with arguments", () => {
  const { errors } = run("const result = max(5, 3, 8, 1)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: sum array function", () => {
  const { errors } = run("const total = sum([1, 2, 3, 4, 5])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: mean function", () => {
  const { errors } = run("const avg = mean([1, 2, 3, 4, 5])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: median function", () => {
  const { errors } = run("const mid = median([1, 2, 3, 4, 5])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: variance function", () => {
  const { errors } = run("const variance = variance([1, 2, 3, 4, 5])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: stddev function", () => {
  const { errors } = run("const sd = stddev([1, 2, 3, 4, 5])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: presentValue function", () => {
  const { errors } = run("const pv = presentValue(1000, 0.05, 10)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: futureValue function", () => {
  const { errors } = run("const fv = futureValue(1000, 0.05, 10)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: npv function", () => {
  const { errors } = run(`
    const cashFlows = [-1000, 300, 400, 500]
    const npv_result = npv(0.1, cashFlows)
  `);
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: irr function", () => {
  const { errors } = run(`
    const cashFlows = [-1000, 300, 400, 500, 400]
    const irr_result = irr(cashFlows)
  `);
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: compoundInterest function", () => {
  const { errors } = run("const amount = compoundInterest(1000, 0.05, 10, 12)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: logarithmicUtility function", () => {
  const { errors } = run("const utility = logarithmicUtility(1000)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: powerUtility function", () => {
  const { errors } = run("const utility = powerUtility(1000, 0.5)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: priceElasticity function", () => {
  const { errors } = run("const elasticity = priceElasticity(100, 90, 10, 12)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: length function with array", () => {
  const { errors } = run("const len = length([1, 2, 3])");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: length function with string", () => {
  const { errors } = run('const len = length("hello")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: toLowerCase function", () => {
  const { errors } = run('const lower = toLowerCase("HELLO")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: toUpperCase function", () => {
  const { errors } = run('const upper = toUpperCase("hello")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: substring function", () => {
  const { errors } = run('const sub = substring("hello world", 0, 5)');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: split function", () => {
  const { errors } = run('const parts = split("a,b,c", ",")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: join function", () => {
  const { errors } = run('const str = join(["a", "b", "c"], ",")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: toString function", () => {
  const { errors } = run("const str = toString(42)");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: toNumber function", () => {
  const { errors } = run('const num = toNumber("42")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: print function", () => {
  const { errors } = run('print("Hello, World!")');
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: PI constant", () => {
  const { errors } = run("const pi = PI");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: E constant", () => {
  const { errors } = run("const e = E");
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: trigonometric functions", () => {
  const { errors } = run(`
    const s = sin(PI / 2)
    const c = cos(0)
    const t = tan(PI / 4)
  `);
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: floor, ceil, round", () => {
  const { errors } = run(`
    const f = floor(3.7)
    const c = ceil(3.2)
    const r = round(3.5)
  `);
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: log and exp", () => {
  const { errors } = run(`
    const l = log(E)
    const ex = exp(1)
  `);
  assertEquals(errors.length, 0);
});

Deno.test("Stdlib: random function", () => {
  const { errors } = run("const r = random()");
  assertEquals(errors.length, 0);
});
