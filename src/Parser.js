

import * as Stdlib_Option from "@rescript/runtime/lib/es6/Stdlib_Option.js";

function createParser(tokens) {
  return {
    tokens: tokens,
    current: 0
  };
}

function peek(parser) {
  return Stdlib_Option.getOr(parser.tokens[parser.current], {
    tokenType: "EOF",
    value: "",
    literal: undefined,
    span: {
      start: {
        line: 0,
        column: 0,
        offset: 0
      },
      end_: {
        line: 0,
        column: 0,
        offset: 0
      },
      source: undefined
    }
  });
}

function advance(parser) {
  let token = peek(parser);
  parser.current = parser.current + 1 | 0;
  return token;
}

function check(parser, tokenType) {
  let token = peek(parser);
  return token.tokenType === tokenType;
}

function match_(parser, tokenTypes) {
  let matches = tokenTypes.some(tt => check(parser, tt));
  if (matches) {
    advance(parser);
    return true;
  } else {
    return false;
  }
}

function consume(parser, tokenType, message) {
  if (check(parser, tokenType)) {
    return {
      TAG: "Ok",
      _0: advance(parser)
    };
  } else {
    return {
      TAG: "Error",
      _0: {
        TAG: "SyntaxError",
        _0: message,
        _1: undefined
      }
    };
  }
}

function parsePrimary(parser) {
  let token = peek(parser);
  let match = token.tokenType;
  switch (match) {
    case "NUMBER" :
      advance(parser);
      let lit = token.literal;
      if (lit !== undefined) {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: lit,
            _1: token.span
          }
        };
      } else {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: {
              TAG: "LitNumber",
              _0: 0.0
            },
            _1: token.span
          }
        };
      }
    case "STRING" :
      advance(parser);
      let lit$1 = token.literal;
      if (lit$1 !== undefined) {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: lit$1,
            _1: token.span
          }
        };
      } else {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: {
              TAG: "LitString",
              _0: ""
            },
            _1: token.span
          }
        };
      }
    case "TRUE" :
    case "FALSE" :
      break;
    case "NULL" :
      advance(parser);
      return {
        TAG: "Ok",
        _0: {
          TAG: "Literal",
          _0: "LitNull",
          _1: token.span
        }
      };
    case "IDENTIFIER" :
      advance(parser);
      return {
        TAG: "Ok",
        _0: {
          TAG: "Identifier",
          _0: token.value,
          _1: token.span
        }
      };
    case "LPAREN" :
      advance(parser);
      let expr = parseBinary(parser);
      let e = consume(parser, "RPAREN", "Expected ')'");
      if (e.TAG === "Ok") {
        return expr;
      } else {
        return {
          TAG: "Error",
          _0: e._0
        };
      }
    case "LBRACKET" :
      advance(parser);
      let elements = [];
      !check(parser, "RBRACKET");
      let e$1 = consume(parser, "RBRACKET", "Expected ']'");
      if (e$1.TAG === "Ok") {
        return {
          TAG: "Ok",
          _0: {
            TAG: "ArrayExpr",
            _0: elements,
            _1: token.span
          }
        };
      } else {
        return {
          TAG: "Error",
          _0: e$1._0
        };
      }
    case "CURRENCY_UNIT" :
      advance(parser);
      let lit$2 = token.literal;
      if (lit$2 !== undefined) {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: lit$2,
            _1: token.span
          }
        };
      } else {
        return {
          TAG: "Ok",
          _0: {
            TAG: "Literal",
            _0: {
              TAG: "LitCurrency",
              _0: 0.0,
              _1: "USD"
            },
            _1: token.span
          }
        };
      }
    default:
      return {
        TAG: "Error",
        _0: {
          TAG: "SyntaxError",
          _0: "Expected expression",
          _1: token.span
        }
      };
  }
  advance(parser);
  let lit$3 = token.literal;
  if (lit$3 !== undefined) {
    return {
      TAG: "Ok",
      _0: {
        TAG: "Literal",
        _0: lit$3,
        _1: token.span
      }
    };
  } else {
    return {
      TAG: "Ok",
      _0: {
        TAG: "Literal",
        _0: {
          TAG: "LitBool",
          _0: false
        },
        _1: token.span
      }
    };
  }
}

