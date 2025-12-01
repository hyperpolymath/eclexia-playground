// Standard Library for Eclexia
open Types

// Native function type
type nativeFn = array<runtimeValue> => result<runtimeValue, eclexiaError>

let wrapNative = (fn: nativeFn): runtimeValue => {
  VFunction({
    parameters: [],
    body: [],
    closure: {variables: [], parent: None},
  })
  // Note: In a full implementation, we'd extend VFunction to support native functions
}

// Math functions
let absImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(n)) => Ok(VNumber(Float.abs(n)))
  | _ => Error(RuntimeError("abs() requires a number", None))
  }
}

let sqrtImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(n)) => Ok(VNumber(sqrt(n)))
  | _ => Error(RuntimeError("sqrt() requires a number", None))
  }
}

let powImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch (args[0], args[1]) {
  | (Some(VNumber(base)), Some(VNumber(exp))) => Ok(VNumber(base ** exp))
  | _ => Error(RuntimeError("pow() requires two numbers", None))
  }
}

let floorImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(n)) => Ok(VNumber(Float.floor(n)))
  | _ => Error(RuntimeError("floor() requires a number", None))
  }
}

let ceilImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(n)) => Ok(VNumber(Float.ceil(n)))
  | _ => Error(RuntimeError("ceil() requires a number", None))
  }
}

let roundImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(n)) => Ok(VNumber(Float.round(n)))
  | _ => Error(RuntimeError("round() requires a number", None))
  }
}

// Array functions
let sumImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VArray(elements)) => {
      let total = ref(0.0)
      for i in 0 to Array.length(elements) - 1 {
        switch elements[i] {
        | VNumber(n) => total := total.contents +. n
        | _ => ()
        }
      }
      Ok(VNumber(total.contents))
    }
  | _ => Error(RuntimeError("sum() requires an array", None))
  }
}

let meanImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VArray(elements)) => {
      if Array.length(elements) == 0 {
        Error(RuntimeError("Cannot compute mean of empty array", None))
      } else {
        let total = ref(0.0)
        for i in 0 to Array.length(elements) - 1 {
          switch elements[i] {
          | VNumber(n) => total := total.contents +. n
          | _ => ()
          }
        }
        Ok(VNumber(total.contents /. Int.toFloat(Array.length(elements))))
      }
    }
  | _ => Error(RuntimeError("mean() requires an array", None))
  }
}

// Economics functions
let presentValueImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch (args[0], args[1], args[2]) {
  | (Some(VNumber(fv)), Some(VNumber(rate)), Some(VNumber(periods))) => {
      let pv = fv /. ((1.0 +. rate) ** periods)
      Ok(VNumber(pv))
    }
  | _ => Error(RuntimeError("presentValue() requires three numbers", None))
  }
}

let futureValueImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch (args[0], args[1], args[2]) {
  | (Some(VNumber(pv)), Some(VNumber(rate)), Some(VNumber(periods))) => {
      let fv = pv *. ((1.0 +. rate) ** periods)
      Ok(VNumber(fv))
    }
  | _ => Error(RuntimeError("futureValue() requires three numbers", None))
  }
}

let npvImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch (args[0], args[1]) {
  | (Some(VNumber(rate)), Some(VArray(cashFlows))) => {
      let npv = ref(0.0)
      for i in 0 to Array.length(cashFlows) - 1 {
        switch cashFlows[i] {
        | VNumber(cf) => {
            let discounted = cf /. ((1.0 +. rate) ** Int.toFloat(i + 1))
            npv := npv.contents +. discounted
          }
        | _ => ()
        }
      }
      Ok(VNumber(npv.contents))
    }
  | _ => Error(RuntimeError("npv() requires rate and cashFlows array", None))
  }
}

let logarithmicUtilityImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VNumber(wealth)) =>
    if wealth <= 0.0 {
      Error(RuntimeError("Wealth must be positive for logarithmic utility", None))
    } else {
      Ok(VNumber(log(wealth)))
    }
  | _ => Error(RuntimeError("logarithmicUtility() requires a number", None))
  }
}

let priceElasticityImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch (args[0], args[1], args[2], args[3]) {
  | (Some(VNumber(q1)), Some(VNumber(q2)), Some(VNumber(p1)), Some(VNumber(p2))) => {
      let percentChangeQ = (q2 -. q1) /. q1
      let percentChangeP = (p2 -. p1) /. p1
      if percentChangeP == 0.0 {
        Error(RuntimeError("Price change cannot be zero", None))
      } else {
        Ok(VNumber(percentChangeQ /. percentChangeP))
      }
    }
  | _ => Error(RuntimeError("priceElasticity() requires four numbers", None))
  }
}

// String functions
let toLowerCaseImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VString(s)) => Ok(VString(String.toLowerCase(s)))
  | _ => Error(RuntimeError("toLowerCase() requires a string", None))
  }
}

let toUpperCaseImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  switch args[0] {
  | Some(VString(s)) => Ok(VString(String.toUpperCase(s)))
  | _ => Error(RuntimeError("toUpperCase() requires a string", None))
  }
}

// I/O functions
let printImpl = (args: array<runtimeValue>): result<runtimeValue, eclexiaError> => {
  let output = Array.map(args, Runtime.valueToString)
  Console.log(Array.joinWith(output, " "))
  Ok(VNull)
}

// Initialize standard library
let initStdlib = (env: environment) => {
  // Math
  Runtime.defineVar(env, "abs", wrapNative(absImpl))
  Runtime.defineVar(env, "sqrt", wrapNative(sqrtImpl))
  Runtime.defineVar(env, "pow", wrapNative(powImpl))
  Runtime.defineVar(env, "floor", wrapNative(floorImpl))
  Runtime.defineVar(env, "ceil", wrapNative(ceilImpl))
  Runtime.defineVar(env, "round", wrapNative(roundImpl))

  // Array
  Runtime.defineVar(env, "sum", wrapNative(sumImpl))
  Runtime.defineVar(env, "mean", wrapNative(meanImpl))

  // Economics
  Runtime.defineVar(env, "presentValue", wrapNative(presentValueImpl))
  Runtime.defineVar(env, "futureValue", wrapNative(futureValueImpl))
  Runtime.defineVar(env, "npv", wrapNative(npvImpl))
  Runtime.defineVar(env, "logarithmicUtility", wrapNative(logarithmicUtilityImpl))
  Runtime.defineVar(env, "priceElasticity", wrapNative(priceElasticityImpl))

  // String
  Runtime.defineVar(env, "toLowerCase", wrapNative(toLowerCaseImpl))
  Runtime.defineVar(env, "toUpperCase", wrapNative(toUpperCaseImpl))

  // I/O
  Runtime.defineVar(env, "print", wrapNative(printImpl))

  // Constants
  Runtime.defineVar(env, "PI", VNumber(Float.Constants.pi))
  Runtime.defineVar(env, "E", VNumber(Float.Constants.e))
}
