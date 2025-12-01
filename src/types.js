// Core type definitions for Eclexia
// Pure functional JavaScript - no TypeScript, runs on Deno

// Token Types (using objects as enums)
export const TokenType = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  TRUE: "TRUE",
  FALSE: "FALSE",
  NULL: "NULL",
  IDENTIFIER: "IDENTIFIER",
  AGENT: "AGENT",
  GOOD: "GOOD",
  MARKET: "MARKET",
  FUNCTION: "FUNCTION",
  CONST: "CONST",
  IF: "IF",
  ELSE: "ELSE",
  FOR: "FOR",
  IN: "IN",
  WHILE: "WHILE",
  RETURN: "RETURN",
  PLUS: "PLUS",
  MINUS: "MINUS",
  STAR: "STAR",
  SLASH: "SLASH",
  POWER: "POWER",
  EQ: "EQ",
  NE: "NE",
  LT: "LT",
  GT: "GT",
  LE: "LE",
  GE: "GE",
  ASSIGN: "ASSIGN",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  LBRACE: "LBRACE",
  RBRACE: "RBRACE",
  LBRACKET: "LBRACKET",
  RBRACKET: "RBRACKET",
  COMMA: "COMMA",
  DOT: "DOT",
  COLON: "COLON",
  ARROW: "ARROW",
  CURRENCY_UNIT: "CURRENCY_UNIT",
  EOF: "EOF",
};

// Constructor functions (functional approach)
export const createToken = (type, value, literal, span) => ({
  type,
  value,
  literal,
  span,
});

export const createSourceLocation = (line, column, offset) => ({
  line,
  column,
  offset,
});

export const createSourceSpan = (start, end) => ({
  start,
  end,
});

// AST Nodes (using tagged unions)
export const Expr = {
  Literal: (value, span) => ({ tag: "Literal", value, span }),
  Identifier: (name, span) => ({ tag: "Identifier", name, span }),
  Binary: (op, left, right, span) => ({ tag: "Binary", op, left, right, span }),
  Unary: (op, arg, span) => ({ tag: "Unary", op, arg, span }),
  Call: (callee, args, span) => ({ tag: "Call", callee, args, span }),
  Array: (elements, span) => ({ tag: "Array", elements, span }),
  Object: (props, span) => ({ tag: "Object", props, span }),
};

export const Stmt = {
  Expr: (expr) => ({ tag: "ExprStmt", expr }),
  Const: (name, value) => ({ tag: "ConstDecl", name, value }),
  Function: (name, params, body) => ({ tag: "FunctionDecl", name, params, body }),
  Return: (value) => ({ tag: "ReturnStmt", value }),
  If: (cond, consequent, alternate) => ({ tag: "IfStmt", cond, consequent, alternate }),
  For: (variable, iterator, body) => ({ tag: "ForStmt", variable, iterator, body }),
  While: (cond, body) => ({ tag: "WhileStmt", cond, body }),
};

export const createProgram = (declarations) => ({
  declarations,
});

// Runtime Values
export const Value = {
  Null: () => ({ tag: "Null" }),
  Number: (n) => ({ tag: "Number", value: n }),
  String: (s) => ({ tag: "String", value: s }),
  Bool: (b) => ({ tag: "Bool", value: b }),
  Array: (elements) => ({ tag: "Array", elements }),
  Object: (props) => ({ tag: "Object", props }),
  Function: (params, body, closure) => ({ tag: "Function", params, body, closure }),
  Currency: (amount, currency) => ({ tag: "Currency", amount, currency }),
};

// Environment
export const createEnv = (parent = null) => ({
  variables: new Map(),
  parent,
});

// Error types
export class EclexiaError extends Error {
  constructor(message, span = null) {
    super(message);
    this.name = "EclexiaError";
    this.span = span;
  }
}

export class SyntaxError extends EclexiaError {
  constructor(message, span = null) {
    super(message, span);
    this.name = "SyntaxError";
  }
}

export class RuntimeError extends EclexiaError {
  constructor(message, span = null) {
    super(message, span);
    this.name = "RuntimeError";
  }
}
