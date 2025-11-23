/**
 * Interpreter for Eclexia language
 * Executes AST nodes and returns runtime values
 */

import type {
  AgentDeclaration,
  ArrayExpression,
  AssignmentStatement,
  BinaryExpression,
  CallExpression,
  ComprehensionExpression,
  ConditionalExpression,
  ConstDeclaration,
  CurrencyExpression,
  Declaration,
  EmitStatement,
  Environment,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionDeclaration,
  GoodDeclaration,
  Identifier,
  IfStatement,
  LambdaExpression,
  Literal,
  MarketDeclaration,
  MemberExpression,
  ModelDeclaration,
  ObjectExpression,
  PolicyDeclaration,
  Program,
  QuantityExpression,
  RangeExpression,
  ReturnStatement,
  RuntimeValue,
  Statement,
  TimeExpression,
  TransactionStatement,
  TypeAliasDeclaration,
  UnaryExpression,
  WhileStatement,
  AgentValue,
  GoodValue,
  MarketValue,
  ArrayValue,
  ObjectValue,
  FunctionValue,
  NumberValue,
  StringValue,
  BooleanValue,
  NullValue,
  QuantityValue,
  CurrencyValue,
  TimeValue,
} from "../types.ts";
import { RuntimeError } from "../types.ts";
import {
  createEnvironment,
  defineVariable,
  getVariable,
  setVariable,
} from "./environment.ts";
import { createStdlib } from "./stdlib.ts";

class ReturnException {
  constructor(public value: RuntimeValue) {}
}

export class Interpreter {
  private globalEnv: Environment;
  private currentEnv: Environment;

  constructor() {
    this.globalEnv = createEnvironment();
    this.currentEnv = this.globalEnv;
    this.initializeStdlib();
  }

  private initializeStdlib(): void {
    const stdlib = createStdlib();
    for (const [name, value] of Object.entries(stdlib)) {
      defineVariable(this.globalEnv, name, value as RuntimeValue, true);
    }
  }

  evaluate(program: Program): RuntimeValue {
    let result: RuntimeValue = { type: "null" };

    // Process declarations
    for (const declaration of program.declarations) {
      result = this.evaluateDeclaration(declaration);
    }

    return result;
  }

  // ========================================================================
  // Declarations
  // ========================================================================

  private evaluateDeclaration(decl: Declaration): RuntimeValue {
    switch (decl.type) {
      case "AgentDeclaration":
        return this.evaluateAgentDeclaration(decl);
      case "GoodDeclaration":
        return this.evaluateGoodDeclaration(decl);
      case "MarketDeclaration":
        return this.evaluateMarketDeclaration(decl);
      case "PolicyDeclaration":
        return this.evaluatePolicyDeclaration(decl);
      case "ModelDeclaration":
        return this.evaluateModelDeclaration(decl);
      case "FunctionDeclaration":
        return this.evaluateFunctionDeclaration(decl);
      case "ConstDeclaration":
        return this.evaluateConstDeclaration(decl);
      case "TypeAliasDeclaration":
        return this.evaluateTypeAliasDeclaration(decl);
      default:
        throw new RuntimeError(`Unknown declaration type: ${(decl as Declaration).type}`);
    }
  }

  private evaluateAgentDeclaration(decl: AgentDeclaration): RuntimeValue {
    // Create agent constructor function
    const constructor: FunctionValue = {
      type: "function",
      parameters: decl.properties.map((prop) => ({
        type: "ParameterDeclaration",
        name: prop.name,
        paramType: prop.propertyType,
        optional: !!prop.defaultValue,
        defaultValue: prop.defaultValue,
      })),
      body: [],
      closure: this.currentEnv,
      pure: false,
    };

    defineVariable(this.currentEnv, decl.name, constructor, true);

    return { type: "null" };
  }

  private evaluateGoodDeclaration(decl: GoodDeclaration): RuntimeValue {
    // Create good constructor function
    const constructor: FunctionValue = {
      type: "function",
      parameters: decl.attributes.map((attr) => ({
        type: "ParameterDeclaration",
        name: attr.name,
        paramType: attr.propertyType,
        optional: !!attr.defaultValue,
        defaultValue: attr.defaultValue,
      })),
      body: [],
      closure: this.currentEnv,
      pure: false,
    };

    defineVariable(this.currentEnv, decl.name, constructor, true);

    return { type: "null" };
  }

