// Lexer for Eclexia - Pure functional JavaScript
import { TokenType, createToken, createSourceLocation, createSourceSpan, SyntaxError as EclexiaSyntaxError } from "./types.js";

const KEYWORDS = {
  agent: TokenType.AGENT,
  good: TokenType.GOOD,
  market: TokenType.MARKET,
  function: TokenType.FUNCTION,
  fn: TokenType.FUNCTION,
  const: TokenType.CONST,
  if: TokenType.IF,
  else: TokenType.ELSE,
  for: TokenType.FOR,
  in: TokenType.IN,
  while: TokenType.WHILE,
  return: TokenType.RETURN,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
};

const CURRENCY_UNITS = ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH"];

const isDigit = (c) => c >= "0" && c <= "9";
const isAlpha = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
const isAlphaNumeric = (c) => isAlpha(c) || isDigit(c);

export const tokenize = (source) => {
  let pos = 0;
  let line = 1;
  let column = 1;
  const tokens = [];

  const peek = () => pos < source.length ? source[pos] : "\0";
  const advance = () => {
    const c = peek();
    pos++;
    column++;
    return c;
  };

  const currentLoc = () => createSourceLocation(line, column, pos);

  const addToken = (type, value, literal = null) => {
    const end = currentLoc();
    const start = createSourceLocation(end.line, end.column - value.length, end.offset - value.length);
    tokens.push(createToken(type, value, literal, createSourceSpan(start, end)));
  };

  const scanString = (quote) => {
    let value = "";
    while (peek() !== quote && peek() !== "\0") {
      if (peek() === "\n") {
        line++;
        column = 1;
      }
      value += advance();
    }
    if (peek() === "\0") {
      throw new EclexiaSyntaxError("Unterminated string");
    }
    advance(); // closing quote
    addToken(TokenType.STRING, value, value);
  };

  const scanNumber = () => {
    const start = pos;
    while (isDigit(peek())) advance();
    if (peek() === ".") {
      advance();
      while (isDigit(peek())) advance();
    }

    const value = source.slice(start, pos);
    const num = parseFloat(value);

    // Check for currency suffix
    if (isAlpha(peek())) {
      const unitStart = pos;
      while (isAlpha(peek())) advance();
      const unit = source.slice(unitStart, pos);

      if (CURRENCY_UNITS.includes(unit)) {
        addToken(TokenType.CURRENCY_UNIT, value + unit, { amount: num, currency: unit });
      } else {
        addToken(TokenType.NUMBER, value, num);
      }
    } else {
      addToken(TokenType.NUMBER, value, num);
    }
  };

  const scanIdentifier = () => {
    const start = pos;
    while (isAlphaNumeric(peek())) advance();

    const value = source.slice(start, pos);
    const type = KEYWORDS[value] || TokenType.IDENTIFIER;

    const literal = type === TokenType.TRUE ? true :
                    type === TokenType.FALSE ? false :
                    type === TokenType.NULL ? null : null;

    addToken(type, value, literal);
  };

  while (pos < source.length) {
    const c = advance();

    if (c === " " || c === "\r" || c === "\t") continue;
    if (c === "\n") {
      line++;
      column = 1;
      continue;
    }

    switch (c) {
      case "(": addToken(TokenType.LPAREN, c); break;
      case ")": addToken(TokenType.RPAREN, c); break;
      case "{": addToken(TokenType.LBRACE, c); break;
      case "}": addToken(TokenType.RBRACE, c); break;
      case "[": addToken(TokenType.LBRACKET, c); break;
      case "]": addToken(TokenType.RBRACKET, c); break;
      case ",": addToken(TokenType.COMMA, c); break;
      case ".": addToken(TokenType.DOT, c); break;
      case ":": addToken(TokenType.COLON, c); break;
      case "+": addToken(TokenType.PLUS, c); break;
      case "*":
        if (peek() === "*") {
          advance();
          addToken(TokenType.POWER, "**");
        } else {
          addToken(TokenType.STAR, c);
        }
        break;
      case "/":
        if (peek() === "/") {
          while (peek() !== "\n" && peek() !== "\0") advance();
        } else {
          addToken(TokenType.SLASH, c);
        }
        break;
      case "-":
        if (peek() === ">") {
          advance();
          addToken(TokenType.ARROW, "->");
        } else {
          addToken(TokenType.MINUS, c);
        }
        break;
      case "=":
        if (peek() === "=") {
          advance();
          addToken(TokenType.EQ, "==");
        } else {
          addToken(TokenType.ASSIGN, c);
        }
        break;
      case "!":
        if (peek() === "=") {
          advance();
          addToken(TokenType.NE, "!=");
        }
        break;
      case "<":
        if (peek() === "=") {
          advance();
          addToken(TokenType.LE, "<=");
        } else {
          addToken(TokenType.LT, c);
        }
        break;
      case ">":
        if (peek() === "=") {
          advance();
          addToken(TokenType.GE, ">=");
        } else {
          addToken(TokenType.GT, c);
        }
        break;
      case '"':
      case "'":
        scanString(c);
        break;
      default:
        if (isDigit(c)) {
          pos--; // back up to re-read
          column--;
          scanNumber();
        } else if (isAlpha(c)) {
          pos--;
          column--;
          scanIdentifier();
        } else {
          throw new EclexiaSyntaxError(`Unexpected character: ${c}`);
        }
    }
  }

  const eof = currentLoc();
  tokens.push(createToken(TokenType.EOF, "", null, createSourceSpan(eof, eof)));
  return tokens;
};
