/**
 * Recursive descent parser for Eclexia
 * Converts token stream into Abstract Syntax Tree (AST)
 */

import type {
  AgentDeclaration,
  ArrayExpression,
  AssignmentOperator,
  AssignmentStatement,
  BehaviorDeclaration,
  BinaryExpression,
  BinaryOperator,
  BlockStatement,
  CallExpression,
  ComprehensionExpression,
  ConditionalExpression,
  ConstDeclaration,
  CurrencyExpression,
  Declaration,
  EffectDeclaration,
  EmitStatement,
  Expression,
  ExpressionStatement,
  ExportDeclaration,
  ForStatement,
  FunctionDeclaration,
  GoodDeclaration,
  Identifier,
  IfStatement,
  ImportDeclaration,
  LambdaExpression,
  Literal,
  MarketDeclaration,
  MarketMechanism,
  MemberExpression,
  ModelDeclaration,
  ObjectExpression,
  ParameterDeclaration,
  PolicyDeclaration,
  Program,
  PropertyDeclaration,
  PropertyExpression,
  QuantityExpression,
  RangeExpression,
  ReturnStatement,
  SourceSpan,
  Statement,
  TimeExpression,
  TransactionStatement,
  TriggerExpression,
  TypeAliasDeclaration,
  TypeNode,
  UnaryExpression,
  UnaryOperator,
  WhileStatement,
  DynamicRule,
} from "../types.ts";
import { SyntaxError } from "../types.ts";
import type { Token } from "../lexer/token.ts";
import { TokenType } from "../lexer/token.ts";

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Program {
    const imports: ImportDeclaration[] = [];
    const exports: ExportDeclaration[] = [];
    const declarations: Declaration[] = [];

    while (!this.isAtEnd()) {
      if (this.check(TokenType.IMPORT)) {
        imports.push(this.parseImport());
      } else if (this.check(TokenType.EXPORT)) {
        const exp = this.parseExport();
        exports.push(exp);
        if (exp.declaration) {
          declarations.push(exp.declaration);
        }
      } else {
        declarations.push(this.parseDeclaration());
      }
    }

    return {
      type: "Program",
      imports,
      exports,
      declarations,
    };
  }

  // ========================================================================
  // Declarations
  // ========================================================================

  private parseDeclaration(): Declaration {
    if (this.match(TokenType.AGENT)) return this.parseAgent();
    if (this.match(TokenType.GOOD)) return this.parseGood();
    if (this.match(TokenType.MARKET)) return this.parseMarket();
    if (this.match(TokenType.POLICY)) return this.parsePolicy();
    if (this.match(TokenType.MODEL)) return this.parseModel();
    if (this.match(TokenType.FUNCTION)) return this.parseFunction();
    if (this.match(TokenType.CONST)) return this.parseConst();
    if (this.match(TokenType.TYPE)) return this.parseTypeAlias();

    throw this.error("Expected declaration");
  }

  private parseAgent(): AgentDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected agent name").value;
    this.consume(TokenType.LBRACE, "Expected '{' after agent name");

    const properties: PropertyDeclaration[] = [];
    const behaviors: BehaviorDeclaration[] = [];
    const constraints: Expression[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.match(TokenType.BEHAVIOR)) {
        behaviors.push(this.parseBehavior());
      } else if (this.checkIdentifier("constraint")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after constraint");
        constraints.push(this.parseExpression());
      } else {
        properties.push(this.parseProperty());
      }

      this.matchSemicolon();
    }

    this.consume(TokenType.RBRACE, "Expected '}' after agent body");

    return {
      type: "AgentDeclaration",
      name,
      properties,
      behaviors,
      constraints: constraints.length > 0 ? constraints : undefined,
    };
  }

  private parseProperty(): PropertyDeclaration {
    const mutable = this.match(TokenType.MUTABLE);
    const name = this.consume(TokenType.IDENTIFIER, "Expected property name").value;
    this.consume(TokenType.COLON, "Expected ':' after property name");
    const propertyType = this.parseType();

    let defaultValue: Expression | undefined;
    if (this.match(TokenType.ASSIGN)) {
      defaultValue = this.parseExpression();
    }

    return {
      type: "PropertyDeclaration",
      name,
      propertyType,
      defaultValue,
      mutable,
    };
  }

  private parseBehavior(): BehaviorDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected behavior name").value;
    this.consume(TokenType.LPAREN, "Expected '(' after behavior name");

    const parameters: ParameterDeclaration[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        parameters.push(this.parseParameter());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')' after parameters");

    let returnType: TypeNode | undefined;
    if (this.match(TokenType.ARROW)) {
      returnType = this.parseType();
    }

    const triggers: TriggerExpression[] = [];
    if (this.checkIdentifier("on")) {
      this.advance();
      do {
        const event = this.consume(TokenType.IDENTIFIER, "Expected event name").value;
        let condition: Expression | undefined;
        if (this.match(TokenType.IF)) {
          condition = this.parseExpression();
        }
        triggers.push({
          type: "TriggerExpression",
          event,
          condition,
        });
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.LBRACE, "Expected '{' before behavior body");
    const body = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after behavior body");

    return {
      type: "BehaviorDeclaration",
      name,
      parameters,
      returnType,
      body,
      triggers: triggers.length > 0 ? triggers : undefined,
    };
  }

  private parseGood(): GoodDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected good name").value;
    const fungible = this.match(TokenType.FUNGIBLE);
    const divisible = this.match(TokenType.DIVISIBLE);

    this.consume(TokenType.LBRACE, "Expected '{' after good declaration");

    const attributes: PropertyDeclaration[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      attributes.push(this.parseProperty());
      this.matchSemicolon();
    }

    this.consume(TokenType.RBRACE, "Expected '}' after good body");

    return {
      type: "GoodDeclaration",
      name,
      attributes,
      fungible,
      divisible,
    };
  }

  private parseMarket(): MarketDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected market name").value;

    this.consume(TokenType.LBRACE, "Expected '{' after market name");

    let goods: string[] = [];
    let mechanism: MarketMechanism = "double-auction";
    const rules: Expression[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.checkIdentifier("goods")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after goods");
        this.consume(TokenType.LBRACKET, "Expected '[' for goods list");
        do {
          goods.push(this.consume(TokenType.IDENTIFIER, "Expected good name").value);
        } while (this.match(TokenType.COMMA));
        this.consume(TokenType.RBRACKET, "Expected ']' after goods list");
      } else if (this.checkIdentifier("mechanism")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after mechanism");
        const mech = this.consume(TokenType.IDENTIFIER, "Expected mechanism type").value;
        mechanism = mech as MarketMechanism;
      } else if (this.checkIdentifier("rule")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after rule");
        rules.push(this.parseExpression());
      }

      this.matchSemicolon();
    }

    this.consume(TokenType.RBRACE, "Expected '}' after market body");

    return {
      type: "MarketDeclaration",
      name,
      goods,
      mechanism,
      rules,
    };
  }

  private parsePolicy(): PolicyDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected policy name").value;

    this.consume(TokenType.LPAREN, "Expected '(' after policy name");
    const parameters: ParameterDeclaration[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        parameters.push(this.parseParameter());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')' after parameters");

    this.consume(TokenType.LBRACE, "Expected '{' after policy declaration");

    const effects: EffectDeclaration[] = [];
    let duration: Expression | undefined;

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.checkIdentifier("effect")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after effect");
        const target = this.parseExpression();
        this.consume(TokenType.ASSIGN, "Expected '=' in effect");
        const modification = this.parseExpression();

        let condition: Expression | undefined;
        if (this.match(TokenType.IF)) {
          condition = this.parseExpression();
        }

        effects.push({
          type: "EffectDeclaration",
          target,
          modification,
          condition,
        });
      } else if (this.checkIdentifier("duration")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after duration");
        duration = this.parseExpression();
      }

      this.matchSemicolon();
    }

    this.consume(TokenType.RBRACE, "Expected '}' after policy body");

    return {
      type: "PolicyDeclaration",
      name,
      parameters,
      effects,
      duration,
    };
  }

  private parseModel(): ModelDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected model name").value;

    this.consume(TokenType.LBRACE, "Expected '{' after model name");

    let timeHorizon: Expression | undefined;
    const agents: Expression[] = [];
    const markets: Expression[] = [];
    const policies: Expression[] = [];
    let initialState: ObjectExpression | undefined;
    const dynamics: DynamicRule[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      if (this.checkIdentifier("timeHorizon")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after timeHorizon");
        timeHorizon = this.parseExpression();
      } else if (this.checkIdentifier("agents")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after agents");
        this.consume(TokenType.LBRACKET, "Expected '[' for agents list");
        if (!this.check(TokenType.RBRACKET)) {
          do {
            agents.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RBRACKET, "Expected ']' after agents list");
      } else if (this.checkIdentifier("markets")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after markets");
        this.consume(TokenType.LBRACKET, "Expected '[' for markets list");
        if (!this.check(TokenType.RBRACKET)) {
          do {
            markets.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RBRACKET, "Expected ']' after markets list");
      } else if (this.checkIdentifier("policies")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after policies");
        this.consume(TokenType.LBRACKET, "Expected '[' for policies list");
        if (!this.check(TokenType.RBRACKET)) {
          do {
            policies.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RBRACKET, "Expected ']' after policies list");
      } else if (this.checkIdentifier("initialState")) {
        this.advance();
        this.consume(TokenType.COLON, "Expected ':' after initialState");
        initialState = this.parseObjectExpression();
      } else if (this.match(TokenType.EVERY)) {
        const frequency = this.parseExpression();
        this.consume(TokenType.COLON, "Expected ':' after frequency");
        const action = this.parseStatement();
        dynamics.push({
          type: "DynamicRule",
          frequency,
          action,
        });
      }

      this.matchSemicolon();
    }

    this.consume(TokenType.RBRACE, "Expected '}' after model body");

    if (!timeHorizon) {
      throw this.error("Model must have timeHorizon");
    }
    if (!initialState) {
      throw this.error("Model must have initialState");
    }

    return {
      type: "ModelDeclaration",
      name,
      timeHorizon,
      agents,
      markets,
      policies,
      initialState,
      dynamics,
    };
  }

  private parseFunction(): FunctionDeclaration {
    const pure = this.match(TokenType.PURE);
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;

    this.consume(TokenType.LPAREN, "Expected '(' after function name");
    const parameters: ParameterDeclaration[] = [];
    if (!this.check(TokenType.RPAREN)) {
      do {
        parameters.push(this.parseParameter());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RPAREN, "Expected ')' after parameters");

    let returnType: TypeNode | undefined;
    if (this.match(TokenType.ARROW)) {
      returnType = this.parseType();
    }

    this.consume(TokenType.LBRACE, "Expected '{' before function body");
    const body = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after function body");

    return {
      type: "FunctionDeclaration",
      name,
      parameters,
      returnType,
      body,
      pure,
    };
  }

  private parseParameter(): ParameterDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected parameter name").value;
    const optional = this.match(TokenType.QUESTION);

    this.consume(TokenType.COLON, "Expected ':' after parameter name");
    const paramType = this.parseType();

    let defaultValue: Expression | undefined;
    if (this.match(TokenType.ASSIGN)) {
      defaultValue = this.parseExpression();
    }

    return {
      type: "ParameterDeclaration",
      name,
      paramType,
      defaultValue,
      optional,
    };
  }

  private parseConst(): ConstDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected constant name").value;

    let valueType: TypeNode | undefined;
    if (this.match(TokenType.COLON)) {
      valueType = this.parseType();
    }

    this.consume(TokenType.ASSIGN, "Expected '=' in const declaration");
    const value = this.parseExpression();

    return {
      type: "ConstDeclaration",
      name,
      valueType,
      value,
    };
  }

  private parseTypeAlias(): TypeAliasDeclaration {
    const name = this.consume(TokenType.IDENTIFIER, "Expected type name").value;

    let typeParams: string[] | undefined;
    if (this.match(TokenType.LT)) {
      typeParams = [];
      do {
        typeParams.push(this.consume(TokenType.IDENTIFIER, "Expected type parameter").value);
      } while (this.match(TokenType.COMMA));
      this.consume(TokenType.GT, "Expected '>' after type parameters");
    }

    this.consume(TokenType.ASSIGN, "Expected '=' in type alias");
    const aliasedType = this.parseType();

    return {
      type: "TypeAliasDeclaration",
      name,
      typeParams,
      aliasedType,
    };
  }

  private parseImport(): ImportDeclaration {
    this.consume(TokenType.IMPORT, "Expected 'import'");

    this.consume(TokenType.LBRACE, "Expected '{' in import");
    const items: string[] = [];
    do {
      items.push(this.consume(TokenType.IDENTIFIER, "Expected import item").value);
    } while (this.match(TokenType.COMMA));
    this.consume(TokenType.RBRACE, "Expected '}' after import items");

    this.consume(TokenType.FROM, "Expected 'from' in import");
    const from = this.consume(TokenType.STRING, "Expected module path").literal as string;

    let alias: string | undefined;
    if (this.match(TokenType.AS)) {
      alias = this.consume(TokenType.IDENTIFIER, "Expected alias name").value;
    }

    return {
      type: "ImportDeclaration",
      items,
      from,
      alias,
    };
  }

  private parseExport(): ExportDeclaration {
    this.consume(TokenType.EXPORT, "Expected 'export'");

    if (this.check(TokenType.LBRACE)) {
      this.advance();
      const items: string[] = [];
      do {
        items.push(this.consume(TokenType.IDENTIFIER, "Expected export item").value);
      } while (this.match(TokenType.COMMA));
      this.consume(TokenType.RBRACE, "Expected '}' after export items");

      return {
        type: "ExportDeclaration",
        items,
      };
    } else {
      const declaration = this.parseDeclaration();
      return {
        type: "ExportDeclaration",
        declaration,
      };
    }
  }

  // ========================================================================
  // Types
  // ========================================================================

  private parseType(): TypeNode {
    let type = this.parsePrimaryType();

    // Union types
    if (this.match(TokenType.PIPE)) {
      const types = [type];
      do {
        types.push(this.parsePrimaryType());
      } while (this.match(TokenType.PIPE));

      return {
        type: "UnionType",
        types,
      };
    }

    return type;
  }

  private parsePrimaryType(): TypeNode {
    // Primitive types
    if (this.checkIdentifier("number")) {
      this.advance();
      return { type: "PrimitiveType", kind: "number" };
    }
    if (this.checkIdentifier("string")) {
      this.advance();
      return { type: "PrimitiveType", kind: "string" };
    }
    if (this.checkIdentifier("boolean")) {
      this.advance();
      return { type: "PrimitiveType", kind: "boolean" };
    }
    if (this.checkIdentifier("currency")) {
      this.advance();
      return { type: "PrimitiveType", kind: "currency" };
    }
    if (this.checkIdentifier("quantity")) {
      this.advance();
      return { type: "PrimitiveType", kind: "quantity" };
    }
    if (this.checkIdentifier("time")) {
      this.advance();
      return { type: "PrimitiveType", kind: "time" };
    }
    if (this.checkIdentifier("void")) {
      this.advance();
      return { type: "PrimitiveType", kind: "void" };
    }

    // Array type
    if (this.match(TokenType.LBRACKET)) {
      this.consume(TokenType.RBRACKET, "Expected ']' for array type");
      const elementType = this.parseType();
      return { type: "ArrayType", elementType };
    }

    // Type reference or generic
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value;

      // Generic type
      if (this.match(TokenType.LT)) {
        const typeArgs: TypeNode[] = [];
        do {
          typeArgs.push(this.parseType());
        } while (this.match(TokenType.COMMA));
        this.consume(TokenType.GT, "Expected '>' after type arguments");

        return {
          type: "GenericType",
          name,
          typeArgs,
        };
      }

      return {
        type: "TypeReference",
        name,
      };
    }

    // Object type
    if (this.match(TokenType.LBRACE)) {
      const properties: TypeNode["type"] extends "ObjectType" ? TypeNode["properties"] : never = [];
      while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
        const readonly = this.checkIdentifier("readonly") && this.advance();
        const propName = this.consume(TokenType.IDENTIFIER, "Expected property name").value;
        const optional = this.match(TokenType.QUESTION);
        this.consume(TokenType.COLON, "Expected ':' after property name");
        const propertyType = this.parseType();

        properties.push({
          type: "PropertySignature",
          name: propName,
          propertyType,
          optional,
          readonly: !!readonly,
        });

        if (!this.check(TokenType.RBRACE)) {
          this.matchSemicolon() || this.match(TokenType.COMMA);
        }
      }
      this.consume(TokenType.RBRACE, "Expected '}' after object type");

      return {
        type: "ObjectType",
        properties,
      };
    }

    throw this.error("Expected type");
  }

  // ========================================================================
  // Statements
  // ========================================================================

  private parseStatement(): Statement {
    if (this.match(TokenType.IF)) return this.parseIfStatement();
    if (this.match(TokenType.FOR)) return this.parseForStatement();
    if (this.match(TokenType.WHILE)) return this.parseWhileStatement();
    if (this.match(TokenType.RETURN)) return this.parseReturnStatement();
    if (this.match(TokenType.TRANSACTION)) return this.parseTransactionStatement();
    if (this.match(TokenType.EMIT)) return this.parseEmitStatement();
    if (this.match(TokenType.LBRACE)) return this.parseBlockStatement();

    // Assignment or expression statement
    const expr = this.parseExpression();

    if (this.matchAssignmentOperator()) {
      const operator = this.previous().value as AssignmentOperator;
      const value = this.parseExpression();

      return {
        type: "AssignmentStatement",
        target: expr,
        operator,
        value,
      };
    }

    return {
      type: "ExpressionStatement",
      expression: expr,
    };
  }

  private parseIfStatement(): IfStatement {
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{' after if condition");
    const consequent = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after if body");

    let alternate: Statement[] | undefined;
    if (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        alternate = [this.parseIfStatement()];
      } else {
        this.consume(TokenType.LBRACE, "Expected '{' after else");
        alternate = this.parseBlockStatements();
        this.consume(TokenType.RBRACE, "Expected '}' after else body");
      }
    }

    return {
      type: "IfStatement",
      condition,
      consequent,
      alternate,
    };
  }

  private parseForStatement(): ForStatement {
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.IN, "Expected 'in' in for loop");
    const iterator = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{' after for header");
    const body = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after for body");

    return {
      type: "ForStatement",
      variable,
      iterator,
      body,
    };
  }

  private parseWhileStatement(): WhileStatement {
    const condition = this.parseExpression();
    this.consume(TokenType.LBRACE, "Expected '{' after while condition");
    const body = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after while body");

    return {
      type: "WhileStatement",
      condition,
      body,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    let value: Expression | undefined;
    if (!this.check(TokenType.SEMICOLON) && !this.check(TokenType.RBRACE)) {
      value = this.parseExpression();
    }

    return {
      type: "ReturnStatement",
      value,
    };
  }

  private parseTransactionStatement(): TransactionStatement {
    const from = this.parseExpression();
    this.consume(TokenType.ARROW, "Expected '->' in transaction");
    const to = this.parseExpression();
    this.consume(TokenType.COLON, "Expected ':' before good");
    const good = this.parseExpression();
    this.consume(TokenType.STAR, "Expected '*' before quantity");
    const quantity = this.parseExpression();

    let price: Expression | undefined;
    if (this.match(TokenType.AT)) {
      price = this.parseExpression();
    }

    return {
      type: "TransactionStatement",
      from,
      to,
      good,
      quantity,
      price,
    };
  }

  private parseEmitStatement(): EmitStatement {
    const event = this.consume(TokenType.IDENTIFIER, "Expected event name").value;
    const data = this.parseExpression();

    return {
      type: "EmitStatement",
      event,
      data,
    };
  }

  private parseBlockStatement(): BlockStatement {
    const statements = this.parseBlockStatements();
    this.consume(TokenType.RBRACE, "Expected '}' after block");

    return {
      type: "BlockStatement",
      statements,
    };
  }

  private parseBlockStatements(): Statement[] {
    const statements: Statement[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
      this.matchSemicolon();
    }

    return statements;
  }

  // ========================================================================
  // Expressions
  // ========================================================================

  private parseExpression(): Expression {
    return this.parseConditional();
  }

  private parseConditional(): Expression {
    let expr = this.parseLogicalOr();

    if (this.match(TokenType.QUESTION)) {
      const consequent = this.parseExpression();
      this.consume(TokenType.COLON, "Expected ':' in conditional expression");
      const alternate = this.parseExpression();

      return {
        type: "ConditionalExpression",
        condition: expr,
        consequent,
        alternate,
      };
    }

    return expr;
  }

  private parseLogicalOr(): Expression {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.OR)) {
      const operator: BinaryOperator = "||";
      const right = this.parseLogicalAnd();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseLogicalAnd(): Expression {
    let left = this.parseEquality();

    while (this.match(TokenType.AND)) {
      const operator: BinaryOperator = "&&";
      const right = this.parseEquality();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseEquality(): Expression {
    let left = this.parseComparison();

    while (this.match(TokenType.EQ, TokenType.NE)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.parseComparison();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseComparison(): Expression {
    let left = this.parseRange();

    while (this.match(TokenType.LT, TokenType.GT, TokenType.LE, TokenType.GE)) {
      const opToken = this.previous().value;
      const operator = (opToken === "<=" ? "<=" : opToken === ">=" ? ">=" : opToken) as BinaryOperator;
      const right = this.parseRange();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseRange(): Expression {
    let left = this.parseTerm();

    if (this.match(TokenType.RANGE)) {
      const end = this.parseTerm();
      let step: Expression | undefined;
      if (this.checkIdentifier("step")) {
        this.advance();
        step = this.parseTerm();
      }

      return {
        type: "RangeExpression",
        start: left,
        end,
        step,
        inclusive: false,
      };
    }

    if (this.match(TokenType.RANGE_INCLUSIVE)) {
      const end = this.parseTerm();
      let step: Expression | undefined;
      if (this.checkIdentifier("step")) {
        this.advance();
        step = this.parseTerm();
      }

      return {
        type: "RangeExpression",
        start: left,
        end,
        step,
        inclusive: true,
      };
    }

    return left;
  }

  private parseTerm(): Expression {
    let left = this.parseFactor();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.parseFactor();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseFactor(): Expression {
    let left = this.parsePower();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.parsePower();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parsePower(): Expression {
    let left = this.parseUnary();

    if (this.match(TokenType.POWER)) {
      const right = this.parsePower(); // Right associative
      return {
        type: "BinaryExpression",
        operator: "**",
        left,
        right,
      };
    }

    return left;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.PLUS)) {
      const opToken = this.previous();
      const operator = (opToken.type === TokenType.NOT ? "not" : opToken.value) as UnaryOperator;
      const argument = this.parseUnary();

      return {
        type: "UnaryExpression",
        operator,
        argument,
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        // Call expression
        const args: Expression[] = [];
        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expected ')' after arguments");

        expr = {
          type: "CallExpression",
          callee: expr,
          args,
        };
      } else if (this.match(TokenType.DOT)) {
        // Member expression
        const property: Identifier = {
          type: "Identifier",
          name: this.consume(TokenType.IDENTIFIER, "Expected property name").value,
        };

        expr = {
          type: "MemberExpression",
          object: expr,
          property,
          computed: false,
        };
      } else if (this.match(TokenType.LBRACKET)) {
        // Computed member expression
        const property = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Expected ']' after computed property");

        expr = {
          type: "MemberExpression",
          object: expr,
          property,
          computed: true,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): Expression {
    // Literals
    if (this.match(TokenType.TRUE, TokenType.FALSE)) {
      return {
        type: "Literal",
        value: this.previous().literal as boolean,
        raw: this.previous().value,
      };
    }

    if (this.match(TokenType.NULL)) {
      return {
        type: "Literal",
        value: null,
        raw: this.previous().value,
      };
    }

    if (this.match(TokenType.NUMBER)) {
      return {
        type: "Literal",
        value: this.previous().literal as number,
        raw: this.previous().value,
      };
    }

    if (this.match(TokenType.STRING)) {
      return {
        type: "Literal",
        value: this.previous().literal as string,
        raw: this.previous().value,
      };
    }

    // Currency expression
    if (this.match(TokenType.CURRENCY_UNIT)) {
      const literal = this.previous().literal as { amount: number; currency: string };
      return {
        type: "CurrencyExpression",
        amount: { type: "Literal", value: literal.amount, raw: literal.amount.toString() },
        currency: literal.currency,
      };
    }

    // Time expression
    if (this.match(TokenType.TIME_UNIT)) {
      const literal = this.previous().literal as { value: number; unit: string };
      return {
        type: "TimeExpression",
        value: { type: "Literal", value: literal.value, raw: literal.value.toString() },
        unit: literal.unit as TimeExpression["unit"],
      };
    }

    // Quantity expression
    if (this.match(TokenType.QUANTITY_UNIT)) {
      const literal = this.previous().literal as { amount: number; unit: string };
      return {
        type: "QuantityExpression",
        amount: { type: "Literal", value: literal.amount, raw: literal.amount.toString() },
        unit: literal.unit,
      };
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: "Identifier",
        name: this.previous().value,
      };
    }

    // Array expression or comprehension
    if (this.match(TokenType.LBRACKET)) {
      // Check for comprehension: [expr for x in iter]
      const checkpoint = this.current;

      // Try to parse as comprehension
      if (!this.check(TokenType.RBRACKET)) {
        const firstExpr = this.parseExpression();

        if (this.match(TokenType.FOR)) {
          const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
          this.consume(TokenType.IN, "Expected 'in' in comprehension");
          const iterator = this.parseExpression();

          let condition: Expression | undefined;
          if (this.match(TokenType.IF)) {
            condition = this.parseExpression();
          }

          this.consume(TokenType.RBRACKET, "Expected ']' after comprehension");

          return {
            type: "ComprehensionExpression",
            element: firstExpr,
            variable,
            iterator,
            condition,
          };
        }

        // Not a comprehension, restore and parse as array
        this.current = checkpoint;
      }

      return this.parseArrayExpression();
    }

    // Object expression
    if (this.match(TokenType.LBRACE)) {
      return this.parseObjectExpression();
    }

    // Lambda expression
    if (this.match(TokenType.LPAREN)) {
      const checkpoint = this.current;

      // Try to parse as lambda
      try {
        const parameters: ParameterDeclaration[] = [];
        if (!this.check(TokenType.RPAREN)) {
          do {
            parameters.push(this.parseParameter());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, "Expected ')' after parameters");

        let returnType: TypeNode | undefined;
        if (this.match(TokenType.ARROW)) {
          returnType = this.parseType();
        }

        if (this.match(TokenType.FAT_ARROW)) {
          // Expression body
          const body = this.parseExpression();

          return {
            type: "LambdaExpression",
            parameters,
            body,
            returnType,
          };
        }

        if (this.match(TokenType.LBRACE)) {
          // Statement body
          const body = this.parseBlockStatements();
          this.consume(TokenType.RBRACE, "Expected '}' after lambda body");

          return {
            type: "LambdaExpression",
            parameters,
            body,
            returnType,
          };
        }
      } catch {
        // Not a lambda, restore
        this.current = checkpoint;
      }

      // Parse as grouped expression
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    throw this.error("Expected expression");
  }

  private parseArrayExpression(): ArrayExpression {
    const elements: Expression[] = [];

    if (!this.check(TokenType.RBRACKET)) {
      do {
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RBRACKET, "Expected ']' after array elements");

    return {
      type: "ArrayExpression",
      elements,
    };
  }

  private parseObjectExpression(): ObjectExpression {
    const properties: PropertyExpression[] = [];

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      let key: Expression;
      let computed = false;

      if (this.match(TokenType.LBRACKET)) {
        key = this.parseExpression();
        this.consume(TokenType.RBRACKET, "Expected ']' after computed property");
        computed = true;
      } else {
        key = {
          type: "Identifier",
          name: this.consume(TokenType.IDENTIFIER, "Expected property name").value,
        };
      }

      this.consume(TokenType.COLON, "Expected ':' after property key");
      const value = this.parseExpression();

      properties.push({
        type: "PropertyExpression",
        key,
        value,
        computed,
      });

      if (!this.check(TokenType.RBRACE)) {
        this.match(TokenType.COMMA) || this.matchSemicolon();
      }
    }

    this.consume(TokenType.RBRACE, "Expected '}' after object properties");

    return {
      type: "ObjectExpression",
      properties,
    };
  }

  // ========================================================================
  // Helper methods
  // ========================================================================

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private checkIdentifier(name: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === TokenType.IDENTIFIER && token.value === name;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(message);
  }

  private matchSemicolon(): boolean {
    return this.match(TokenType.SEMICOLON);
  }

  private matchAssignmentOperator(): boolean {
    return this.match(
      TokenType.ASSIGN,
      TokenType.PLUS_ASSIGN,
      TokenType.MINUS_ASSIGN,
      TokenType.STAR_ASSIGN,
      TokenType.SLASH_ASSIGN,
      TokenType.PERCENT_ASSIGN,
    );
  }

  private error(message: string): SyntaxError {
    const token = this.peek();
    return new SyntaxError(
      `${message} at '${token.value}'`,
      token.span,
    );
  }
}

export function parse(tokens: Token[]): Program {
  const parser = new Parser(tokens);
  return parser.parse();
}
