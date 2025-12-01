// Core type definitions for Eclexia
// Economics-as-Code DSL

// Source location tracking
type sourceLocation = {
  line: int,
  column: int,
  offset: int,
}

type sourceSpan = {
  start: sourceLocation,
  end_: sourceLocation,
  source: option<string>,
}

// Token types
type tokenType =
  | NUMBER
  | STRING
  | TRUE
  | FALSE
  | NULL
  | IDENTIFIER
  | AGENT
  | GOOD
  | MARKET
  | POLICY
  | MODEL
  | FUNCTION
  | CONST
  | IF
  | ELSE
  | FOR
  | IN
  | WHILE
  | RETURN
  | PLUS
  | MINUS
  | STAR
  | SLASH
  | PERCENT
  | POWER
  | EQ
  | NE
  | LT
  | GT
  | LE
  | GE
  | AND
  | OR
  | NOT
  | ASSIGN
  | LPAREN
  | RPAREN
  | LBRACE
  | RBRACE
  | LBRACKET
  | RBRACKET
  | COMMA
  | DOT
  | COLON
  | SEMICOLON
  | ARROW
  | FAT_ARROW
  | CURRENCY_UNIT
  | QUANTITY_UNIT
  | TIME_UNIT
  | EOF

type literalValue =
  | LitNumber(float)
  | LitString(string)
  | LitBool(bool)
  | LitNull
  | LitCurrency(float, string)
  | LitQuantity(float, string)
  | LitTime(float, string)

type token = {
  tokenType: tokenType,
  value: string,
  literal: option<literalValue>,
  span: sourceSpan,
}

// AST Node Types
type rec expression =
  | Literal(literalValue, sourceSpan)
  | Identifier(string, sourceSpan)
  | BinaryExpr({
      operator: string,
      left: expression,
      right: expression,
      span: sourceSpan,
    })
  | UnaryExpr({
      operator: string,
      argument: expression,
      span: sourceSpan,
    })
  | CallExpr({
      callee: expression,
      args: array<expression>,
      span: sourceSpan,
    })
  | ArrayExpr(array<expression>, sourceSpan)
  | ObjectExpr(array<(string, expression)>, sourceSpan)
  | LambdaExpr({
      parameters: array<parameter>,
      body: array<statement>,
      span: sourceSpan,
    })
  | ConditionalExpr({
      condition: expression,
      consequent: expression,
      alternate: expression,
      span: sourceSpan,
    })
  | MemberExpr({
      object: expression,
      property: expression,
      computed: bool,
      span: sourceSpan,
    })
  | RangeExpr({
      start: expression,
      end_: expression,
      inclusive: bool,
      span: sourceSpan,
    })

and statement =
  | ExprStmt(expression)
  | ConstDecl(string, expression)
  | FunctionDecl({
      name: string,
      parameters: array<parameter>,
      body: array<statement>,
    })
  | IfStmt({
      condition: expression,
      consequent: array<statement>,
      alternate: option<array<statement>>,
    })
  | ForStmt({
      variable: string,
      iterator: expression,
      body: array<statement>,
    })
  | WhileStmt({
      condition: expression,
      body: array<statement>,
    })
  | ReturnStmt(option<expression>)

and parameter = {
  name: string,
  defaultValue: option<expression>,
}

type declaration =
  | Statement(statement)
  | AgentDecl({
      name: string,
      properties: array<(string, string)>,
    })
  | GoodDecl({
      name: string,
      properties: array<(string, string)>,
      fungible: bool,
    })

type program = {
  declarations: array<declaration>,
}

// Runtime values
type rec runtimeValue =
  | VNull
  | VNumber(float)
  | VString(string)
  | VBool(bool)
  | VArray(array<runtimeValue>)
  | VObject(array<(string, runtimeValue)>)
  | VFunction({
      parameters: array<parameter>,
      body: array<statement>,
      closure: environment,
    })
  | VCurrency(float, string)
  | VQuantity(float, string)

and environment = {
  mutable variables: array<(string, runtimeValue)>,
  parent: option<environment>,
}

// Error types
type eclexiaError =
  | SyntaxError(string, option<sourceSpan>)
  | RuntimeError(string, option<sourceSpan>)
  | TypeError(string, option<sourceSpan>)

// Result types
type parseResult = result<program, eclexiaError>
type evalResult = result<runtimeValue, eclexiaError>
