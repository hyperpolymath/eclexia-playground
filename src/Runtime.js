

import * as Primitive_object from "@rescript/runtime/lib/es6/Primitive_object.js";

function createEnv(parent) {
  return {
    variables: [],
    parent: parent
  };
}

function defineVar(env, name, value) {
  env.variables.push([
    name,
    value
  ]);
}

function getVar(_env, name) {
  while (true) {
    let env = _env;
    let match = env.variables.find(param => param[0] === name);
    if (match !== undefined) {
      return {
        TAG: "Ok",
        _0: match[1]
      };
    }
    let parentEnv = env.parent;
    if (parentEnv === undefined) {
      return {
        TAG: "Error",
        _0: {
          TAG: "RuntimeError",
          _0: "Undefined variable: " + name,
          _1: undefined
        }
      };
    }
    _env = parentEnv;
    continue;
  };
}

function setVar(_env, name, value) {
  while (true) {
    let env = _env;
    let idx = env.variables.findIndex(param => param[0] === name);
    if (idx >= 0) {
      env.variables[idx] = [
        name,
        value
      ];
      return {
        TAG: "Ok",
        _0: undefined
      };
    }
    let parentEnv = env.parent;
    if (parentEnv === undefined) {
      return {
        TAG: "Error",
        _0: {
          TAG: "RuntimeError",
          _0: "Undefined variable: " + name,
          _1: undefined
        }
      };
    }
    _env = parentEnv;
    continue;
  };
}

function isTruthy(value) {
  if (typeof value !== "object") {
    return false;
  }
  switch (value.TAG) {
    case "VNumber" :
      return value._0 !== 0.0;
    case "VString" :
      return value._0.length > 0;
    case "VBool" :
      return value._0;
    default:
      return true;
  }
}

function valueToString(value) {
  if (typeof value !== "object") {
    return "null";
  }
  switch (value.TAG) {
    case "VNumber" :
      return value._0.toString();
    case "VString" :
      return value._0;
    case "VBool" :
      if (value._0) {
        return "true";
      } else {
        return "false";
      }
    case "VArray" :
      return "[...]";
    case "VObject" :
      return "{...}";
    case "VFunction" :
      return "<function>";
    case "VCurrency" :
    case "VQuantity" :
      break;
  }
  return value._0.toString() + value._1;
}

