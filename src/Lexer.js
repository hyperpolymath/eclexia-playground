

import * as Js_string from "rescript/lib/es6/js_string.js";
import * as Belt_Float from "rescript/lib/es6/belt_Float.js";

function isDigit(c) {
  var code = Math.trunc(Js_string.charCodeAt(0, c));
  if (code >= 48) {
    return code <= 57;
  } else {
    return false;
  }
}

function isAlpha(c) {
  var code = Math.trunc(Js_string.charCodeAt(0, c));
  if (code >= 65 && code <= 90 || code >= 97 && code <= 122) {
    return true;
  } else {
    return code === 95;
  }
}

function isAlphaNumeric(c) {
  if (isAlpha(c)) {
    return true;
  } else {
    return isDigit(c);
  }
}

var keywords = [
  [
    "agent",
    "AGENT"
  ],
  [
    "good",
    "GOOD"
  ],
  [
    "market",
    "MARKET"
  ],
  [
    "policy",
    "POLICY"
  ],
  [
    "model",
    "MODEL"
  ],
  [
    "function",
    "FUNCTION"
  ],
  [
    "fn",
    "FUNCTION"
  ],
  [
    "const",
    "CONST"
  ],
  [
    "if",
    "IF"
  ],
  [
    "else",
    "ELSE"
  ],
  [
    "for",
    "FOR"
  ],
  [
    "in",
    "IN"
  ],
  [
    "while",
    "WHILE"
  ],
  [
    "return",
    "RETURN"
  ],
  [
    "and",
    "AND"
  ],
  [
    "or",
    "OR"
  ],
  [
    "not",
    "NOT"
  ],
  [
    "true",
    "TRUE"
  ],
  [
    "false",
    "FALSE"
  ],
  [
    "null",
    "NULL"
  ]
];

var currencyUnits = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "BTC",
  "ETH"
];

var timeUnits = [
  "s",
  "m",
  "h",
  "d",
  "w",
  "M",
  "y",
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years"
];

function isCurrencyUnit(unit) {
  return currencyUnits.includes(unit);
}

function isTimeUnit(unit) {
  return timeUnits.includes(unit);
}

function createLexer(source) {
  return {
          source: source,
          position: 0,
          line: 1,
          column: 1,
          tokens: []
        };
}

function peek(lexer) {
  if (lexer.position >= lexer.source.length) {
    return "\x00";
  } else {
    return lexer.source.charAt(lexer.position);
  }
}

function advance(lexer) {
  var $$char = peek(lexer);
  lexer.position = lexer.position + 1 | 0;
  lexer.column = lexer.column + 1 | 0;
  return $$char;
}

function currentLocation(lexer) {
  return {
          line: lexer.line,
          column: lexer.column,
          offset: lexer.position
        };
}

function addToken(lexer, tokenType, value, literal, start) {
  var end_ = currentLocation(lexer);
  var token_span = {
    start: start,
    end_: end_,
    source: undefined
  };
  var token = {
    tokenType: tokenType,
    value: value,
    literal: literal,
    span: token_span
  };
  lexer.tokens = lexer.tokens.concat([token]);
}

function scanString(lexer, quote) {
  var start = currentLocation(lexer);
  var buffer = "";
  while(peek(lexer) !== quote && peek(lexer) !== "\x00") {
    var $$char = advance(lexer);
    if ($$char === "\n") {
      lexer.line = lexer.line + 1 | 0;
      lexer.column = 1;
    }
    buffer = buffer + $$char;
  };
  if (peek(lexer) === "\x00") {
    return {
            TAG: "Error",
            _0: {
              TAG: "SyntaxError",
              _0: "Unterminated string",
              _1: undefined
            }
          };
  } else {
    advance(lexer);
    addToken(lexer, "STRING", buffer, {
          TAG: "LitString",
          _0: buffer
        }, start);
    return {
            TAG: "Ok",
            _0: undefined
          };
  }
}

function scanNumber(lexer) {
  var start = currentLocation(lexer);
  var startPos = lexer.position - 1 | 0;
  while(isDigit(peek(lexer))) {
    advance(lexer);
  };
  if (peek(lexer) === ".") {
    advance(lexer);
    while(isDigit(peek(lexer))) {
      advance(lexer);
    };
  }
  var value = lexer.source.slice(startPos, lexer.position);
  var n = Belt_Float.fromString(value);
  var num = n !== undefined ? n : 0.0;
  if (!isAlpha(peek(lexer))) {
    return addToken(lexer, "NUMBER", value, {
                TAG: "LitNumber",
                _0: num
              }, start);
  }
  var unitStart = lexer.position;
  while(isAlpha(peek(lexer))) {
    advance(lexer);
  };
  var unit = lexer.source.slice(unitStart, lexer.position);
  if (currencyUnits.includes(unit)) {
    return addToken(lexer, "CURRENCY_UNIT", value + unit, {
                TAG: "LitCurrency",
                _0: num,
                _1: unit
              }, start);
  } else if (timeUnits.includes(unit)) {
    return addToken(lexer, "TIME_UNIT", value + unit, {
                TAG: "LitTime",
                _0: num,
                _1: unit
              }, start);
  } else {
    return addToken(lexer, "QUANTITY_UNIT", value + unit, {
                TAG: "LitQuantity",
                _0: num,
                _1: unit
              }, start);
  }
}

