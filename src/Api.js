

import * as Lexer from "./Lexer.js";
import * as Parser from "./Parser.js";
import * as Runtime from "./Runtime.js";

function errorToString(error) {
  switch (error.TAG) {
    case "SyntaxError" :
        return "SyntaxError: " + error._0;
    case "RuntimeError" :
        return "RuntimeError: " + error._0;
    case "TypeError" :
        return "TypeError: " + error._0;
    
  }
}

function compile(source) {
  var tokens = Lexer.tokenize(source);
  if (tokens.TAG !== "Ok") {
    return {
            ast: undefined,
            errors: [errorToString(tokens._0)]
          };
  }
  var ast = Parser.parse(tokens._0);
  if (ast.TAG === "Ok") {
    return {
            ast: ast._0,
            errors: []
          };
  } else {
    return {
            ast: undefined,
            errors: [errorToString(ast._0)]
          };
  }
}

function run(source) {
  var tokens = Lexer.tokenize(source);
  if (tokens.TAG !== "Ok") {
    return {
            value: undefined,
            errors: [errorToString(tokens._0)]
          };
  }
  var ast = Parser.parse(tokens._0);
  if (ast.TAG !== "Ok") {
    return {
            value: undefined,
            errors: [errorToString(ast._0)]
          };
  }
  var value = Runtime.evalProgram(ast._0);
  if (value.TAG === "Ok") {
    return {
            value: value._0,
            errors: []
          };
  } else {
    return {
            value: undefined,
            errors: [errorToString(value._0)]
          };
  }
}

export {
  errorToString ,
  compile ,
  run ,
}
/* No side effect */