  private evaluateMarketDeclaration(decl: MarketDeclaration): RuntimeValue {
    const market: MarketValue = {
      type: "market",
      marketType: decl.name,
      goods: decl.goods,
      orderBook: {
        bids: [],
        asks: [],
      },
      history: [],
    };

    defineVariable(this.currentEnv, decl.name, market, false);

    return { type: "null" };
  }

  private evaluatePolicyDeclaration(decl: PolicyDeclaration): RuntimeValue {
    // Create policy function
    const policyFn: FunctionValue = {
      type: "function",
      parameters: decl.parameters,
      body: [],
      closure: this.currentEnv,
      pure: false,
    };

    defineVariable(this.currentEnv, decl.name, policyFn, true);

    return { type: "null" };
  }

  private evaluateModelDeclaration(decl: ModelDeclaration): RuntimeValue {
    // Models create a simulation context
    const modelEnv = createEnvironment(this.currentEnv);
    const prevEnv = this.currentEnv;
    this.currentEnv = modelEnv;

    // Initialize model state
    const initialState = this.evaluateExpression(decl.initialState) as ObjectValue;
    const timeHorizon = this.evaluateExpression(decl.timeHorizon) as NumberValue;

    // Create agents
    const agents: AgentValue[] = [];
    for (const agentExpr of decl.agents) {
      const agent = this.evaluateExpression(agentExpr);
      if (agent.type === "agent") {
        agents.push(agent);
      }
    }

    // Store model state
    defineVariable(modelEnv, "__state__", initialState, false);
    defineVariable(modelEnv, "__agents__", { type: "array", elements: agents }, false);
    defineVariable(modelEnv, "__time__", { type: "number", value: 0 }, false);
    defineVariable(
      modelEnv,
      "__timeHorizon__",
      { type: "number", value: timeHorizon.value },
      true,
    );

    this.currentEnv = prevEnv;

    return { type: "null" };
  }

  private evaluateFunctionDeclaration(decl: FunctionDeclaration): RuntimeValue {
    const fn: FunctionValue = {
      type: "function",
      parameters: decl.parameters,
      body: decl.body,
      closure: this.currentEnv,
      pure: decl.pure,
    };

    defineVariable(this.currentEnv, decl.name, fn, true);

    return { type: "null" };
  }

  private evaluateConstDeclaration(decl: ConstDeclaration): RuntimeValue {
    const value = this.evaluateExpression(decl.value);
    defineVariable(this.currentEnv, decl.name, value, true);
    return value;
  }

  private evaluateTypeAliasDeclaration(_decl: TypeAliasDeclaration): RuntimeValue {
    // Type aliases are compile-time only, no runtime representation
    return { type: "null" };
  }

  // ========================================================================
  // Statements
  // ========================================================================

  private evaluateStatement(stmt: Statement): RuntimeValue {
    switch (stmt.type) {
      case "ExpressionStatement":
        return this.evaluateExpressionStatement(stmt);
      case "AssignmentStatement":
        return this.evaluateAssignmentStatement(stmt);
      case "IfStatement":
        return this.evaluateIfStatement(stmt);
      case "ForStatement":
        return this.evaluateForStatement(stmt);
      case "WhileStatement":
        return this.evaluateWhileStatement(stmt);
      case "ReturnStatement":
        return this.evaluateReturnStatement(stmt);
      case "BlockStatement":
        return this.evaluateBlockStatement(stmt);
      case "TransactionStatement":
        return this.evaluateTransactionStatement(stmt);
      case "EmitStatement":
        return this.evaluateEmitStatement(stmt);
      default:
        throw new RuntimeError(`Unknown statement type: ${(stmt as Statement).type}`);
    }
  }

  private evaluateExpressionStatement(stmt: ExpressionStatement): RuntimeValue {
    return this.evaluateExpression(stmt.expression);
  }

