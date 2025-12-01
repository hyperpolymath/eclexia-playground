// Runtime/Interpreter for Eclexia
open Types

let createEnv = (parent: option<environment>): environment => {
  {
    variables: [],
    parent: parent,
  }
}

let defineVar = (env: environment, name: string, value: runtimeValue) => {
  Array.push(env.variables, (name, value))
}

let rec getVar = (env: environment, name: string): result<runtimeValue, eclexiaError> => {
  switch Array.find(env.variables, ((n, _)) => n == name) {
  | Some((_, value)) => Ok(value)
  | None =>
    switch env.parent {
    | Some(parentEnv) => getVar(parentEnv, name)
    | None => Error(RuntimeError("Undefined variable: " ++ name, None))
    }
  }
}

let rec setVar = (env: environment, name: string, value: runtimeValue): result<unit, eclexiaError> => {
  switch Array.findIndex(env.variables, ((n, _)) => n == name) {
  | Some(idx) => {
      env.variables[idx] = (name, value)
      Ok()
    }
  | None =>
    switch env.parent {
    | Some(parentEnv) => setVar(parentEnv, name, value)
    | None => Error(RuntimeError("Undefined variable: " ++ name, None))
    }
  }
}

// Helper functions
let isTruthy = (value: runtimeValue): bool => {
  switch value {
  | VBool(b) => b
  | VNull => false
  | VNumber(n) => n != 0.0
  | VString(s) => String.length(s) > 0
  | _ => true
  }
}

let valueToString = (value: runtimeValue): string => {
  switch value {
  | VNull => "null"
  | VNumber(n) => Float.toString(n)
  | VString(s) => s
  | VBool(true) => "true"
  | VBool(false) => "false"
  | VArray(_) => "[...]"
  | VObject(_) => "{...}"
  | VFunction(_) => "<function>"
  | VCurrency(amount, currency) => Float.toString(amount) ++ currency
  | VQuantity(amount, unit) => Float.toString(amount) ++ unit
  }
}

// Expression evaluation
let rec evalExpression = (env: environment, expr: expression): result<runtimeValue, eclexiaError> => {
  switch expr {
  | Literal(lit, _) =>
    switch lit {
    | LitNull => Ok(VNull)
    | LitNumber(n) => Ok(VNumber(n))
    | LitString(s) => Ok(VString(s))
    | LitBool(b) => Ok(VBool(b))
    | LitCurrency(amount, currency) => Ok(VCurrency(amount, currency))
    | LitQuantity(amount, unit) => Ok(VQuantity(amount, unit))
    | LitTime(value, unit) => Ok(VQuantity(value, unit))
    }

  | Identifier(name, _) => getVar(env, name)

  | BinaryExpr({operator, left, right, _}) => {
      switch (evalExpression(env, left), evalExpression(env, right)) {
      | (Ok(VNumber(l)), Ok(VNumber(r))) =>
        switch operator {
        | "+" => Ok(VNumber(l +. r))
        | "-" => Ok(VNumber(l -. r))
        | "*" => Ok(VNumber(l *. r))
        | "/" =>
          if r == 0.0 {
            Error(RuntimeError("Division by zero", None))
          } else {
            Ok(VNumber(l /. r))
          }
        | "%" => Ok(VNumber(mod_float(l, r)))
        | "**" => Ok(VNumber(l ** r))
        | "<" => Ok(VBool(l < r))
        | ">" => Ok(VBool(l > r))
        | "<=" => Ok(VBool(l <= r))
        | ">=" => Ok(VBool(l >= r))
        | "==" => Ok(VBool(l == r))
        | "!=" => Ok(VBool(l != r))
        | _ => Error(RuntimeError("Unknown operator: " ++ operator, None))
        }
      | (Ok(VString(l)), Ok(VString(r))) if operator == "+" => Ok(VString(l ++ r))
      | (Ok(lval), Ok(rval)) if operator == "==" => Ok(VBool(lval == rval))
      | (Ok(lval), Ok(rval)) if operator == "!=" => Ok(VBool(lval != rval))
      | (Ok(_), Ok(_)) => Error(RuntimeError("Type error in binary operation", None))
      | (Error(e), _) | (_, Error(e)) => Error(e)
      }
    }

  | UnaryExpr({operator, argument, _}) =>
    switch evalExpression(env, argument) {
    | Ok(VNumber(n)) if operator == "-" => Ok(VNumber(-.n))
    | Ok(VNumber(n)) if operator == "+" => Ok(VNumber(n))
    | Ok(val) if operator == "!" || operator == "not" => Ok(VBool(!isTruthy(val)))
    | Ok(_) => Error(RuntimeError("Type error in unary operation", None))
    | Error(e) => Error(e)
    }

  | ArrayExpr(elements, _) => {
      let values = []
      let rec evalElements = (idx: int) => {
        if idx >= Array.length(elements) {
          Ok(values)
        } else {
          switch evalExpression(env, elements[idx]) {
          | Ok(val) => {
              Array.push(values, val)
              evalElements(idx + 1)
            }
          | Error(e) => Error(e)
          }
        }
      }
      switch evalElements(0) {
      | Ok(vals) => Ok(VArray(vals))
      | Error(e) => Error(e)
      }
    }

  | ObjectExpr(props, _) => {
      let values = []
      let rec evalProps = (idx: int) => {
        if idx >= Array.length(props) {
          Ok(values)
        } else {
          let (key, valExpr) = props[idx]
          switch evalExpression(env, valExpr) {
          | Ok(val) => {
              Array.push(values, (key, val))
              evalProps(idx + 1)
            }
          | Error(e) => Error(e)
          }
        }
      }
      switch evalProps(0) {
      | Ok(vals) => Ok(VObject(vals))
      | Error(e) => Error(e)
      }
    }

  | CallExpr({callee, args, _}) =>
    switch evalExpression(env, callee) {
    | Ok(VFunction({parameters, body, closure})) => {
        let fnEnv = createEnv(Some(closure))
        // TODO: bind arguments to parameters
        evalBlock(fnEnv, body)
      }
    | Ok(_) => Error(RuntimeError("Cannot call non-function", None))
    | Error(e) => Error(e)
    }

  | ConditionalExpr({condition, consequent, alternate, _}) =>
    switch evalExpression(env, condition) {
    | Ok(cond) =>
      if isTruthy(cond) {
        evalExpression(env, consequent)
      } else {
        evalExpression(env, alternate)
      }
    | Error(e) => Error(e)
    }

  | RangeExpr({start, end_, inclusive, _}) =>
    switch (evalExpression(env, start), evalExpression(env, end_)) {
    | (Ok(VNumber(s)), Ok(VNumber(e))) => {
        let endVal = if inclusive { e +. 1.0 } else { e }
        let elements = []
        let rec buildRange = (current: float) => {
          if current >= endVal {
            elements
          } else {
            Array.push(elements, VNumber(current))
            buildRange(current +. 1.0)
          }
        }
        Ok(VArray(buildRange(s)))
      }
    | (Error(e), _) | (_, Error(e)) => Error(e)
    | _ => Error(RuntimeError("Range bounds must be numbers", None))
    }

  | MemberExpr(_) => Error(RuntimeError("Member expressions not yet implemented", None))
  | LambdaExpr(_) => Error(RuntimeError("Lambda expressions not yet implemented", None))
  }
}

