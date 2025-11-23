/**
 * Core type definitions for the Eclexia language
 * Economics-as-Code DSL for modeling economic systems
 */

// ============================================================================
// Source Location Tracking
// ============================================================================

export interface SourceLocation {
  line: number;
  column: number;
  offset: number;
}

export interface SourceSpan {
  start: SourceLocation;
  end: SourceLocation;
  source?: string;
}

// ============================================================================
// AST Node Types
// ============================================================================

export type ASTNode =
  | Program
  | Declaration
  | Expression
  | Statement
  | TypeNode;

export interface BaseNode {
  type: string;
  span?: SourceSpan;
}

// ============================================================================
// Program Structure
// ============================================================================

export interface Program extends BaseNode {
  type: "Program";
  declarations: Declaration[];
  imports: ImportDeclaration[];
  exports: ExportDeclaration[];
}

// ============================================================================
// Declarations
// ============================================================================

export type Declaration =
  | AgentDeclaration
  | GoodDeclaration
  | MarketDeclaration
  | PolicyDeclaration
  | ModelDeclaration
  | FunctionDeclaration
  | ConstDeclaration
  | TypeAliasDeclaration;

export interface AgentDeclaration extends BaseNode {
  type: "AgentDeclaration";
  name: string;
  properties: PropertyDeclaration[];
  behaviors: BehaviorDeclaration[];
  constraints?: Expression[];
}

export interface PropertyDeclaration extends BaseNode {
  type: "PropertyDeclaration";
  name: string;
  propertyType: TypeNode;
  defaultValue?: Expression;
  mutable: boolean;
}

export interface BehaviorDeclaration extends BaseNode {
  type: "BehaviorDeclaration";
  name: string;
  parameters: ParameterDeclaration[];
  returnType?: TypeNode;
  body: Statement[];
  triggers?: TriggerExpression[];
}

export interface TriggerExpression extends BaseNode {
  type: "TriggerExpression";
  event: string;
  condition?: Expression;
}

export interface GoodDeclaration extends BaseNode {
  type: "GoodDeclaration";
  name: string;
  attributes: PropertyDeclaration[];
  fungible: boolean;
  divisible: boolean;
}

export interface MarketDeclaration extends BaseNode {
  type: "MarketDeclaration";
  name: string;
  goods: string[];
  mechanism: MarketMechanism;
  rules: Expression[];
}

export type MarketMechanism =
  | "auction"
  | "double-auction"
  | "posted-price"
  | "bargaining"
  | "custom";

export interface PolicyDeclaration extends BaseNode {
  type: "PolicyDeclaration";
  name: string;
  parameters: ParameterDeclaration[];
  effects: EffectDeclaration[];
  duration?: Expression;
}

export interface EffectDeclaration extends BaseNode {
  type: "EffectDeclaration";
  target: Expression;
  modification: Expression;
  condition?: Expression;
}

export interface ModelDeclaration extends BaseNode {
  type: "ModelDeclaration";
  name: string;
  timeHorizon: Expression;
  agents: Expression[];
  markets: Expression[];
  policies: Expression[];
  initialState: ObjectExpression;
  dynamics: DynamicRule[];
}

export interface DynamicRule extends BaseNode {
  type: "DynamicRule";
  frequency: Expression;
  action: Statement;
}

export interface FunctionDeclaration extends BaseNode {
  type: "FunctionDeclaration";
  name: string;
  parameters: ParameterDeclaration[];
  returnType?: TypeNode;
  body: Statement[];
  pure: boolean;
}

export interface ParameterDeclaration extends BaseNode {
  type: "ParameterDeclaration";
  name: string;
  paramType: TypeNode;
  defaultValue?: Expression;
  optional: boolean;
}

export interface ConstDeclaration extends BaseNode {
  type: "ConstDeclaration";
  name: string;
  valueType?: TypeNode;
  value: Expression;
}

export interface TypeAliasDeclaration extends BaseNode {
  type: "TypeAliasDeclaration";
  name: string;
  typeParams?: string[];
  aliasedType: TypeNode;
}

export interface ImportDeclaration extends BaseNode {
  type: "ImportDeclaration";
  items: string[];
  from: string;
  alias?: string;
}

export interface ExportDeclaration extends BaseNode {
  type: "ExportDeclaration";
  declaration?: Declaration;
  items?: string[];
}