  private evaluateAssignmentStatement(stmt: AssignmentStatement): RuntimeValue {
    const value = this.evaluateExpression(stmt.value);

    if (stmt.target.type === "Identifier") {
      const name = stmt.target.name;

      if (stmt.operator === "=") {
        setVariable(this.currentEnv, name, value);
      } else {
        const current = getVariable(this.currentEnv, name);
        const newValue = this.applyCompoundAssignment(current, stmt.operator, value);
        setVariable(this.currentEnv, name, newValue);
      }

      return value;
    }

    if (stmt.target.type === "MemberExpression") {
      // Property assignment
      const object = this.evaluateExpression(stmt.target.object);

      if (object.type !== "object" && object.type !== "agent") {
        throw new RuntimeError("Cannot assign to property of non-object");
      }

      const propName = stmt.target.computed
        ? this.toString(this.evaluateExpression(stmt.target.property))
        : (stmt.target.property as Identifier).name;

      if (stmt.operator === "=") {
        object.properties.set(propName, value);
      } else {
        const current = object.properties.get(propName) || { type: "null" };
        const newValue = this.applyCompoundAssignment(current, stmt.operator, value);
        object.properties.set(propName, newValue);
      }

      return value;
    }

    throw new RuntimeError("Invalid assignment target");
  }

  private applyCompoundAssignment(
    current: RuntimeValue,
    operator: string,
    value: RuntimeValue,
  ): RuntimeValue {
    const binaryOp = operator.slice(0, -1); // Remove '=' from operator

    if (current.type === "number" && value.type === "number") {
      switch (binaryOp) {
        case "+":
          return { type: "number", value: current.value + value.value };
        case "-":
          return { type: "number", value: current.value - value.value };
        case "*":
          return { type: "number", value: current.value * value.value };
        case "/":
          return { type: "number", value: current.value / value.value };
        case "%":
          return { type: "number", value: current.value % value.value };
      }
    }

    throw new RuntimeError(`Cannot apply ${operator} to ${current.type} and ${value.type}`);
  }

  private evaluateIfStatement(stmt: IfStatement): RuntimeValue {
    const condition = this.evaluateExpression(stmt.condition);

    if (this.isTruthy(condition)) {
      return this.evaluateBlock(stmt.consequent);
    } else if (stmt.alternate) {
      return this.evaluateBlock(stmt.alternate);
    }

    return { type: "null" };
  }

  private evaluateForStatement(stmt: ForStatement): RuntimeValue {
    const iterator = this.evaluateExpression(stmt.iterator);

    const loopEnv = createEnvironment(this.currentEnv);
    const prevEnv = this.currentEnv;
    this.currentEnv = loopEnv;

    let result: RuntimeValue = { type: "null" };

    if (iterator.type === "array") {
      for (const element of iterator.elements) {
        defineVariable(loopEnv, stmt.variable, element, true);
        result = this.evaluateBlock(stmt.body);
      }
    } else if (iterator.type === "object") {
      for (const [key, value] of iterator.properties.entries()) {
        defineVariable(loopEnv, stmt.variable, { type: "string", value: key }, true);
        result = this.evaluateBlock(stmt.body);
      }
    } else {
      throw new RuntimeError(`Cannot iterate over ${iterator.type}`);
    }

    this.currentEnv = prevEnv;

    return result;
  }

  private evaluateWhileStatement(stmt: WhileStatement): RuntimeValue {
    let result: RuntimeValue = { type: "null" };

    while (this.isTruthy(this.evaluateExpression(stmt.condition))) {
      result = this.evaluateBlock(stmt.body);
    }

    return result;
  }

  private evaluateReturnStatement(stmt: ReturnStatement): RuntimeValue {
    const value = stmt.value ? this.evaluateExpression(stmt.value) : { type: "null" };
    throw new ReturnException(value);
  }

  private evaluateBlockStatement(stmt: { statements: Statement[] }): RuntimeValue {
    return this.evaluateBlock(stmt.statements);
  }

  private evaluateBlock(statements: Statement[]): RuntimeValue {
    let result: RuntimeValue = { type: "null" };

    for (const stmt of statements) {
      result = this.evaluateStatement(stmt);
    }

    return result;
  }

