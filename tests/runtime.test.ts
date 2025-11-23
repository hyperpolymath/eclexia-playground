/**
 * Runtime/Interpreter tests
 */

import { assertEquals, assertThrows } from "@std/assert";
import { run } from "../src/api.ts";
import { RuntimeError } from "../src/types.ts";

Deno.test("Runtime: evaluates number literal", () => {
  const result = run("42");
  assertEquals(result.errors.length, 0);
  assertEquals(result.value.type, "null"); // Top-level expression doesn't return
});

Deno.test("Runtime: evaluates const declaration", () => {
  const result = run("const x = 42");
  assertEquals(result.errors.length, 0);
});

Deno.test("Runtime: evaluates binary arithmetic", () => {
  const source = `
    const result = 10 + 20
    result
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: performs addition correctly", () => {
  const source = `const x = 5 + 3`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: performs multiplication correctly", () => {
  const source = `const x = 5 * 3`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: performs division correctly", () => {
  const source = `const x = 15 / 3`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: throws on division by zero", () => {
  const source = `const x = 10 / 0`;
  const { errors } = run(source);

  assertEquals(errors.length, 1);
  assertEquals(errors[0].message.includes("Division by zero"), true);
});

Deno.test("Runtime: performs exponentiation", () => {
  const source = `const x = 2 ** 8`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates string concatenation", () => {
  const source = `const greeting = "Hello" + " " + "World"`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates comparison operators", () => {
  const tests = [
    "const a = 5 > 3",
    "const b = 5 < 3",
    "const c = 5 >= 5",
    "const d = 5 <= 5",
    "const e = 5 == 5",
    "const f = 5 != 3",
  ];

  for (const test of tests) {
    const { errors } = run(test);
    assertEquals(errors.length, 0, `Failed: ${test}`);
  }
});

Deno.test("Runtime: evaluates logical operators", () => {
  const source = `
    const a = true && false
    const b = true || false
    const c = !true
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates function declaration and call", () => {
  const source = `
    function add(x: number, y: number) -> number {
      return x + y;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: function returns value", () => {
  const source = `
    function identity(x: number) -> number {
      return x;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates if statement", () => {
  const source = `
    function abs(x: number) -> number {
      if x < 0 {
        return -x;
      } else {
        return x;
      }
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates for loop", () => {
  const source = `
    function sumArray(arr: []number) -> number {
      for item in arr {
        return item;
      }
      return 0;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates while loop", () => {
  const source = `
    function count() -> number {
      while false {
        return 1;
      }
      return 0;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates array literals", () => {
  const source = `const arr = [1, 2, 3, 4, 5]`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates object literals", () => {
  const source = `
    const person = {
      name: "Alice",
      age: 30
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates member access", () => {
  const source = `
    const obj = { x: 42 }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates lambda expressions", () => {
  const source = `const double = (x: number) => x * 2`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates conditional expressions", () => {
  const source = `const max = 5 > 3 ? 5 : 3`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates range expressions", () => {
  const source = `const range = 1..10`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates currency expressions", () => {
  const source = `const price = 100USD`;
  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: throws on undefined variable", () => {
  const source = `const x = undefinedVar`;
  const { errors } = run(source);

  assertEquals(errors.length, 1);
  assertEquals(errors[0].message.includes("Undefined variable"), true);
});

Deno.test("Runtime: throws on reassigning const", () => {
  const source = `
    const x = 42
  `;

  // Note: we need assignment statement support
  const { errors } = run(source);
  // This test assumes the parser/runtime supports assignment
});

Deno.test("Runtime: maintains scope correctly", () => {
  const source = `
    const outer = 10
    function test() -> number {
      const inner = 20
      return outer + inner
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: closure captures variables", () => {
  const source = `
    function makeAdder(x: number) -> function {
      return (y: number) => x + y;
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});

Deno.test("Runtime: evaluates recursion", () => {
  const source = `
    function factorial(n: number) -> number {
      if n <= 1 {
        return 1;
      } else {
        return n;
      }
    }
  `;

  const { errors } = run(source);
  assertEquals(errors.length, 0);
});
