/**
 * Lexer tests
 */

import { assertEquals, assertThrows } from "@std/assert";
import { tokenize, TokenType } from "../src/lexer/mod.ts";
import { SyntaxError } from "../src/types.ts";

Deno.test("Lexer: tokenizes number literals", () => {
  const tokens = tokenize("42");
  assertEquals(tokens.length, 2); // number + EOF
  assertEquals(tokens[0].type, TokenType.NUMBER);
  assertEquals(tokens[0].value, "42");
  assertEquals(tokens[0].literal, 42);
});

Deno.test("Lexer: tokenizes floating point numbers", () => {
  const tokens = tokenize("3.14159");
  assertEquals(tokens[0].type, TokenType.NUMBER);
  assertEquals(tokens[0].literal, 3.14159);
});

Deno.test("Lexer: tokenizes scientific notation", () => {
  const tokens = tokenize("1.5e-10");
  assertEquals(tokens[0].type, TokenType.NUMBER);
  assertEquals(tokens[0].literal, 1.5e-10);
});

Deno.test("Lexer: tokenizes string literals with double quotes", () => {
  const tokens = tokenize('"hello world"');
  assertEquals(tokens[0].type, TokenType.STRING);
  assertEquals(tokens[0].literal, "hello world");
});

Deno.test("Lexer: tokenizes string literals with single quotes", () => {
  const tokens = tokenize("'hello world'");
  assertEquals(tokens[0].type, TokenType.STRING);
  assertEquals(tokens[0].literal, "hello world");
});

Deno.test("Lexer: handles escape sequences in strings", () => {
  const tokens = tokenize('"hello\\nworld\\t!"');
  assertEquals(tokens[0].literal, "hello\nworld\t!");
});

Deno.test("Lexer: tokenizes identifiers", () => {
  const tokens = tokenize("myVariable");
  assertEquals(tokens[0].type, TokenType.IDENTIFIER);
  assertEquals(tokens[0].value, "myVariable");
});

Deno.test("Lexer: recognizes keywords", () => {
  const keywords = [
    ["agent", TokenType.AGENT],
    ["good", TokenType.GOOD],
    ["market", TokenType.MARKET],
    ["policy", TokenType.POLICY],
    ["function", TokenType.FUNCTION],
    ["if", TokenType.IF],
    ["else", TokenType.ELSE],
    ["for", TokenType.FOR],
    ["while", TokenType.WHILE],
    ["return", TokenType.RETURN],
  ];

  for (const [keyword, expectedType] of keywords) {
    const tokens = tokenize(keyword as string);
    assertEquals(
      tokens[0].type,
      expectedType,
      `Expected ${keyword} to tokenize as ${expectedType}`,
    );
  }
});

Deno.test("Lexer: tokenizes boolean literals", () => {
  const trueTokens = tokenize("true");
  assertEquals(trueTokens[0].type, TokenType.TRUE);
  assertEquals(trueTokens[0].literal, true);

  const falseTokens = tokenize("false");
  assertEquals(falseTokens[0].type, TokenType.FALSE);
  assertEquals(falseTokens[0].literal, false);
});

Deno.test("Lexer: tokenizes null literal", () => {
  const tokens = tokenize("null");
  assertEquals(tokens[0].type, TokenType.NULL);
  assertEquals(tokens[0].literal, null);
});

Deno.test("Lexer: tokenizes operators", () => {
  const operators = [
    ["+", TokenType.PLUS],
    ["-", TokenType.MINUS],
    ["*", TokenType.STAR],
    ["/", TokenType.SLASH],
    ["%", TokenType.PERCENT],
    ["**", TokenType.POWER],
    ["==", TokenType.EQ],
    ["!=", TokenType.NE],
    ["<", TokenType.LT],
    [">", TokenType.GT],
    ["<=", TokenType.LE],
    [">=", TokenType.GE],
    ["=", TokenType.ASSIGN],
    ["+=", TokenType.PLUS_ASSIGN],
  ];

  for (const [op, expectedType] of operators) {
    const tokens = tokenize(op as string);
    assertEquals(tokens[0].type, expectedType, `Expected ${op} to tokenize as ${expectedType}`);
  }
});

Deno.test("Lexer: tokenizes delimiters", () => {
  const delimiters = [
    ["(", TokenType.LPAREN],
    [")", TokenType.RPAREN],
    ["{", TokenType.LBRACE],
    ["}", TokenType.RBRACE],
    ["[", TokenType.LBRACKET],
    ["]", TokenType.RBRACKET],
    [",", TokenType.COMMA],
    [".", TokenType.DOT],
    [":", TokenType.COLON],
    [";", TokenType.SEMICOLON],
  ];

  for (const [delim, expectedType] of delimiters) {
    const tokens = tokenize(delim as string);
    assertEquals(tokens[0].type, expectedType);
  }
});

Deno.test("Lexer: tokenizes currency units", () => {
  const tokens = tokenize("100USD");
  assertEquals(tokens[0].type, TokenType.CURRENCY_UNIT);
  assertEquals((tokens[0].literal as any).amount, 100);
  assertEquals((tokens[0].literal as any).currency, "USD");
});

