/**
 * Parser tests
 */

import { assertEquals, assertThrows } from "@std/assert";
import { tokenize } from "../src/lexer/mod.ts";
import { parse } from "../src/parser/mod.ts";
import { SyntaxError } from "../src/types.ts";
import type {
  BinaryExpression,
  CallExpression,
  ConstDeclaration,
  FunctionDeclaration,
  Identifier,
  Literal,
} from "../src/types.ts";

Deno.test("Parser: parses number literal", () => {
  const tokens = tokenize("42");
  const ast = parse(tokens);

  assertEquals(ast.type, "Program");
  assertEquals(ast.declarations.length, 0);
});

Deno.test("Parser: parses const declaration with number", () => {
  const tokens = tokenize("const x = 42");
  const ast = parse(tokens);

  assertEquals(ast.declarations.length, 1);
  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.type, "ConstDeclaration");
  assertEquals(decl.name, "x");
  assertEquals((decl.value as Literal).value, 42);
});

Deno.test("Parser: parses const declaration with type annotation", () => {
  const tokens = tokenize("const x: number = 42");
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.valueType?.type, "PrimitiveType");
});

Deno.test("Parser: parses binary expression", () => {
  const tokens = tokenize("const result = 10 + 20");
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  const expr = decl.value as BinaryExpression;

  assertEquals(expr.type, "BinaryExpression");
  assertEquals(expr.operator, "+");
  assertEquals((expr.left as Literal).value, 10);
  assertEquals((expr.right as Literal).value, 20);
});

Deno.test("Parser: respects operator precedence", () => {
  const tokens = tokenize("const result = 2 + 3 * 4");
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  const add = decl.value as BinaryExpression;

  assertEquals(add.operator, "+");
  assertEquals((add.left as Literal).value, 2);

  const mul = add.right as BinaryExpression;
  assertEquals(mul.operator, "*");
  assertEquals((mul.left as Literal).value, 3);
  assertEquals((mul.right as Literal).value, 4);
});

Deno.test("Parser: parses function declaration", () => {
  const source = `
    function add(x: number, y: number) -> number {
      return x + y;
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as FunctionDeclaration;
  assertEquals(decl.type, "FunctionDeclaration");
  assertEquals(decl.name, "add");
  assertEquals(decl.parameters.length, 2);
  assertEquals(decl.parameters[0].name, "x");
  assertEquals(decl.parameters[1].name, "y");
  assertEquals(decl.returnType?.type, "PrimitiveType");
});

Deno.test("Parser: parses agent declaration", () => {
  const source = `
    agent Consumer {
      wealth: number;
      utility: number;
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  assertEquals(ast.declarations[0].type, "AgentDeclaration");
  assertEquals((ast.declarations[0] as any).name, "Consumer");
  assertEquals((ast.declarations[0] as any).properties.length, 2);
});

Deno.test("Parser: parses good declaration", () => {
  const source = `
    good Apple fungible divisible {
      quality: number;
      price: currency;
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as any;
  assertEquals(decl.type, "GoodDeclaration");
  assertEquals(decl.name, "Apple");
  assertEquals(decl.fungible, true);
  assertEquals(decl.divisible, true);
});

Deno.test("Parser: parses array expression", () => {
  const tokens = tokenize("const arr = [1, 2, 3]");
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "ArrayExpression");
  assertEquals((decl.value as any).elements.length, 3);
});

Deno.test("Parser: parses object expression", () => {
  const source = "const obj = { x: 10, y: 20 }";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "ObjectExpression");
  assertEquals((decl.value as any).properties.length, 2);
});

Deno.test("Parser: parses lambda expression", () => {
  const source = "const fn = (x: number, y: number) => x + y";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "LambdaExpression");
});

Deno.test("Parser: parses call expression", () => {
  const source = "const result = add(10, 20)";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  const call = decl.value as CallExpression;

  assertEquals(call.type, "CallExpression");
  assertEquals((call.callee as Identifier).name, "add");
  assertEquals(call.args.length, 2);
});

Deno.test("Parser: parses member expression", () => {
  const source = "const value = obj.property";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "MemberExpression");
});

Deno.test("Parser: parses conditional expression", () => {
  const source = "const result = x > 0 ? x : -x";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "ConditionalExpression");
});

Deno.test("Parser: parses range expression", () => {
  const source = "const range = 1..10";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "RangeExpression");
  assertEquals((decl.value as any).inclusive, false);
});

Deno.test("Parser: parses inclusive range expression", () => {
  const source = "const range = 1...10";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "RangeExpression");
  assertEquals((decl.value as any).inclusive, true);
});

Deno.test("Parser: parses array comprehension", () => {
  const source = "const squares = [x * x for x in 1..10]";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "ComprehensionExpression");
});

Deno.test("Parser: parses currency expression", () => {
  const source = "const price = 100USD";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as ConstDeclaration;
  assertEquals(decl.value.type, "CurrencyExpression");
  assertEquals((decl.value as any).currency, "USD");
});

Deno.test("Parser: parses if statement", () => {
  const source = `
    function test() -> number {
      if x > 0 {
        return x;
      } else {
        return -x;
      }
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as FunctionDeclaration;
  assertEquals(decl.body[0].type, "IfStatement");
});

Deno.test("Parser: parses for loop", () => {
  const source = `
    function sum(arr: []number) -> number {
      for item in arr {
        return item;
      }
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as FunctionDeclaration;
  assertEquals(decl.body[0].type, "ForStatement");
});

Deno.test("Parser: parses while loop", () => {
  const source = `
    function loop() -> number {
      while true {
        return 42;
      }
    }
  `;

  const tokens = tokenize(source);
  const ast = parse(tokens);

  const decl = ast.declarations[0] as FunctionDeclaration;
  assertEquals(decl.body[0].type, "WhileStatement");
});

Deno.test("Parser: parses import declaration", () => {
  const source = 'import { add, subtract } from "math"';
  const tokens = tokenize(source);
  const ast = parse(tokens);

  assertEquals(ast.imports.length, 1);
  assertEquals(ast.imports[0].items, ["add", "subtract"]);
  assertEquals(ast.imports[0].from, "math");
});

Deno.test("Parser: parses export declaration", () => {
  const source = "export const PI = 3.14159";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  assertEquals(ast.exports.length, 1);
  assertEquals(ast.exports[0].declaration?.type, "ConstDeclaration");
});

Deno.test("Parser: throws on unexpected token", () => {
  const tokens = tokenize("const = 42");

  assertThrows(
    () => parse(tokens),
    SyntaxError,
  );
});

Deno.test("Parser: throws on missing semicolon in strict contexts", () => {
  // Note: our parser is semi-colon optional, so this test might need adjustment
  const tokens = tokenize("const x = 42 const y = 10");

  assertThrows(
    () => parse(tokens),
    SyntaxError,
  );
});

Deno.test("Parser: handles complex nested expressions", () => {
  const source = "const result = ((a + b) * c) / (d - e)";
  const tokens = tokenize(source);
  const ast = parse(tokens);

  // Just verify it parses without error
  assertEquals(ast.declarations.length, 1);
  assertEquals(ast.declarations[0].type, "ConstDeclaration");
});