let parseBinary = parsePrimary;

let parseExpression = parsePrimary;

function parseStatement(parser) {
  if (match_(parser, ["CONST"])) {
    let nameToken = consume(parser, "IDENTIFIER", "Expected variable name");
    if (nameToken.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: nameToken._0
      };
    }
    let e = consume(parser, "ASSIGN", "Expected '='");
    if (e.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: e._0
      };
    }
    let expr = parseBinary(parser);
    if (expr.TAG === "Ok") {
      return {
        TAG: "Ok",
        _0: {
          TAG: "ConstDecl",
          _0: nameToken._0.value,
          _1: expr._0
        }
      };
    } else {
      return {
        TAG: "Error",
        _0: expr._0
      };
    }
  }
  if (match_(parser, ["RETURN"])) {
    let expr$1;
    if (check(parser, "SEMICOLON") || check(parser, "RBRACE")) {
      expr$1 = undefined;
    } else {
      let e$1 = parseBinary(parser);
      expr$1 = e$1.TAG === "Ok" ? e$1._0 : undefined;
    }
    return {
      TAG: "Ok",
      _0: {
        TAG: "ReturnStmt",
        _0: expr$1
      }
    };
  }
  let expr$2 = parseBinary(parser);
  if (expr$2.TAG === "Ok") {
    return {
      TAG: "Ok",
      _0: {
        TAG: "ExprStmt",
        _0: expr$2._0
      }
    };
  } else {
    return {
      TAG: "Error",
      _0: expr$2._0
    };
  }
}

function parseDeclaration(parser) {
  if (match_(parser, ["FUNCTION"])) {
    let nameToken = consume(parser, "IDENTIFIER", "Expected function name");
    if (nameToken.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: nameToken._0
      };
    }
    let e = consume(parser, "LPAREN", "Expected '('");
    if (e.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: e._0
      };
    }
    let params = [];
    let e$1 = consume(parser, "RPAREN", "Expected ')'");
    if (e$1.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: e$1._0
      };
    }
    let e$2 = consume(parser, "LBRACE", "Expected '{'");
    if (e$2.TAG !== "Ok") {
      return {
        TAG: "Error",
        _0: e$2._0
      };
    }
    let body = [];
    let e$3 = consume(parser, "RBRACE", "Expected '}'");
    if (e$3.TAG === "Ok") {
      return {
        TAG: "Ok",
        _0: {
          TAG: "Statement",
          _0: {
            TAG: "FunctionDecl",
            name: nameToken._0.value,
            parameters: params,
            body: body
          }
        }
      };
    } else {
      return {
        TAG: "Error",
        _0: e$3._0
      };
    }
  }
  let stmt = parseStatement(parser);
  if (stmt.TAG === "Ok") {
    return {
      TAG: "Ok",
      _0: {
        TAG: "Statement",
        _0: stmt._0
      }
    };
  } else {
    return {
      TAG: "Error",
      _0: stmt._0
    };
  }
}

function parse(tokens) {
  let parser = {
    tokens: tokens,
    current: 0
  };
  let declarations = [];
  let loop = () => {
    while (true) {
      if (check(parser, "EOF")) {
        return {
          TAG: "Ok",
          _0: declarations
        };
      }
      let decl = parseDeclaration(parser);
      if (decl.TAG !== "Ok") {
        return {
          TAG: "Error",
          _0: decl._0
        };
      }
      declarations.push(decl._0);
      continue;
    };
  };
  let decls = loop();
  if (decls.TAG === "Ok") {
    return {
      TAG: "Ok",
      _0: {
        declarations: decls._0
      }
    };
  } else {
    return {
      TAG: "Error",
      _0: decls._0
    };
  }
}

export {
  createParser,
  peek,
  advance,
  check,
  match_,
  consume,
  parseExpression,
  parseBinary,
  parsePrimary,
  parseStatement,
  parseDeclaration,
  parse,
}
/* No side effect */
