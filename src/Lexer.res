// Lexer for Eclexia language
open Types

let isDigit = (c: string) => {
  let code = c->String.charCodeAt(0)->Int.fromFloat
  code >= 48 && code <= 57 // '0' to '9'
}

let isAlpha = (c: string) => {
  let code = c->String.charCodeAt(0)->Int.fromFloat
  (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code == 95 // A-Z, a-z, _
}

let isAlphaNumeric = (c: string) => {
  isAlpha(c) || isDigit(c)
}

let keywords = [
  ("agent", AGENT),
  ("good", GOOD),
  ("market", MARKET),
  ("policy", POLICY),
  ("model", MODEL),
  ("function", FUNCTION),
  ("fn", FUNCTION),
  ("const", CONST),
  ("if", IF),
  ("else", ELSE),
  ("for", FOR),
  ("in", IN),
  ("while", WHILE),
  ("return", RETURN),
  ("and", AND),
  ("or", OR),
  ("not", NOT),
  ("true", TRUE),
  ("false", FALSE),
  ("null", NULL),
]

let currencyUnits = ["USD", "EUR", "GBP", "JPY", "CNY", "BTC", "ETH"]
let timeUnits = ["s", "m", "h", "d", "w", "M", "y", "second", "minute", "hour", "day", "week", "month", "year", "seconds", "minutes", "hours", "days", "weeks", "months", "years"]

let isCurrencyUnit = (unit: string) => {
  Array.includes(currencyUnits, unit)
}

let isTimeUnit = (unit: string) => {
  Array.includes(timeUnits, unit)
}

type lexerState = {
  source: string,
  mutable position: int,
  mutable line: int,
  mutable column: int,
  mutable tokens: array<token>,
}

let createLexer = (source: string): lexerState => {
  {
    source: source,
    position: 0,
    line: 1,
    column: 1,
    tokens: [],
  }
}

let peek = (lexer: lexerState): string => {
  if lexer.position >= String.length(lexer.source) {
    "\x00"
  } else {
    String.charAt(lexer.source, lexer.position)
  }
}

let advance = (lexer: lexerState): string => {
  let char = peek(lexer)
  lexer.position = lexer.position + 1
  lexer.column = lexer.column + 1
  char
}

let currentLocation = (lexer: lexerState): sourceLocation => {
  {
    line: lexer.line,
    column: lexer.column,
    offset: lexer.position,
  }
}

let addToken = (lexer: lexerState, tokenType: tokenType, value: string, literal: option<literalValue>, start: sourceLocation) => {
  let end_ = currentLocation(lexer)
  let token = {
    tokenType: tokenType,
    value: value,
    literal: literal,
    span: {
      start: start,
      end_: end_,
      source: None,
    },
  }
  lexer.tokens = Array.concat(lexer.tokens, [token])
}

let scanString = (lexer: lexerState, quote: string) => {
  let start = currentLocation(lexer)
  let buffer = ref("")

  while peek(lexer) != quote && peek(lexer) != "\x00" {
    let char = advance(lexer)
    if char == "\n" {
      lexer.line = lexer.line + 1
      lexer.column = 1
    }
    buffer := buffer.contents ++ char
  }

  if peek(lexer) == "\x00" {
    Error(SyntaxError("Unterminated string", None))
  } else {
    let _ = advance(lexer) // consume closing quote
    addToken(lexer, STRING, buffer.contents, Some(LitString(buffer.contents)), start)
    Ok()
  }
}

let scanNumber = (lexer: lexerState) => {
  let start = currentLocation(lexer)
  let startPos = lexer.position - 1

  while isDigit(peek(lexer)) {
    let _ = advance(lexer)
  }

  // Check for decimal
  if peek(lexer) == "." {
    let _ = advance(lexer)
    while isDigit(peek(lexer)) {
      let _ = advance(lexer)
    }
  }

  let value = String.slice(lexer.source, ~start=startPos, ~end=lexer.position)
  let num = Float.fromString(value)->Option.getOr(0.0)

  // Check for currency/quantity/time suffix
  if isAlpha(peek(lexer)) {
    let unitStart = lexer.position
    while isAlpha(peek(lexer)) {
      let _ = advance(lexer)
    }
    let unit = String.slice(lexer.source, ~start=unitStart, ~end=lexer.position)

    if isCurrencyUnit(unit) {
      addToken(lexer, CURRENCY_UNIT, value ++ unit, Some(LitCurrency(num, unit)), start)
    } else if isTimeUnit(unit) {
      addToken(lexer, TIME_UNIT, value ++ unit, Some(LitTime(num, unit)), start)
    } else {
      addToken(lexer, QUANTITY_UNIT, value ++ unit, Some(LitQuantity(num, unit)), start)
    }
  } else {
    addToken(lexer, NUMBER, value, Some(LitNumber(num)), start)
  }
}

let scanIdentifier = (lexer: lexerState) => {
  let start = currentLocation(lexer)
  let startPos = lexer.position - 1

  while isAlphaNumeric(peek(lexer)) {
    let _ = advance(lexer)
  }

  let value = String.slice(lexer.source, ~start=startPos, ~end=lexer.position)

  let tokenType = keywords
    ->Array.find(((kw, _)) => kw == value)
    ->Option.map(((_, tt)) => tt)
    ->Option.getOr(IDENTIFIER)

  let literal = switch tokenType {
  | TRUE => Some(LitBool(true))
  | FALSE => Some(LitBool(false))
  | NULL => Some(LitNull)
  | _ => None
  }

  addToken(lexer, tokenType, value, literal, start)
}

let rec scanToken = (lexer: lexerState): result<unit, eclexiaError> => {
  let start = currentLocation(lexer)
  let char = advance(lexer)

  switch char {
  | " " | "\r" | "\t" => Ok()
  | "\n" => {
      lexer.line = lexer.line + 1
      lexer.column = 1
      Ok()
    }
  | "(" => {
      addToken(lexer, LPAREN, char, None, start)
      Ok()
    }
  | ")" => {
      addToken(lexer, RPAREN, char, None, start)
      Ok()
    }
  | "{" => {
      addToken(lexer, LBRACE, char, None, start)
      Ok()
    }
  | "}" => {
      addToken(lexer, RBRACE, char, None, start)
      Ok()
    }
  | "[" => {
      addToken(lexer, LBRACKET, char, None, start)
      Ok()
    }
  | "]" => {
      addToken(lexer, RBRACKET, char, None, start)
      Ok()
    }
  | "," => {
      addToken(lexer, COMMA, char, None, start)
      Ok()
    }
  | "." => {
      addToken(lexer, DOT, char, None, start)
      Ok()
    }
  | ":" => {
      addToken(lexer, COLON, char, None, start)
      Ok()
    }
  | ";" => {
      addToken(lexer, SEMICOLON, char, None, start)
      Ok()
    }
  | "+" => {
      addToken(lexer, PLUS, char, None, start)
      Ok()
    }
  | "-" => {
      if peek(lexer) == ">" {
        let _ = advance(lexer)
        addToken(lexer, ARROW, "->", None, start)
      } else {
        addToken(lexer, MINUS, char, None, start)
      }
      Ok()
    }
  | "*" => {
      if peek(lexer) == "*" {
        let _ = advance(lexer)
        addToken(lexer, POWER, "**", None, start)
      } else {
        addToken(lexer, STAR, char, None, start)
      }
      Ok()
    }
  | "/" => {
      if peek(lexer) == "/" {
        // Skip line comment
        while peek(lexer) != "\n" && peek(lexer) != "\x00" {
          let _ = advance(lexer)
        }
        Ok()
      } else {
        addToken(lexer, SLASH, char, None, start)
        Ok()
      }
    }
  | "%" => {
      addToken(lexer, PERCENT, char, None, start)
      Ok()
    }
  | "=" => {
      if peek(lexer) == "=" {
        let _ = advance(lexer)
        addToken(lexer, EQ, "==", None, start)
      } else if peek(lexer) == ">" {
        let _ = advance(lexer)
        addToken(lexer, FAT_ARROW, "=>", None, start)
      } else {
        addToken(lexer, ASSIGN, char, None, start)
      }
      Ok()
    }
  | "!" => {
      if peek(lexer) == "=" {
        let _ = advance(lexer)
        addToken(lexer, NE, "!=", None, start)
      } else {
        addToken(lexer, NOT, char, None, start)
      }
      Ok()
    }
  | "<" => {
      if peek(lexer) == "=" {
        let _ = advance(lexer)
        addToken(lexer, LE, "<=", None, start)
      } else {
        addToken(lexer, LT, char, None, start)
      }
      Ok()
    }
  | ">" => {
      if peek(lexer) == "=" {
        let _ = advance(lexer)
        addToken(lexer, GE, ">=", None, start)
      } else {
        addToken(lexer, GT, char, None, start)
      }
      Ok()
    }
  | "\"" | "'" => scanString(lexer, char)
  | c if isDigit(c) => {
      scanNumber(lexer)
      Ok()
    }
  | c if isAlpha(c) => {
      scanIdentifier(lexer)
      Ok()
    }
  | _ => Error(SyntaxError("Unexpected character: " ++ char, None))
  }
}

let tokenize = (source: string): result<array<token>, eclexiaError> => {
  let lexer = createLexer(source)

  let rec loop = () => {
    if lexer.position >= String.length(lexer.source) {
      Ok()
    } else {
      switch scanToken(lexer) {
      | Ok() => loop()
      | Error(e) => Error(e)
      }
    }
  }

  switch loop() {
  | Ok() => {
      let eofStart = currentLocation(lexer)
      addToken(lexer, EOF, "", None, eofStart)
      Ok(lexer.tokens)
    }
  | Error(e) => Error(e)
  }
}
