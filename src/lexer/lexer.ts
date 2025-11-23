/**
 * Lexer for the Eclexia language
 * Converts source code into a stream of tokens
 */

import type { SourceLocation } from "../types.ts";
import { SyntaxError } from "../types.ts";
import {
  createToken,
  getKeywordType,
  isCurrencyUnit,
  isTimeUnit,
  type Token,
  TokenType,
} from "./token.ts";

export class Lexer {
  private source: string;
  private position = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.scanToken();
    }

    this.addToken(TokenType.EOF, "");
    return this.tokens;
  }

  private scanToken(): void {
    const start = this.currentLocation();
    const char = this.advance();

    switch (char) {
      // Whitespace
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;

      case "\n":
        this.line++;
        this.column = 1;
        break;

      // Single-character tokens
      case "(":
        this.addToken(TokenType.LPAREN, char);
        break;
      case ")":
        this.addToken(TokenType.RPAREN, char);
        break;
      case "{":
        this.addToken(TokenType.LBRACE, char);
        break;
      case "}":
        this.addToken(TokenType.RBRACE, char);
        break;
      case "[":
        this.addToken(TokenType.LBRACKET, char);
        break;
      case "]":
        this.addToken(TokenType.RBRACKET, char);
        break;
      case ",":
        this.addToken(TokenType.COMMA, char);
        break;
      case ".":
        if (this.match(".")) {
          if (this.match(".")) {
            this.addToken(TokenType.RANGE_INCLUSIVE, "...");
          } else {
            this.addToken(TokenType.RANGE, "..");
          }
        } else {
          this.addToken(TokenType.DOT, char);
        }
        break;
      case ":":
        this.addToken(TokenType.COLON, char);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON, char);
        break;
      case "?":
        if (this.match("?")) {
          this.addToken(TokenType.COALESCE, "??");
        } else {
          this.addToken(TokenType.QUESTION, char);
        }
        break;
      case "|":
        this.addToken(TokenType.PIPE, char);
        break;

      // Operators (potentially multi-character)
      case "+":
        if (this.match("=")) {
          this.addToken(TokenType.PLUS_ASSIGN, "+=");
        } else {
          this.addToken(TokenType.PLUS, char);
        }
        break;

      case "-":
        if (this.match("=")) {
          this.addToken(TokenType.MINUS_ASSIGN, "-=");
        } else if (this.match(">")) {
          this.addToken(TokenType.ARROW, "->");
        } else {
          this.addToken(TokenType.MINUS, char);
        }
        break;

      case "*":
        if (this.match("=")) {
          this.addToken(TokenType.STAR_ASSIGN, "*=");
        } else if (this.match("*")) {
          this.addToken(TokenType.POWER, "**");
        } else {
          this.addToken(TokenType.STAR, char);
        }
        break;

      case "/":
        if (this.match("/")) {
          // Single-line comment
          this.skipLineComment();
        } else if (this.match("*")) {
          // Multi-line comment
          this.skipBlockComment();
        } else if (this.match("=")) {
          this.addToken(TokenType.SLASH_ASSIGN, "/=");
        } else {
          this.addToken(TokenType.SLASH, char);
        }
        break;

      case "%":
        if (this.match("=")) {
          this.addToken(TokenType.PERCENT_ASSIGN, "%=");
        } else {
          this.addToken(TokenType.PERCENT, char);
        }
        break;

      case "=":
        if (this.match("=")) {
          this.addToken(TokenType.EQ, "==");
        } else if (this.match(">")) {
          this.addToken(TokenType.FAT_ARROW, "=>");
        } else {
          this.addToken(TokenType.ASSIGN, char);
        }
        break;

      case "!":
        if (this.match("=")) {
          this.addToken(TokenType.NE, "!=");
        } else {
          this.addToken(TokenType.NOT, char);
        }
        break;

      case "<":
        if (this.match("=")) {
          this.addToken(TokenType.LE, "<=");
        } else {
          this.addToken(TokenType.LT, char);
        }
        break;

      case ">":
        if (this.match("=")) {
          this.addToken(TokenType.GE, ">=");
        } else {
          this.addToken(TokenType.GT, char);
        }
        break;

      // String literals
      case '"':
      case "'":
        this.scanString(char);
        break;

      default:
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char)) {
          this.scanIdentifier();
        } else {
          throw new SyntaxError(
            `Unexpected character: '${char}'`,
            { start, end: this.currentLocation() },
          );
        }
        break;
    }
  }

  private scanString(quote: string): void {
    const start = this.currentLocation();
    let value = "";

    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === "\\") {
        this.advance(); // consume backslash
        const escaped = this.advance();
        switch (escaped) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          case "r":
            value += "\r";
            break;
          case "\\":
            value += "\\";
            break;
          case quote:
            value += quote;
            break;
          default:
            value += escaped;
        }
      } else {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 0;
        }
        value += this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new SyntaxError(
        "Unterminated string literal",
        { start, end: this.currentLocation() },
      );
    }

    this.advance(); // consume closing quote
    this.addToken(TokenType.STRING, `${quote}${value}${quote}`, value);
  }

  private scanNumber(): void {
    const start = this.position - 1;

    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    // Exponential part
    if (this.peek() === "e" || this.peek() === "E") {
      this.advance();
      if (this.peek() === "+" || this.peek() === "-") {
        this.advance();
      }
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = this.source.slice(start, this.position);
    const number = parseFloat(value);

    // Check for currency or unit suffix
    if (this.isAlpha(this.peek())) {
      const unitStart = this.position;
      while (this.isAlpha(this.peek())) {
        this.advance();
      }
      const unit = this.source.slice(unitStart, this.position);

      if (isCurrencyUnit(unit)) {
        this.addToken(TokenType.CURRENCY_UNIT, `${value}${unit}`, { amount: number, currency: unit });
      } else if (isTimeUnit(unit)) {
        this.addToken(TokenType.TIME_UNIT, `${value}${unit}`, { value: number, unit });
      } else {
        this.addToken(TokenType.QUANTITY_UNIT, `${value}${unit}`, { amount: number, unit });
      }
    } else {
      this.addToken(TokenType.NUMBER, value, number);
    }
  }

  private scanIdentifier(): void {
    const start = this.position - 1;

    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const value = this.source.slice(start, this.position);
    const keywordType = getKeywordType(value);

    if (keywordType) {
      // Handle boolean and null literals
      if (keywordType === TokenType.TRUE) {
        this.addToken(keywordType, value, true);
      } else if (keywordType === TokenType.FALSE) {
        this.addToken(keywordType, value, false);
      } else if (keywordType === TokenType.NULL) {
        this.addToken(keywordType, value, null);
      } else {
        this.addToken(keywordType, value);
      }
    } else {
      this.addToken(TokenType.IDENTIFIER, value);
    }
  }

  private skipLineComment(): void {
    while (!this.isAtEnd() && this.peek() !== "\n") {
      this.advance();
    }
  }

  private skipBlockComment(): void {
    const start = this.currentLocation();
    let depth = 1;

    while (!this.isAtEnd() && depth > 0) {
      if (this.peek() === "/" && this.peekNext() === "*") {
        depth++;
        this.advance();
        this.advance();
      } else if (this.peek() === "*" && this.peekNext() === "/") {
        depth--;
        this.advance();
        this.advance();
      } else {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 0;
        }
        this.advance();
      }
    }

    if (depth > 0) {
      throw new SyntaxError(
        "Unterminated block comment",
        { start, end: this.currentLocation() },
      );
    }
  }

  private addToken(
    type: TokenType,
    value: string,
    literal?: number | string | boolean | null | { amount: number; currency?: string; unit?: string; value?: number },
  ): void {
    const end = this.currentLocation();
    const start = {
      line: end.line,
      column: end.column - value.length,
      offset: end.offset - value.length,
    };

    this.tokens.push(createToken(type, value, start, end, literal));
  }

  private advance(): string {
    const char = this.source[this.position];
    this.position++;
    this.column++;
    return char;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd() || this.source[this.position] !== expected) {
      return false;
    }

    this.position++;
    this.column++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source[this.position];
  }

  private peekNext(): string {
    if (this.position + 1 >= this.source.length) return "\0";
    return this.source[this.position + 1];
  }

  private isAtEnd(): boolean {
    return this.position >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private currentLocation(): SourceLocation {
    return {
      line: this.line,
      column: this.column,
      offset: this.position,
    };
  }
}

export function tokenize(source: string): Token[] {
  const lexer = new Lexer(source);
  return lexer.tokenize();
}