function evalExpression(env, _expr) {
  while (true) {
    let expr = _expr;
    switch (expr.TAG) {
      case "Literal" :
        let lit = expr._0;
        if (typeof lit !== "object") {
          return {
            TAG: "Ok",
            _0: "VNull"
          };
        }
        switch (lit.TAG) {
          case "LitNumber" :
            return {
              TAG: "Ok",
              _0: {
                TAG: "VNumber",
                _0: lit._0
              }
            };
          case "LitString" :
            return {
              TAG: "Ok",
              _0: {
                TAG: "VString",
                _0: lit._0
              }
            };
          case "LitBool" :
            return {
              TAG: "Ok",
              _0: {
                TAG: "VBool",
                _0: lit._0
              }
            };
          case "LitCurrency" :
            return {
              TAG: "Ok",
              _0: {
                TAG: "VCurrency",
                _0: lit._0,
                _1: lit._1
              }
            };
          case "LitQuantity" :
          case "LitTime" :
            return {
              TAG: "Ok",
              _0: {
                TAG: "VQuantity",
                _0: lit._0,
                _1: lit._1
              }
            };
        }
      case "Identifier" :
        return getVar(env, expr._0);
      case "BinaryExpr" :
        let operator = expr.operator;
        let match = evalExpression(env, expr.left);
        let match$1 = evalExpression(env, expr.right);
        if (match.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: match._0
          };
        }
        let l = match._0;
        if (typeof l === "object") {
          switch (l.TAG) {
            case "VNumber" :
              let l$1 = l._0;
              if (match$1.TAG !== "Ok") {
                return {
                  TAG: "Error",
                  _0: match$1._0
                };
              }
              let r = match$1._0;
              if (typeof r === "object" && r.TAG === "VNumber") {
                let r$1 = r._0;
                switch (operator) {
                  case "!=" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 !== r$1
                      }
                    };
                  case "%" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VNumber",
                        _0: l$1 % r$1
                      }
                    };
                  case "*" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VNumber",
                        _0: l$1 * r$1
                      }
                    };
                  case "**" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VNumber",
                        _0: l$1 ** r$1
                      }
                    };
                  case "+" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VNumber",
                        _0: l$1 + r$1
                      }
                    };
                  case "-" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VNumber",
                        _0: l$1 - r$1
                      }
                    };
                  case "/" :
                    if (r$1 === 0.0) {
                      return {
                        TAG: "Error",
                        _0: {
                          TAG: "RuntimeError",
                          _0: "Division by zero",
                          _1: undefined
                        }
                      };
                    } else {
                      return {
                        TAG: "Ok",
                        _0: {
                          TAG: "VNumber",
                          _0: l$1 / r$1
                        }
                      };
                    }
                  case "<" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 < r$1
                      }
                    };
                  case "<=" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 <= r$1
                      }
                    };
                  case "==" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 === r$1
                      }
                    };
                  case ">" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 > r$1
                      }
                    };
                  case ">=" :
                    return {
                      TAG: "Ok",
                      _0: {
                        TAG: "VBool",
                        _0: l$1 >= r$1
                      }
                    };
                  default:
                    return {
                      TAG: "Error",
                      _0: {
                        TAG: "RuntimeError",
                        _0: "Unknown operator: " + operator,
                        _1: undefined
                      }
                    };
                }
              }
              break;
            case "VString" :
              if (match$1.TAG !== "Ok") {
                return {
                  TAG: "Error",
                  _0: match$1._0
                };
              }
              let r$2 = match$1._0;
              if (typeof r$2 === "object" && r$2.TAG === "VString" && operator === "+") {
                return {
                  TAG: "Ok",
                  _0: {
                    TAG: "VString",
                    _0: l._0 + r$2._0
                  }
                };
              }
              break;
          }
        }
        if (match$1.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: match$1._0
          };
        }
        let rval = match$1._0;
        if (operator === "==") {
          return {
            TAG: "Ok",
            _0: {
              TAG: "VBool",
              _0: Primitive_object.equal(l, rval)
            }
          };
        } else if (operator === "!=") {
          return {
            TAG: "Ok",
            _0: {
              TAG: "VBool",
              _0: Primitive_object.notequal(l, rval)
            }
          };
        } else {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Type error in binary operation",
              _1: undefined
            }
          };
        }
        break;
      case "UnaryExpr" :
        let operator$1 = expr.operator;
        let val = evalExpression(env, expr.argument);
        if (val.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: val._0
          };
        }
        let n = val._0;
        if (typeof n === "object" && n.TAG === "VNumber") {
          let n$1 = n._0;
          if (operator$1 === "-") {
            return {
              TAG: "Ok",
              _0: {
                TAG: "VNumber",
                _0: - n$1
              }
            };
          }
          if (operator$1 === "+") {
            return {
              TAG: "Ok",
              _0: {
                TAG: "VNumber",
                _0: n$1
              }
            };
          }
        }
        if (operator$1 === "!" || operator$1 === "not") {
          return {
            TAG: "Ok",
            _0: {
              TAG: "VBool",
              _0: !isTruthy(n)
            }
          };
        } else {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Type error in unary operation",
              _1: undefined
            }
          };
        }
        break;
      case "CallExpr" :
        let e = evalExpression(env, expr.callee);
        if (e.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: e._0
          };
        }
        let match$2 = e._0;
        if (typeof match$2 !== "object") {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Cannot call non-function",
              _1: undefined
            }
          };
        }
        if (match$2.TAG !== "VFunction") {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Cannot call non-function",
              _1: undefined
            }
          };
        }
        let fnEnv = {
          variables: [],
          parent: match$2.closure
        };
        return evalBlock(fnEnv, match$2.body);
      case "ArrayExpr" :
        let elements = expr._0;
        let values = [];
        let evalElements = _idx => {
          while (true) {
            let idx = _idx;
            if (idx >= elements.length) {
              return {
                TAG: "Ok",
                _0: values
              };
            }
            let elem = elements[idx];
            if (elem === undefined) {
              return {
                TAG: "Error",
                _0: {
                  TAG: "RuntimeError",
                  _0: "Internal error: invalid array index",
                  _1: undefined
                }
              };
            }
            let val = evalExpression(env, elem);
            if (val.TAG !== "Ok") {
              return {
                TAG: "Error",
                _0: val._0
              };
            }
            values.push(val._0);
            _idx = idx + 1 | 0;
            continue;
          };
        };
        let vals = evalElements(0);
        if (vals.TAG === "Ok") {
          return {
            TAG: "Ok",
            _0: {
              TAG: "VArray",
              _0: vals._0
            }
          };
        } else {
          return {
            TAG: "Error",
            _0: vals._0
          };
        }
      case "ObjectExpr" :
        let props = expr._0;
        let values$1 = [];
        let evalProps = _idx => {
          while (true) {
            let idx = _idx;
            if (idx >= props.length) {
              return {
                TAG: "Ok",
                _0: values$1
              };
            }
            let match = props[idx];
            if (match === undefined) {
              return {
                TAG: "Error",
                _0: {
                  TAG: "RuntimeError",
                  _0: "Internal error: invalid property index",
                  _1: undefined
                }
              };
            }
            let val = evalExpression(env, match[1]);
            if (val.TAG !== "Ok") {
              return {
                TAG: "Error",
                _0: val._0
              };
            }
            values$1.push([
              match[0],
              val._0
            ]);
            _idx = idx + 1 | 0;
            continue;
          };
        };
        let vals$1 = evalProps(0);
        if (vals$1.TAG === "Ok") {
          return {
            TAG: "Ok",
            _0: {
              TAG: "VObject",
              _0: vals$1._0
            }
          };
        } else {
          return {
            TAG: "Error",
            _0: vals$1._0
          };
        }
      case "LambdaExpr" :
        return {
          TAG: "Error",
          _0: {
            TAG: "RuntimeError",
            _0: "Lambda expressions not yet implemented",
            _1: undefined
          }
        };
      case "ConditionalExpr" :
        let cond = evalExpression(env, expr.condition);
        if (cond.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: cond._0
          };
        }
        if (isTruthy(cond._0)) {
          _expr = expr.consequent;
          continue;
        }
        _expr = expr.alternate;
        continue;
      case "MemberExpr" :
        return {
          TAG: "Error",
          _0: {
            TAG: "RuntimeError",
            _0: "Member expressions not yet implemented",
            _1: undefined
          }
        };
      case "RangeExpr" :
        let match$3 = evalExpression(env, expr.start);
        let match$4 = evalExpression(env, expr.end_);
        if (match$3.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: match$3._0
          };
        }
        let s = match$3._0;
        if (typeof s === "object" && s.TAG === "VNumber" && match$4.TAG === "Ok") {
          let e$1 = match$4._0;
          if (typeof e$1 !== "object") {
            return {
              TAG: "Error",
              _0: {
                TAG: "RuntimeError",
                _0: "Range bounds must be numbers",
                _1: undefined
              }
            };
          }
          if (e$1.TAG !== "VNumber") {
            return {
              TAG: "Error",
              _0: {
                TAG: "RuntimeError",
                _0: "Range bounds must be numbers",
                _1: undefined
              }
            };
          }
          let e$2 = e$1._0;
          let endVal = expr.inclusive ? e$2 + 1.0 : e$2;
          let elements$1 = [];
          let buildRange = _current => {
            while (true) {
              let current = _current;
              if (current >= endVal) {
                return elements$1;
              }
              elements$1.push({
                TAG: "VNumber",
                _0: current
              });
              _current = current + 1.0;
              continue;
            };
          };
          return {
            TAG: "Ok",
            _0: {
              TAG: "VArray",
              _0: buildRange(s._0)
            }
          };
        }
        if (match$4.TAG === "Ok") {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Range bounds must be numbers",
              _1: undefined
            }
          };
        } else {
          return {
            TAG: "Error",
            _0: match$4._0
          };
        }
        break;
    }
  };
}