Deno.test("Lexer: tokenizes time units", () => {
  const tokens = tokenize("5days");
  assertEquals(tokens[0].type, TokenType.TIME_UNIT);
  assertEquals((tokens[0].literal as any).value, 5);
  assertEquals((tokens[0].literal as any).unit, "days");
});

Deno.test("Lexer: tokenizes quantity units", () => {
  const tokens = tokenize("10kg");
  assertEquals(tokens[0].type, TokenType.QUANTITY_UNIT);
  assertEquals((tokens[0].literal as any).amount, 10);
  assertEquals((tokens[0].literal as any).unit, "kg");
});

Deno.test("Lexer: skips single-line comments", () => {
  const tokens = tokenize("42 // this is a comment\n100");
  assertEquals(tokens.length, 3); // 42, 100, EOF
  assertEquals(tokens[0].literal, 42);
  assertEquals(tokens[1].literal, 100);
});

Deno.test("Lexer: skips multi-line comments", () => {
  const tokens = tokenize("42 /* this is\na multi-line\ncomment */ 100");
  assertEquals(tokens.length, 3); // 42, 100, EOF
  assertEquals(tokens[0].literal, 42);
  assertEquals(tokens[1].literal, 100);
});

Deno.test("Lexer: handles nested block comments", () => {
  const tokens = tokenize("42 /* outer /* inner */ still in comment */ 100");
  assertEquals(tokens.length, 3);
  assertEquals(tokens[0].literal, 42);
  assertEquals(tokens[1].literal, 100);
});

Deno.test("Lexer: tokenizes range operators", () => {
  const inclusive = tokenize("1...10");
  assertEquals(inclusive[0].literal, 1);
  assertEquals(inclusive[1].type, TokenType.RANGE_INCLUSIVE);
  assertEquals(inclusive[2].literal, 10);

  const exclusive = tokenize("1..10");
  assertEquals(exclusive[0].literal, 1);
  assertEquals(exclusive[1].type, TokenType.RANGE);
  assertEquals(exclusive[2].literal, 10);
});

Deno.test("Lexer: tokenizes arrow and fat arrow", () => {
  const arrow = tokenize("->");
  assertEquals(arrow[0].type, TokenType.ARROW);

  const fatArrow = tokenize("=>");
  assertEquals(fatArrow[0].type, TokenType.FAT_ARROW);
});

Deno.test("Lexer: tokenizes complex expression", () => {
  const source = "const price = 100USD + 50EUR;";
  const tokens = tokenize(source);

  assertEquals(tokens[0].type, TokenType.CONST);
  assertEquals(tokens[1].type, TokenType.IDENTIFIER);
  assertEquals(tokens[2].type, TokenType.ASSIGN);
  assertEquals(tokens[3].type, TokenType.CURRENCY_UNIT);
  assertEquals(tokens[4].type, TokenType.PLUS);
  assertEquals(tokens[5].type, TokenType.CURRENCY_UNIT);
  assertEquals(tokens[6].type, TokenType.SEMICOLON);
  assertEquals(tokens[7].type, TokenType.EOF);
});

Deno.test("Lexer: preserves line and column information", () => {
  const tokens = tokenize("hello\nworld");

  assertEquals(tokens[0].span.start.line, 1);
  assertEquals(tokens[0].span.start.column, 1);

  assertEquals(tokens[1].span.start.line, 2);
  assertEquals(tokens[1].span.start.column, 1);
});

Deno.test("Lexer: throws on unterminated string", () => {
  assertThrows(
    () => tokenize('"unterminated string'),
    SyntaxError,
    "Unterminated string literal",
  );
});

Deno.test("Lexer: throws on unterminated block comment", () => {
  assertThrows(
    () => tokenize("/* unterminated comment"),
    SyntaxError,
    "Unterminated block comment",
  );
});

Deno.test("Lexer: throws on unexpected character", () => {
  assertThrows(
    () => tokenize("@invalid"),
    SyntaxError,
    "Unexpected character",
  );
});

Deno.test("Lexer: handles empty input", () => {
  const tokens = tokenize("");
  assertEquals(tokens.length, 1); // Just EOF
  assertEquals(tokens[0].type, TokenType.EOF);
});

Deno.test("Lexer: handles whitespace-only input", () => {
  const tokens = tokenize("   \n\t  \r\n  ");
  assertEquals(tokens.length, 1); // Just EOF
  assertEquals(tokens[0].type, TokenType.EOF);
});

Deno.test("Lexer: tokenizes complete agent declaration", () => {
  const source = `
    agent Consumer {
      wealth: number = 1000;
      utility: number;
    }
  `;

  const tokens = tokenize(source);

  assertEquals(tokens[0].type, TokenType.AGENT);
  assertEquals(tokens[1].type, TokenType.IDENTIFIER);
  assertEquals(tokens[1].value, "Consumer");
  assertEquals(tokens[2].type, TokenType.LBRACE);
});