  private evaluateTransactionStatement(stmt: TransactionStatement): RuntimeValue {
    const from = this.evaluateExpression(stmt.from);
    const to = this.evaluateExpression(stmt.to);
    const good = this.evaluateExpression(stmt.good);
    const quantity = this.evaluateExpression(stmt.quantity);
    const price = stmt.price ? this.evaluateExpression(stmt.price) : undefined;

    // In a full implementation, this would update agent holdings and market state
    // For now, just log the transaction
    console.log("Transaction:", { from, to, good, quantity, price });

    return { type: "null" };
  }

  private evaluateEmitStatement(stmt: EmitStatement): RuntimeValue {
    const data = this.evaluateExpression(stmt.data);

    // In a full implementation, this would trigger event handlers
    console.log(`Event: ${stmt.event}`, data);

    return { type: "null" };
  }

  // ========================================================================
  // Expressions
  // ========================================================================

  private evaluateExpression(expr: Expression): RuntimeValue {
    switch (expr.type) {
      case "Literal":
        return this.evaluateLiteral(expr);
      case "Identifier":
        return this.evaluateIdentifier(expr);
      case "BinaryExpression":
        return this.evaluateBinaryExpression(expr);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(expr);
      case "CallExpression":
        return this.evaluateCallExpression(expr);
      case "MemberExpression":
        return this.evaluateMemberExpression(expr);
      case "ArrayExpression":
        return this.evaluateArrayExpression(expr);
      case "ObjectExpression":
        return this.evaluateObjectExpression(expr);
      case "LambdaExpression":
        return this.evaluateLambdaExpression(expr);
      case "ConditionalExpression":
        return this.evaluateConditionalExpression(expr);
      case "QuantityExpression":
        return this.evaluateQuantityExpression(expr);
      case "CurrencyExpression":
        return this.evaluateCurrencyExpression(expr);
      case "TimeExpression":
        return this.evaluateTimeExpression(expr);
      case "RangeExpression":
        return this.evaluateRangeExpression(expr);
      case "ComprehensionExpression":
        return this.evaluateComprehensionExpression(expr);
      default:
        throw new RuntimeError(`Unknown expression type: ${(expr as Expression).type}`);
    }
  }

  private evaluateLiteral(expr: Literal): RuntimeValue {
    if (typeof expr.value === "number") {
      return { type: "number", value: expr.value };
    }
    if (typeof expr.value === "string") {
      return { type: "string", value: expr.value };
    }
    if (typeof expr.value === "boolean") {
      return { type: "boolean", value: expr.value };
    }
    return { type: "null" };
  }

  private evaluateIdentifier(expr: Identifier): RuntimeValue {
    return getVariable(this.currentEnv, expr.name);
  }

  private evaluateBinaryExpression(expr: BinaryExpression): RuntimeValue {
    const left = this.evaluateExpression(expr.left);
    const right = this.evaluateExpression(expr.right);

    // Arithmetic
    if (left.type === "number" && right.type === "number") {
      switch (expr.operator) {
        case "+":
          return { type: "number", value: left.value + right.value };
        case "-":
          return { type: "number", value: left.value - right.value };
        case "*":
          return { type: "number", value: left.value * right.value };
        case "/":
          if (right.value === 0) {
            throw new RuntimeError("Division by zero");
          }
          return { type: "number", value: left.value / right.value };
        case "%":
          return { type: "number", value: left.value % right.value };
        case "**":
          return { type: "number", value: Math.pow(left.value, right.value) };
        case "<":
          return { type: "boolean", value: left.value < right.value };
        case ">":
          return { type: "boolean", value: left.value > right.value };
        case "<=":
          return { type: "boolean", value: left.value <= right.value };
        case ">=":
          return { type: "boolean", value: left.value >= right.value };
      }
    }

    // String concatenation
    if (expr.operator === "+") {
      if (left.type === "string" || right.type === "string") {
        return {
          type: "string",
          value: this.toString(left) + this.toString(right),
        };
      }
    }

    // Equality
    if (expr.operator === "==") {
      return { type: "boolean", value: this.isEqual(left, right) };
    }
    if (expr.operator === "!=") {
      return { type: "boolean", value: !this.isEqual(left, right) };
    }

    // Logical
    if (expr.operator === "&&") {
      return this.isTruthy(left) ? right : left;
    }
    if (expr.operator === "||") {
      return this.isTruthy(left) ? left : right;
    }
    if (expr.operator === "??") {
      return left.type !== "null" ? left : right;
    }

    throw new RuntimeError(
      `Cannot apply operator ${expr.operator} to ${left.type} and ${right.type}`,
    );
  }