// ============================================================================
// Type Nodes
// ============================================================================

export type TypeNode =
  | PrimitiveType
  | ArrayType
  | TupleType
  | ObjectType
  | FunctionType
  | UnionType
  | IntersectionType
  | GenericType
  | TypeReference;

export interface PrimitiveType extends BaseNode {
  type: "PrimitiveType";
  kind: "number" | "string" | "boolean" | "currency" | "quantity" | "time" | "void";
}

export interface ArrayType extends BaseNode {
  type: "ArrayType";
  elementType: TypeNode;
}

export interface TupleType extends BaseNode {
  type: "TupleType";
  elementTypes: TypeNode[];
}

export interface ObjectType extends BaseNode {
  type: "ObjectType";
  properties: PropertySignature[];
}

export interface PropertySignature extends BaseNode {
  type: "PropertySignature";
  name: string;
  propertyType: TypeNode;
  optional: boolean;
  readonly: boolean;
}

export interface FunctionType extends BaseNode {
  type: "FunctionType";
  parameters: TypeNode[];
  returnType: TypeNode;
}

export interface UnionType extends BaseNode {
  type: "UnionType";
  types: TypeNode[];
}

export interface IntersectionType extends BaseNode {
  type: "IntersectionType";
  types: TypeNode[];
}

export interface GenericType extends BaseNode {
  type: "GenericType";
  name: string;
  typeArgs: TypeNode[];
}

export interface TypeReference extends BaseNode {
  type: "TypeReference";
  name: string;
}

// ============================================================================
// Expressions
// ============================================================================

export type Expression =
  | Literal
  | Identifier
  | BinaryExpression
  | UnaryExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression
  | ObjectExpression
  | LambdaExpression
  | ConditionalExpression
  | QuantityExpression
  | CurrencyExpression
  | TimeExpression
  | RangeExpression
  | ComprehensionExpression;

export interface Literal extends BaseNode {
  type: "Literal";
  value: number | string | boolean | null;
  raw: string;
}

export interface Identifier extends BaseNode {
  type: "Identifier";
  name: string;
}

