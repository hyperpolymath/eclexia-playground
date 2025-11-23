/**
 * Standard library for Eclexia
 * Provides built-in functions for economics and general programming
 */

import type { FunctionValue, RuntimeValue, Environment } from "../types.ts";
import { RuntimeError } from "../types.ts";

type NativeFunction = (...args: RuntimeValue[]) => RuntimeValue;

function createNativeFunction(fn: NativeFunction): FunctionValue {
  return {
    type: "function",
    parameters: [],
    body: [],
    closure: { variables: new Map(), constants: new Set() },
    pure: true,
    __native: fn as unknown as never, // Hack for native functions
  } as FunctionValue & { __native: NativeFunction };
}

export function createStdlib(): Record<string, RuntimeValue> {
  return {
    // ====================================================================
    // Math functions
    // ====================================================================
    abs: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("abs() requires a number");
      return { type: "number", value: Math.abs(x.value) };
    }),

    ceil: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("ceil() requires a number");
      return { type: "number", value: Math.ceil(x.value) };
    }),

    floor: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("floor() requires a number");
      return { type: "number", value: Math.floor(x.value) };
    }),

    round: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("round() requires a number");
      return { type: "number", value: Math.round(x.value) };
    }),

    sqrt: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("sqrt() requires a number");
      return { type: "number", value: Math.sqrt(x.value) };
    }),

    pow: createNativeFunction((base, exp) => {
      if (base.type !== "number" || exp.type !== "number") {
        throw new RuntimeError("pow() requires two numbers");
      }
      return { type: "number", value: Math.pow(base.value, exp.value) };
    }),

    log: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("log() requires a number");
      return { type: "number", value: Math.log(x.value) };
    }),

    exp: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("exp() requires a number");
      return { type: "number", value: Math.exp(x.value) };
    }),

    sin: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("sin() requires a number");
      return { type: "number", value: Math.sin(x.value) };
    }),

    cos: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("cos() requires a number");
      return { type: "number", value: Math.cos(x.value) };
    }),

    tan: createNativeFunction((x) => {
      if (x.type !== "number") throw new RuntimeError("tan() requires a number");
      return { type: "number", value: Math.tan(x.value) };
    }),

    min: createNativeFunction((...args) => {
      if (args.length === 0) throw new RuntimeError("min() requires at least one argument");
      if (args[0].type === "array") {
        const arr = args[0].elements;
        if (arr.length === 0) throw new RuntimeError("min() requires non-empty array");
        let min = arr[0];
        for (let i = 1; i < arr.length; i++) {
          if (arr[i].type === "number" && min.type === "number" && arr[i].value < min.value) {
            min = arr[i];
          }
        }
        return min;
      }
      let min = args[0];
      for (let i = 1; i < args.length; i++) {
        if (args[i].type === "number" && min.type === "number" && args[i].value < min.value) {
          min = args[i];
        }
      }
      return min;
    }),

    max: createNativeFunction((...args) => {
      if (args.length === 0) throw new RuntimeError("max() requires at least one argument");
      if (args[0].type === "array") {
        const arr = args[0].elements;
        if (arr.length === 0) throw new RuntimeError("max() requires non-empty array");
        let max = arr[0];
        for (let i = 1; i < arr.length; i++) {
          if (arr[i].type === "number" && max.type === "number" && arr[i].value > max.value) {
            max = arr[i];
          }
        }
        return max;
      }
      let max = args[0];
      for (let i = 1; i < args.length; i++) {
        if (args[i].type === "number" && max.type === "number" && args[i].value > max.value) {
          max = args[i];
        }
      }
      return max;
    }),

    random: createNativeFunction(() => {
      return { type: "number", value: Math.random() };
    }),

    // ====================================================================
    // Array functions
    // ====================================================================
    length: createNativeFunction((arr) => {
      if (arr.type === "array") {
        return { type: "number", value: arr.elements.length };
      }
      if (arr.type === "string") {
        return { type: "number", value: arr.value.length };
      }
      throw new RuntimeError("length() requires array or string");
    }),

    sum: createNativeFunction((arr) => {
      if (arr.type !== "array") throw new RuntimeError("sum() requires an array");
      let total = 0;
      for (const el of arr.elements) {
        if (el.type === "number") {
          total += el.value;
        }
      }
      return { type: "number", value: total };
    }),

    mean: createNativeFunction((arr) => {
      if (arr.type !== "array") throw new RuntimeError("mean() requires an array");
      if (arr.elements.length === 0) throw new RuntimeError("Cannot compute mean of empty array");
      let total = 0;
      for (const el of arr.elements) {
        if (el.type === "number") {
          total += el.value;
        }
      }
      return { type: "number", value: total / arr.elements.length };
    }),

    median: createNativeFunction((arr) => {
      if (arr.type !== "array") throw new RuntimeError("median() requires an array");
      if (arr.elements.length === 0) {
        throw new RuntimeError("Cannot compute median of empty array");
      }
      const numbers = arr.elements
        .filter((el) => el.type === "number")
        .map((el) => (el as { type: "number"; value: number }).value)
        .sort((a, b) => a - b);
      const mid = Math.floor(numbers.length / 2);
      const value = numbers.length % 2 === 0
        ? (numbers[mid - 1] + numbers[mid]) / 2
        : numbers[mid];
      return { type: "number", value };
    }),

    variance: createNativeFunction((arr) => {
      if (arr.type !== "array") throw new RuntimeError("variance() requires an array");
      if (arr.elements.length === 0) {
        throw new RuntimeError("Cannot compute variance of empty array");
      }
      const numbers = arr.elements
        .filter((el) => el.type === "number")
        .map((el) => (el as { type: "number"; value: number }).value);
      const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        numbers.length;
      return { type: "number", value: variance };
    }),

    stddev: createNativeFunction((arr) => {
      if (arr.type !== "array") throw new RuntimeError("stddev() requires an array");
      if (arr.elements.length === 0) {
        throw new RuntimeError("Cannot compute stddev of empty array");
      }
      const numbers = arr.elements
        .filter((el) => el.type === "number")
        .map((el) => (el as { type: "number"; value: number }).value);
      const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        numbers.length;
      return { type: "number", value: Math.sqrt(variance) };
    }),

    // ====================================================================
    // Economics functions
    // ====================================================================
    presentValue: createNativeFunction((futureValue, rate, periods) => {
      if (
        futureValue.type !== "number" || rate.type !== "number" || periods.type !== "number"
      ) {
        throw new RuntimeError("presentValue() requires three numbers");
      }
      const pv = futureValue.value / Math.pow(1 + rate.value, periods.value);
      return { type: "number", value: pv };
    }),

    futureValue: createNativeFunction((presentValue, rate, periods) => {
      if (
        presentValue.type !== "number" || rate.type !== "number" || periods.type !== "number"
      ) {
        throw new RuntimeError("futureValue() requires three numbers");
      }
      const fv = presentValue.value * Math.pow(1 + rate.value, periods.value);
      return { type: "number", value: fv };
    }),

    npv: createNativeFunction((rate, cashFlows) => {
      if (rate.type !== "number") throw new RuntimeError("npv() rate must be a number");
      if (cashFlows.type !== "array") throw new RuntimeError("npv() cashFlows must be an array");

      let npv = 0;
      for (let i = 0; i < cashFlows.elements.length; i++) {
        const cf = cashFlows.elements[i];
        if (cf.type !== "number") {
          throw new RuntimeError("All cash flows must be numbers");
        }
        npv += cf.value / Math.pow(1 + rate.value, i + 1);
      }
      return { type: "number", value: npv };
    }),

    irr: createNativeFunction((cashFlows) => {
      if (cashFlows.type !== "array") throw new RuntimeError("irr() requires an array");

      const flows = cashFlows.elements.map((cf) => {
        if (cf.type !== "number") throw new RuntimeError("All cash flows must be numbers");
        return cf.value;
      });

      // Newton-Raphson method for IRR
      let rate = 0.1;
      const maxIterations = 100;
      const tolerance = 1e-6;

      for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let dnpv = 0;

        for (let t = 0; t < flows.length; t++) {
          npv += flows[t] / Math.pow(1 + rate, t);
          dnpv -= t * flows[t] / Math.pow(1 + rate, t + 1);
        }

        const newRate = rate - npv / dnpv;

        if (Math.abs(newRate - rate) < tolerance) {
          return { type: "number", value: newRate };
        }

        rate = newRate;
      }

      throw new RuntimeError("IRR did not converge");
    }),

    compoundInterest: createNativeFunction((principal, rate, time, n) => {
      if (
        principal.type !== "number" || rate.type !== "number" ||
        time.type !== "number" || n.type !== "number"
      ) {
        throw new RuntimeError("compoundInterest() requires four numbers");
      }
      const amount = principal.value *
        Math.pow(1 + rate.value / n.value, n.value * time.value);
      return { type: "number", value: amount };
    }),

    // Utility theory
    logarithmicUtility: createNativeFunction((wealth) => {
      if (wealth.type !== "number") {
        throw new RuntimeError("logarithmicUtility() requires a number");
      }
      if (wealth.value <= 0) {
        throw new RuntimeError("Wealth must be positive for logarithmic utility");
      }
      return { type: "number", value: Math.log(wealth.value) };
    }),

    powerUtility: createNativeFunction((wealth, gamma) => {
      if (wealth.type !== "number" || gamma.type !== "number") {
        throw new RuntimeError("powerUtility() requires two numbers");
      }
      if (gamma.value === 1) {
        return { type: "number", value: Math.log(wealth.value) };
      }
      return { type: "number", value: Math.pow(wealth.value, 1 - gamma.value) / (1 - gamma.value) };
    }),

    // Elasticity
    priceElasticity: createNativeFunction((q1, q2, p1, p2) => {
      if (
        q1.type !== "number" || q2.type !== "number" ||
        p1.type !== "number" || p2.type !== "number"
      ) {
        throw new RuntimeError("priceElasticity() requires four numbers");
      }
      const percentChangeQ = (q2.value - q1.value) / q1.value;
      const percentChangeP = (p2.value - p1.value) / p1.value;
      return { type: "number", value: percentChangeQ / percentChangeP };
    }),

    // ====================================================================
    // String functions
    // ====================================================================
    toLowerCase: createNativeFunction((str) => {
      if (str.type !== "string") throw new RuntimeError("toLowerCase() requires a string");
      return { type: "string", value: str.value.toLowerCase() };
    }),

    toUpperCase: createNativeFunction((str) => {
      if (str.type !== "string") throw new RuntimeError("toUpperCase() requires a string");
      return { type: "string", value: str.value.toUpperCase() };
    }),

    substring: createNativeFunction((str, start, end) => {
      if (str.type !== "string") throw new RuntimeError("substring() requires a string");
      if (start.type !== "number") throw new RuntimeError("start must be a number");
      const endValue = end && end.type === "number" ? end.value : str.value.length;
      return { type: "string", value: str.value.substring(start.value, endValue) };
    }),

    split: createNativeFunction((str, delimiter) => {
      if (str.type !== "string") throw new RuntimeError("split() requires a string");
      if (delimiter.type !== "string") {
        throw new RuntimeError("delimiter must be a string");
      }
      const parts = str.value.split(delimiter.value);
      return {
        type: "array",
        elements: parts.map((p) => ({ type: "string" as const, value: p })),
      };
    }),

    join: createNativeFunction((arr, delimiter) => {
      if (arr.type !== "array") throw new RuntimeError("join() requires an array");
      const sep = delimiter && delimiter.type === "string" ? delimiter.value : ",";
      const str = arr.elements
        .map((el) => {
          if (el.type === "string") return el.value;
          if (el.type === "number") return el.value.toString();
          if (el.type === "boolean") return el.value.toString();
          return "";
        })
        .join(sep);
      return { type: "string", value: str };
    }),

    // ====================================================================
    // Type conversion
    // ====================================================================
    toString: createNativeFunction((value) => {
      if (value.type === "string") return value;
      if (value.type === "number") return { type: "string", value: value.value.toString() };
      if (value.type === "boolean") return { type: "string", value: value.value.toString() };
      if (value.type === "null") return { type: "string", value: "null" };
      return { type: "string", value: "<object>" };
    }),

    toNumber: createNativeFunction((value) => {
      if (value.type === "number") return value;
      if (value.type === "string") {
        const num = parseFloat(value.value);
        if (isNaN(num)) throw new RuntimeError(`Cannot convert '${value.value}' to number`);
        return { type: "number", value: num };
      }
      if (value.type === "boolean") return { type: "number", value: value.value ? 1 : 0 };
      throw new RuntimeError(`Cannot convert ${value.type} to number`);
    }),

    // ====================================================================
    // I/O
    // ====================================================================
    print: createNativeFunction((...args) => {
      const output = args.map((arg) => {
        if (arg.type === "string") return arg.value;
        if (arg.type === "number") return arg.value.toString();
        if (arg.type === "boolean") return arg.value.toString();
        if (arg.type === "null") return "null";
        if (arg.type === "array") {
          return `[${arg.elements.map((el) => {
            if (el.type === "number") return el.value.toString();
            if (el.type === "string") return `"${el.value}"`;
            return "...";
          }).join(", ")}]`;
        }
        return "<object>";
      }).join(" ");
      console.log(output);
      return { type: "null" };
    }),

    // ====================================================================
    // Constants
    // ====================================================================
    PI: { type: "number" as const, value: Math.PI },
    E: { type: "number" as const, value: Math.E },
  };
}