function scanIdentifier(lexer) {
  var start = currentLocation(lexer);
  var startPos = lexer.position - 1 | 0;
  while(isAlphaNumeric(peek(lexer))) {
    advance(lexer);
  };
  var value = lexer.source.slice(startPos, lexer.position);
  var match = keywords.find(function (param) {
        return param[0] === value;
      });
  var tokenType = match !== undefined ? match[1] : "IDENTIFIER";
  var literal;
  switch (tokenType) {
    case "TRUE" :
        literal = {
          TAG: "LitBool",
          _0: true
        };
        break;
    case "FALSE" :
        literal = {
          TAG: "LitBool",
          _0: false
        };
        break;
    case "NULL" :
        literal = "LitNull";
        break;
    default:
      literal = undefined;
  }
  addToken(lexer, tokenType, value, literal, start);
}

function scanToken(lexer) {
  var start = currentLocation(lexer);
  var $$char = advance(lexer);
  switch ($$char) {
    case "!" :
        if (peek(lexer) === "=") {
          advance(lexer);
          addToken(lexer, "NE", "!=", undefined, start);
        } else {
          addToken(lexer, "NOT", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "%" :
        addToken(lexer, "PERCENT", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "(" :
        addToken(lexer, "LPAREN", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case ")" :
        addToken(lexer, "RPAREN", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "*" :
        if (peek(lexer) === "*") {
          advance(lexer);
          addToken(lexer, "POWER", "**", undefined, start);
        } else {
          addToken(lexer, "STAR", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "+" :
        addToken(lexer, "PLUS", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "," :
        addToken(lexer, "COMMA", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "-" :
        if (peek(lexer) === ">") {
          advance(lexer);
          addToken(lexer, "ARROW", "->", undefined, start);
        } else {
          addToken(lexer, "MINUS", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "." :
        addToken(lexer, "DOT", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "/" :
        if (peek(lexer) === "/") {
          while(peek(lexer) !== "\n" && peek(lexer) !== "\x00") {
            advance(lexer);
          };
          return {
                  TAG: "Ok",
                  _0: undefined
                };
        }
        addToken(lexer, "SLASH", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case ":" :
        addToken(lexer, "COLON", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case ";" :
        addToken(lexer, "SEMICOLON", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "<" :
        if (peek(lexer) === "=") {
          advance(lexer);
          addToken(lexer, "LE", "<=", undefined, start);
        } else {
          addToken(lexer, "LT", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "=" :
        if (peek(lexer) === "=") {
          advance(lexer);
          addToken(lexer, "EQ", "==", undefined, start);
        } else if (peek(lexer) === ">") {
          advance(lexer);
          addToken(lexer, "FAT_ARROW", "=>", undefined, start);
        } else {
          addToken(lexer, "ASSIGN", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case ">" :
        if (peek(lexer) === "=") {
          advance(lexer);
          addToken(lexer, "GE", ">=", undefined, start);
        } else {
          addToken(lexer, "GT", $$char, undefined, start);
        }
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "[" :
        addToken(lexer, "LBRACKET", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "'" :
    case "\"" :
        return scanString(lexer, $$char);
    case "\n" :
        lexer.line = lexer.line + 1 | 0;
        lexer.column = 1;
        return {
                TAG: "Ok",
                _0: undefined
              };
    case " " :
    case "\r" :
    case "\t" :
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "]" :
        addToken(lexer, "RBRACKET", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "{" :
        addToken(lexer, "LBRACE", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    case "}" :
        addToken(lexer, "RBRACE", $$char, undefined, start);
        return {
                TAG: "Ok",
                _0: undefined
              };
    default:
      if (isDigit($$char)) {
        scanNumber(lexer);
        return {
                TAG: "Ok",
                _0: undefined
              };
      } else if (isAlpha($$char)) {
        scanIdentifier(lexer);
        return {
                TAG: "Ok",
                _0: undefined
              };
      } else {
        return {
                TAG: "Error",
                _0: {
                  TAG: "SyntaxError",
                  _0: "Unexpected character: " + $$char,
                  _1: undefined
                }
              };
      }
  }
}

function tokenize(source) {
  var lexer = createLexer(source);
  var loop = function () {
    while(true) {
      if (lexer.position >= lexer.source.length) {
        return {
                TAG: "Ok",
                _0: undefined
              };
      }
      var e = scanToken(lexer);
      if (e.TAG !== "Ok") {
        return {
                TAG: "Error",
                _0: e._0
              };
      }
      _param = undefined;
      continue ;
    };
  };
  var e = loop();
  if (e.TAG !== "Ok") {
    return {
            TAG: "Error",
            _0: e._0
          };
  }
  var eofStart = currentLocation(lexer);
  addToken(lexer, "EOF", "", undefined, eofStart);
  return {
          TAG: "Ok",
          _0: lexer.tokens
        };
}

export {
  isDigit ,
  isAlpha ,
  isAlphaNumeric ,
  keywords ,
  currencyUnits ,
  timeUnits ,
  isCurrencyUnit ,
  isTimeUnit ,
  createLexer ,
  peek ,
  advance ,
  currentLocation ,
  addToken ,
  scanString ,
  scanNumber ,
  scanIdentifier ,
  scanToken ,
  tokenize ,
}
/* No side effect */
