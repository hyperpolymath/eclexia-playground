/**
 * Token types and definitions for Eclexia lexer
 */

import type { SourceLocation, SourceSpan } from "../types.ts";

export enum TokenType {
  // Literals
  NUMBER = "NUMBER",
  STRING = "STRING",
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",

  // Identifiers and Keywords
  IDENTIFIER = "IDENTIFIER",

  // Keywords - Declarations
  AGENT = "AGENT",
  GOOD = "GOOD",
  MARKET = "MARKET",
  POLICY = "POLICY",
  MODEL = "MODEL",
  FUNCTION = "FUNCTION",
  CONST = "CONST",
  LET = "LET",
  TYPE = "TYPE",

  // Keywords - Control Flow
  IF = "IF",
  ELSE = "ELSE",
  FOR = "FOR",
  IN = "IN",
  WHILE = "WHILE",
  RETURN = "RETURN",
  BREAK = "BREAK",
  CONTINUE = "CONTINUE",

  // Keywords - Modifiers
  MUTABLE = "MUTABLE",
  PURE = "PURE",
  FUNGIBLE = "FUNGIBLE",
  DIVISIBLE = "DIVISIBLE",

  // Keywords - Economic
  TRANSACTION = "TRANSACTION",
  BUY = "BUY",
  SELL = "SELL",
  TRANSFER = "TRANSFER",
  EMIT = "EMIT",
  BEHAVIOR = "BEHAVIOR",
  TRIGGER = "TRIGGER",

  // Keywords - Time
  TIME = "TIME",
  DURATION = "DURATION",
  AT = "AT",
  EVERY = "EVERY",

  // Keywords - Module System
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  FROM = "FROM",
  AS = "AS",

  // Operators - Arithmetic
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  PERCENT = "PERCENT",
  POWER = "POWER",

  // Operators - Comparison
  EQ = "EQ",
  NE = "NE",
  LT = "LT",
  GT = "GT",
  LE = "LE",
  GE = "GE",

  // Operators - Logical
  AND = "AND",
  OR = "OR",
  NOT = "NOT",

  // Operators - Assignment
  ASSIGN = "ASSIGN",
  PLUS_ASSIGN = "PLUS_ASSIGN",
  MINUS_ASSIGN = "MINUS_ASSIGN",
  STAR_ASSIGN = "STAR_ASSIGN",
  SLASH_ASSIGN = "SLASH_ASSIGN",
  PERCENT_ASSIGN = "PERCENT_ASSIGN",

  // Operators - Special
  ARROW = "ARROW",
  FAT_ARROW = "FAT_ARROW",
  QUESTION = "QUESTION",
  COALESCE = "COALESCE",
  RANGE = "RANGE",
  RANGE_INCLUSIVE = "RANGE_INCLUSIVE",
  PIPE = "PIPE",

  // Delimiters
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  COMMA = "COMMA",
  DOT = "DOT",
  COLON = "COLON",
  SEMICOLON = "SEMICOLON",

  // Units
  CURRENCY_UNIT = "CURRENCY_UNIT",
  QUANTITY_UNIT = "QUANTITY_UNIT",
  TIME_UNIT = "TIME_UNIT",

  // Special
  NEWLINE = "NEWLINE",
  EOF = "EOF",
  COMMENT = "COMMENT",
}

export interface Token {
  type: TokenType;
  value: string;
  literal?: number | string | boolean | null;
  span: SourceSpan;
}

export const KEYWORDS: Record<string, TokenType> = {
  // Declarations
  agent: TokenType.AGENT,
  good: TokenType.GOOD,
  market: TokenType.MARKET,
  policy: TokenType.POLICY,
  model: TokenType.MODEL,
  function: TokenType.FUNCTION,
  fn: TokenType.FUNCTION,
  const: TokenType.CONST,
  let: TokenType.LET,
  type: TokenType.TYPE,

  // Control Flow
  if: TokenType.IF,
  else: TokenType.ELSE,
  for: TokenType.FOR,
  in: TokenType.IN,
  while: TokenType.WHILE,
  return: TokenType.RETURN,
  break: TokenType.BREAK,
  continue: TokenType.CONTINUE,

  // Modifiers
  mutable: TokenType.MUTABLE,
  pure: TokenType.PURE,
  fungible: TokenType.FUNGIBLE,
  divisible: TokenType.DIVISIBLE,

  // Economic
  transaction: TokenType.TRANSACTION,
  buy: TokenType.BUY,
  sell: TokenType.SELL,
  transfer: TokenType.TRANSFER,
  emit: TokenType.EMIT,
  behavior: TokenType.BEHAVIOR,
  trigger: TokenType.TRIGGER,

  // Time
  time: TokenType.TIME,
  duration: TokenType.DURATION,
  at: TokenType.AT,
  every: TokenType.EVERY,

  // Module System
  import: TokenType.IMPORT,
  export: TokenType.EXPORT,
  from: TokenType.FROM,
  as: TokenType.AS,

  // Logical
  and: TokenType.AND,
  or: TokenType.OR,
  not: TokenType.NOT,

  // Literals
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
};

export const CURRENCY_UNITS = new Set([
  "USD", "EUR", "GBP", "JPY", "CNY", "CHF", "CAD", "AUD",
  "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON",
  "BTC", "ETH", "USDT", "USDC",
]);

export const TIME_UNITS = new Set([
  "second", "seconds", "s",
  "minute", "minutes", "m",
  "hour", "hours", "h",
  "day", "days", "d",
  "week", "weeks", "w",
  "month", "months", "M",
  "year", "years", "y",
  "tick", "ticks", "t",
]);

export function createToken(
  type: TokenType,
  value: string,
  start: SourceLocation,
  end: SourceLocation,
  literal?: number | string | boolean | null,
): Token {
  return {
    type,
    value,
    literal,
    span: { start, end },
  };
}

export function isKeyword(identifier: string): boolean {
  return identifier in KEYWORDS;
}

export function getKeywordType(identifier: string): TokenType | undefined {
  return KEYWORDS[identifier];
}

export function isCurrencyUnit(unit: string): boolean {
  return CURRENCY_UNITS.has(unit);
}

export function isTimeUnit(unit: string): boolean {
  return TIME_UNITS.has(unit);
}