export interface BinaryExpression extends BaseNode {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "**"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | "&&"
  | "||"
  | "??"
  | "in"
  | "not in";

export interface UnaryExpression extends BaseNode {
  type: "UnaryExpression";
  operator: UnaryOperator;
  argument: Expression;
}

export type UnaryOperator = "+" | "-" | "!" | "not";

export interface CallExpression extends BaseNode {
  type: "CallExpression";
  callee: Expression;
  args: Expression[];
}

export interface MemberExpression extends BaseNode {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
}

export interface ArrayExpression extends BaseNode {
  type: "ArrayExpression";
  elements: Expression[];
}

export interface ObjectExpression extends BaseNode {
  type: "ObjectExpression";
  properties: PropertyExpression[];
}

export interface PropertyExpression extends BaseNode {
  type: "PropertyExpression";
  key: Expression;
  value: Expression;
  computed: boolean;
}

export interface LambdaExpression extends BaseNode {
  type: "LambdaExpression";
  parameters: ParameterDeclaration[];
  body: Expression | Statement[];
  returnType?: TypeNode;
}

export interface ConditionalExpression extends BaseNode {
  type: "ConditionalExpression";
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface QuantityExpression extends BaseNode {
  type: "QuantityExpression";
  amount: Expression;
  unit: string;
}

export interface CurrencyExpression extends BaseNode {
  type: "CurrencyExpression";
  amount: Expression;
  currency: string;
}

export interface TimeExpression extends BaseNode {
  type: "TimeExpression";
  value: Expression;
  unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "year" | "tick";
}

export interface RangeExpression extends BaseNode {
  type: "RangeExpression";
  start: Expression;
  end: Expression;
  step?: Expression;
  inclusive: boolean;
}

export interface ComprehensionExpression extends BaseNode {
  type: "ComprehensionExpression";
  element: Expression;
  variable: string;
  iterator: Expression;
  condition?: Expression;
}

// ============================================================================
// Statements
// ============================================================================

export type Statement =
  | ExpressionStatement
  | AssignmentStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | ReturnStatement
  | BlockStatement
  | TransactionStatement
  | EmitStatement;

export interface ExpressionStatement extends BaseNode {
  type: "ExpressionStatement";
  expression: Expression;
}

export interface AssignmentStatement extends BaseNode {
  type: "AssignmentStatement";
  target: Expression;
  operator: AssignmentOperator;
  value: Expression;
}

export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=";

export interface IfStatement extends BaseNode {
  type: "IfStatement";
  condition: Expression;
  consequent: Statement[];
  alternate?: Statement[];
}

export interface ForStatement extends BaseNode {
  type: "ForStatement";
  variable: string;
  iterator: Expression;
  body: Statement[];
}

export interface WhileStatement extends BaseNode {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
}

export interface ReturnStatement extends BaseNode {
  type: "ReturnStatement";
  value?: Expression;
}

export interface BlockStatement extends BaseNode {
  type: "BlockStatement";
  statements: Statement[];
}

export interface TransactionStatement extends BaseNode {
  type: "TransactionStatement";
  from: Expression;
  to: Expression;
  good: Expression;
  quantity: Expression;
  price?: Expression;
}

export interface EmitStatement extends BaseNode {
  type: "EmitStatement";
  event: string;
  data: Expression;
}

// ============================================================================
// Runtime Values
// ============================================================================

export type RuntimeValue =
  | NumberValue
  | StringValue
  | BooleanValue
  | NullValue
  | ArrayValue
  | ObjectValue
  | FunctionValue
  | AgentValue
  | GoodValue
  | MarketValue
  | QuantityValue
  | CurrencyValue
  | TimeValue;

export interface BaseValue {
  type: string;
}

export interface NumberValue extends BaseValue {
  type: "number";
  value: number;
}

export interface StringValue extends BaseValue {
  type: "string";
  value: string;
}

export interface BooleanValue extends BaseValue {
  type: "boolean";
  value: boolean;
}

export interface NullValue extends BaseValue {
  type: "null";
}

export interface ArrayValue extends BaseValue {
  type: "array";
  elements: RuntimeValue[];
}

export interface ObjectValue extends BaseValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

export interface FunctionValue extends BaseValue {
  type: "function";
  parameters: ParameterDeclaration[];
  body: Statement[];
  closure: Environment;
  pure: boolean;
}

export interface AgentValue extends BaseValue {
  type: "agent";
  agentType: string;
  properties: Map<string, RuntimeValue>;
  behaviors: Map<string, FunctionValue>;
  id: string;
}

export interface GoodValue extends BaseValue {
  type: "good";
  goodType: string;
  attributes: Map<string, RuntimeValue>;
  quantity: number;
  id: string;
}

export interface MarketValue extends BaseValue {
  type: "market";
  marketType: string;
  goods: string[];
  orderBook: OrderBook;
  history: Transaction[];
}

export interface QuantityValue extends BaseValue {
  type: "quantity";
  amount: number;
  unit: string;
}

export interface CurrencyValue extends BaseValue {
  type: "currency";
  amount: number;
  currency: string;
}

export interface TimeValue extends BaseValue {
  type: "time";
  value: number;
  unit: string;
}

// ============================================================================
// Runtime Support Types
// ============================================================================

export interface Environment {
  parent?: Environment;
  variables: Map<string, RuntimeValue>;
  constants: Set<string>;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}

export interface Order {
  agent: string;
  good: string;
  quantity: number;
  price: number;
  timestamp: number;
}

export interface Transaction {
  buyer: string;
  seller: string;
  good: string;
  quantity: number;
  price: number;
  timestamp: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class EclexiaError extends Error {
  constructor(
    message: string,
    public span?: SourceSpan,
    public code?: string,
  ) {
    super(message);
    this.name = "EclexiaError";
  }
}

export class SyntaxError extends EclexiaError {
  constructor(message: string, span?: SourceSpan) {
    super(message, span, "SYNTAX_ERROR");
    this.name = "SyntaxError";
  }
}

export class TypeError extends EclexiaError {
  constructor(message: string, span?: SourceSpan) {
    super(message, span, "TYPE_ERROR");
    this.name = "TypeError";
  }
}

export class RuntimeError extends EclexiaError {
  constructor(message: string, span?: SourceSpan) {
    super(message, span, "RUNTIME_ERROR");
    this.name = "RuntimeError";
  }
}

export class ValidationError extends EclexiaError {
  constructor(message: string, span?: SourceSpan) {
    super(message, span, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