and evalStatement = (env: environment, stmt: statement): result<runtimeValue, eclexiaError> => {
  switch stmt {
  | ExprStmt(expr) => evalExpression(env, expr)

  | ConstDecl(name, value) =>
    switch evalExpression(env, value) {
    | Ok(val) => {
        defineVar(env, name, val)
        Ok(VNull)
      }
    | Error(e) => Error(e)
    }

  | FunctionDecl({name, parameters, body}) => {
      let fnValue = VFunction({
        parameters: parameters,
        body: body,
        closure: env,
      })
      defineVar(env, name, fnValue)
      Ok(VNull)
    }

  | ReturnStmt(expr) =>
    switch expr {
    | Some(e) => evalExpression(env, e)
    | None => Ok(VNull)
    }

  | IfStmt({condition, consequent, alternate}) =>
    switch evalExpression(env, condition) {
    | Ok(cond) =>
      if isTruthy(cond) {
        evalBlock(env, consequent)
      } else {
        switch alternate {
        | Some(alt) => evalBlock(env, alt)
        | None => Ok(VNull)
        }
      }
    | Error(e) => Error(e)
    }

  | ForStmt({variable, iterator, body}) =>
    switch evalExpression(env, iterator) {
    | Ok(VArray(elements)) => {
        let loopEnv = createEnv(Some(env))
        let rec loop = (idx: int) => {
          if idx >= Array.length(elements) {
            Ok(VNull)
          } else {
            defineVar(loopEnv, variable, elements[idx])
            switch evalBlock(loopEnv, body) {
            | Ok(_) => loop(idx + 1)
            | Error(e) => Error(e)
            }
          }
        }
        loop(0)
      }
    | Ok(_) => Error(RuntimeError("Can only iterate over arrays", None))
    | Error(e) => Error(e)
    }

  | WhileStmt({condition, body}) => {
      let rec loop = () => {
        switch evalExpression(env, condition) {
        | Ok(cond) =>
          if isTruthy(cond) {
            switch evalBlock(env, body) {
            | Ok(_) => loop()
            | Error(e) => Error(e)
            }
          } else {
            Ok(VNull)
          }
        | Error(e) => Error(e)
        }
      }
      loop()
    }
  }
}

and evalBlock = (env: environment, statements: array<statement>): result<runtimeValue, eclexiaError> => {
  let rec loop = (idx: int, lastVal: runtimeValue) => {
    if idx >= Array.length(statements) {
      Ok(lastVal)
    } else {
      switch evalStatement(env, statements[idx]) {
      | Ok(val) => loop(idx + 1, val)
      | Error(e) => Error(e)
      }
    }
  }
  loop(0, VNull)
}

let evalProgram = (program: program): result<runtimeValue, eclexiaError> => {
  let globalEnv = createEnv(None)

  // Initialize stdlib
  Stdlib.initStdlib(globalEnv)

  let rec evalDeclarations = (idx: int) => {
    if idx >= Array.length(program.declarations) {
      Ok(VNull)
    } else {
      let decl = program.declarations[idx]
      let result = switch decl {
      | Statement(stmt) => evalStatement(globalEnv, stmt)
      | AgentDecl(_) => Ok(VNull) // TODO: implement agents
      | GoodDecl(_) => Ok(VNull) // TODO: implement goods
      }

      switch result {
      | Ok(_) => evalDeclarations(idx + 1)
      | Error(e) => Error(e)
      }
    }
  }

  evalDeclarations(0)
}
