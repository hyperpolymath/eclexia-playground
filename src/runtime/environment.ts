/**
 * Environment for variable bindings and scopes
 */

import type { Environment, RuntimeValue } from "../types.ts";
import { RuntimeError } from "../types.ts";

export function createEnvironment(parent?: Environment): Environment {
  return {
    parent,
    variables: new Map(),
    constants: new Set(),
  };
}

export function defineVariable(
  env: Environment,
  name: string,
  value: RuntimeValue,
  constant = false,
): void {
  if (env.variables.has(name)) {
    throw new RuntimeError(`Variable '${name}' is already defined`);
  }

  env.variables.set(name, value);
  if (constant) {
    env.constants.add(name);
  }
}

export function getVariable(env: Environment, name: string): RuntimeValue {
  if (env.variables.has(name)) {
    return env.variables.get(name)!;
  }

  if (env.parent) {
    return getVariable(env.parent, name);
  }

  throw new RuntimeError(`Undefined variable '${name}'`);
}

export function setVariable(
  env: Environment,
  name: string,
  value: RuntimeValue,
): void {
  if (env.variables.has(name)) {
    if (env.constants.has(name)) {
      throw new RuntimeError(`Cannot reassign constant '${name}'`);
    }
    env.variables.set(name, value);
    return;
  }

  if (env.parent) {
    setVariable(env.parent, name, value);
    return;
  }

  throw new RuntimeError(`Undefined variable '${name}'`);
}

export function hasVariable(env: Environment, name: string): boolean {
  if (env.variables.has(name)) {
    return true;
  }

  if (env.parent) {
    return hasVariable(env.parent, name);
  }

  return false;
}