function evalStatement(env, stmt) {
  switch (stmt.TAG) {
    case "ExprStmt" :
      return evalExpression(env, stmt._0);
    case "ConstDecl" :
      let val = evalExpression(env, stmt._1);
      if (val.TAG !== "Ok") {
        return {
          TAG: "Error",
          _0: val._0
        };
      }
      defineVar(env, stmt._0, val._0);
      return {
        TAG: "Ok",
        _0: "VNull"
      };
    case "FunctionDecl" :
      let fnValue_0 = stmt.parameters;
      let fnValue_1 = stmt.body;
      let fnValue = {
        TAG: "VFunction",
        parameters: fnValue_0,
        body: fnValue_1,
        closure: env
      };
      defineVar(env, stmt.name, fnValue);
      return {
        TAG: "Ok",
        _0: "VNull"
      };
    case "IfStmt" :
      let alternate = stmt.alternate;
      let cond = evalExpression(env, stmt.condition);
      if (cond.TAG === "Ok") {
        if (isTruthy(cond._0)) {
          return evalBlock(env, stmt.consequent);
        } else if (alternate !== undefined) {
          return evalBlock(env, alternate);
        } else {
          return {
            TAG: "Ok",
            _0: "VNull"
          };
        }
      } else {
        return {
          TAG: "Error",
          _0: cond._0
        };
      }
    case "ForStmt" :
      let body = stmt.body;
      let variable = stmt.variable;
      let e = evalExpression(env, stmt.iterator);
      if (e.TAG !== "Ok") {
        return {
          TAG: "Error",
          _0: e._0
        };
      }
      let elements = e._0;
      if (typeof elements !== "object") {
        return {
          TAG: "Error",
          _0: {
            TAG: "RuntimeError",
            _0: "Can only iterate over arrays",
            _1: undefined
          }
        };
      }
      if (elements.TAG !== "VArray") {
        return {
          TAG: "Error",
          _0: {
            TAG: "RuntimeError",
            _0: "Can only iterate over arrays",
            _1: undefined
          }
        };
      }
      let elements$1 = elements._0;
      let loopEnv = {
        variables: [],
        parent: env
      };
      let _idx = 0;
      while (true) {
        let idx = _idx;
        if (idx >= elements$1.length) {
          return {
            TAG: "Ok",
            _0: "VNull"
          };
        }
        let elem = elements$1[idx];
        if (elem === undefined) {
          return {
            TAG: "Error",
            _0: {
              TAG: "RuntimeError",
              _0: "Internal error: invalid loop index",
              _1: undefined
            }
          };
        }
        defineVar(loopEnv, variable, elem);
        let e$1 = evalBlock(loopEnv, body);
        if (e$1.TAG !== "Ok") {
          return {
            TAG: "Error",
            _0: e$1._0
          };
        }
        _idx = idx + 1 | 0;
        continue;
      };
    case "WhileStmt" :
      let body$1 = stmt.body;
      let condition = stmt.condition;
      let loop = () => {
        while (true) {
          let cond = evalExpression(env, condition);
          if (cond.TAG !== "Ok") {
            return {
              TAG: "Error",
              _0: cond._0
            };
          }
          if (!isTruthy(cond._0)) {
            return {
              TAG: "Ok",
              _0: "VNull"
            };
          }
          let e = evalBlock(env, body$1);
          if (e.TAG !== "Ok") {
            return {
              TAG: "Error",
              _0: e._0
            };
          }
          continue;
        };
      };
      return loop();
    case "ReturnStmt" :
      let expr = stmt._0;
      if (expr !== undefined) {
        return evalExpression(env, expr);
      } else {
        return {
          TAG: "Ok",
          _0: "VNull"
        };
      }
  }
}