  private evaluateUnaryExpression(expr: UnaryExpression): RuntimeValue {
    const arg = this.evaluateExpression(expr.argument);

    switch (expr.operator) {
      case "+":
        if (arg.type === "number") return arg;
        throw new RuntimeError(`Cannot apply unary + to ${arg.type}`);
      case "-":
        if (arg.type === "number") {
          return { type: "number", value: -arg.value };
        }
        throw new RuntimeError(`Cannot apply unary - to ${arg.type}`);
      case "!":
      case "not":
        return { type: "boolean", value: !this.isTruthy(arg) };
      default:
        throw new RuntimeError(`Unknown unary operator: ${expr.operator}`);
    }
  }

  private evaluateCallExpression(expr: CallExpression): RuntimeValue {
    const callee = this.evaluateExpression(expr.callee);

    if (callee.type !== "function") {
      throw new RuntimeError("Cannot call non-function value");
    }

    const args = expr.args.map((arg) => this.evaluateExpression(arg));

    return this.callFunction(callee, args);
  }

  private callFunction(fn: FunctionValue, args: RuntimeValue[]): RuntimeValue {
    const fnEnv = createEnvironment(fn.closure);

    // Bind parameters
    for (let i = 0; i < fn.parameters.length; i++) {
      const param = fn.parameters[i];
      const arg = i < args.length
        ? args[i]
        : param.defaultValue
        ? this.evaluateExpression(param.defaultValue)
        : { type: "null" };

      defineVariable(fnEnv, param.name, arg, true);
    }

    const prevEnv = this.currentEnv;
    this.currentEnv = fnEnv;

    try {
      this.evaluateBlock(fn.body);
      this.currentEnv = prevEnv;
      return { type: "null" };
    } catch (e) {
      this.currentEnv = prevEnv;
      if (e instanceof ReturnException) {
        return e.value;
      }
      throw e;
    }
  }

  private evaluateMemberExpression(expr: MemberExpression): RuntimeValue {
    const object = this.evaluateExpression(expr.object);

    if (object.type !== "object" && object.type !== "agent" && object.type !== "good") {
      throw new RuntimeError(`Cannot access property of ${object.type}`);
    }

    const propName = expr.computed
      ? this.toString(this.evaluateExpression(expr.property))
      : (expr.property as Identifier).name;

    const value = object.properties.get(propName);
    if (!value) {
      throw new RuntimeError(`Property '${propName}' does not exist`);
    }

    return value;
  }

  private evaluateArrayExpression(expr: ArrayExpression): RuntimeValue {
    const elements = expr.elements.map((el) => this.evaluateExpression(el));

    return {
      type: "array",
      elements,
    };
  }

  private evaluateObjectExpression(expr: ObjectExpression): RuntimeValue {
    const properties = new Map<string, RuntimeValue>();

    for (const prop of expr.properties) {
      const key = prop.computed
        ? this.toString(this.evaluateExpression(prop.key))
        : (prop.key as Identifier).name;
      const value = this.evaluateExpression(prop.value);

      properties.set(key, value);
    }

    return {
      type: "object",
      properties,
    };
  }

  private evaluateLambdaExpression(expr: LambdaExpression): RuntimeValue {
    const body = Array.isArray(expr.body)
      ? expr.body
      : [{ type: "ReturnStatement" as const, value: expr.body }];

    return {
      type: "function",
      parameters: expr.parameters,
      body,
      closure: this.currentEnv,
      pure: true,
    };
  }

  private evaluateConditionalExpression(expr: ConditionalExpression): RuntimeValue {
    const condition = this.evaluateExpression(expr.condition);

    return this.isTruthy(condition)
      ? this.evaluateExpression(expr.consequent)
      : this.evaluateExpression(expr.alternate);
  }