function evalBlock(env, statements) {
  let _idx = 0;
  let _lastVal = "VNull";
  while (true) {
    let lastVal = _lastVal;
    let idx = _idx;
    if (idx >= statements.length) {
      return {
        TAG: "Ok",
        _0: lastVal
      };
    }
    let stmt = statements[idx];
    if (stmt === undefined) {
      return {
        TAG: "Error",
        _0: {
          TAG: "RuntimeError",
          _0: "Internal error: invalid statement index",
          _1: undefined
        }
      };
    }
    let val = evalStatement(env, stmt);
    if (val.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: val._0
      };
    }
    _lastVal = val._0;
    _idx = idx + 1 | 0;
    continue;
  };
}

function evalProgram(program) {
  let globalEnv = {
    variables: [],
    parent: undefined
  };
  let _idx = 0;
  while (true) {
    let idx = _idx;
    if (idx >= program.declarations.length) {
      return {
        TAG: "Ok",
        _0: "VNull"
      };
    }
    let decl = program.declarations[idx];
    if (decl === undefined) {
      return {
        TAG: "Error",
        _0: {
          TAG: "RuntimeError",
          _0: "Internal error: invalid declaration index",
          _1: undefined
        }
      };
    }
    let result;
    switch (decl.TAG) {
      case "Statement" :
        result = evalStatement(globalEnv, decl._0);
        break;
      case "AgentDecl" :
      case "GoodDecl" :
        result = {
          TAG: "Ok",
          _0: "VNull"
        };
        break;
    }
    if (result.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: result._0
      };
    }
    _idx = idx + 1 | 0;
    continue;
  };
}

export {
  createEnv,
  defineVar,
  getVar,
  setVar,
  isTruthy,
  valueToString,
  evalExpression,
  evalStatement,
  evalBlock,
  evalProgram,
}
/* No side effect */