  private evaluateQuantityExpression(expr: QuantityExpression): RuntimeValue {
    const amount = this.evaluateExpression(expr.amount);

    if (amount.type !== "number") {
      throw new RuntimeError("Quantity amount must be a number");
    }

    return {
      type: "quantity",
      amount: amount.value,
      unit: expr.unit,
    };
  }

  private evaluateCurrencyExpression(expr: CurrencyExpression): RuntimeValue {
    const amount = this.evaluateExpression(expr.amount);

    if (amount.type !== "number") {
      throw new RuntimeError("Currency amount must be a number");
    }

    return {
      type: "currency",
      amount: amount.value,
      currency: expr.currency,
    };
  }

  private evaluateTimeExpression(expr: TimeExpression): RuntimeValue {
    const value = this.evaluateExpression(expr.value);

    if (value.type !== "number") {
      throw new RuntimeError("Time value must be a number");
    }

    return {
      type: "time",
      value: value.value,
      unit: expr.unit,
    };
  }

  private evaluateRangeExpression(expr: RangeExpression): RuntimeValue {
    const start = this.evaluateExpression(expr.start);
    const end = this.evaluateExpression(expr.end);

    if (start.type !== "number" || end.type !== "number") {
      throw new RuntimeError("Range bounds must be numbers");
    }

    const step = expr.step
      ? this.evaluateExpression(expr.step)
      : { type: "number" as const, value: 1 };

    if (step.type !== "number") {
      throw new RuntimeError("Range step must be a number");
    }

    const elements: NumberValue[] = [];
    const endValue = expr.inclusive ? end.value + 1 : end.value;

    for (let i = start.value; i < endValue; i += step.value) {
      elements.push({ type: "number", value: i });
    }

    return {
      type: "array",
      elements,
    };
  }

  private evaluateComprehensionExpression(expr: ComprehensionExpression): RuntimeValue {
    const iterator = this.evaluateExpression(expr.iterator);

    if (iterator.type !== "array") {
      throw new RuntimeError("Comprehension iterator must be an array");
    }

    const compEnv = createEnvironment(this.currentEnv);
    const prevEnv = this.currentEnv;
    this.currentEnv = compEnv;

    const elements: RuntimeValue[] = [];

    for (const item of iterator.elements) {
      defineVariable(compEnv, expr.variable, item, true);

      if (expr.condition) {
        const condition = this.evaluateExpression(expr.condition);
        if (!this.isTruthy(condition)) {
          continue;
        }
      }

      const element = this.evaluateExpression(expr.element);
      elements.push(element);
    }

    this.currentEnv = prevEnv;

    return {
      type: "array",
      elements,
    };
  }

  // ========================================================================
  // Helper methods
  // ========================================================================

  private isTruthy(value: RuntimeValue): boolean {
    if (value.type === "boolean") return value.value;
    if (value.type === "null") return false;
    if (value.type === "number") return value.value !== 0;
    if (value.type === "string") return value.value !== "";
    return true;
  }

  private isEqual(left: RuntimeValue, right: RuntimeValue): boolean {
    if (left.type !== right.type) return false;

    switch (left.type) {
      case "null":
        return true;
      case "boolean":
        return left.value === (right as BooleanValue).value;
      case "number":
        return left.value === (right as NumberValue).value;
      case "string":
        return left.value === (right as StringValue).value;
      default:
        return false; // Objects/arrays compared by reference
    }
  }

  private toString(value: RuntimeValue): string {
    switch (value.type) {
      case "null":
        return "null";
      case "boolean":
        return value.value.toString();
      case "number":
        return value.value.toString();
      case "string":
        return value.value;
      case "array":
        return `[${value.elements.map((el) => this.toString(el)).join(", ")}]`;
      case "object":
        return "{...}";
      case "function":
        return "<function>";
      case "agent":
        return `<agent:${value.agentType}>`;
      case "good":
        return `<good:${value.goodType}>`;
      case "market":
        return `<market:${value.marketType}>`;
      case "quantity":
        return `${value.amount}${value.unit}`;
      case "currency":
        return `${value.amount}${value.currency}`;
      case "time":
        return `${value.value}${value.unit}`;
      default:
        return "<unknown>";
    }
  }
}

export function interpret(program: Program): RuntimeValue {
  const interpreter = new Interpreter();
  return interpreter.evaluate(program);
}
