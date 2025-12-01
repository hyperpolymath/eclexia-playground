// Parser for Eclexia
open Types

type parserState = {
  tokens: array<token>,
  mutable current: int,
}

let createParser = (tokens: array<token>): parserState => {
  {
    tokens: tokens,
    current: 0,
  }
}

let peek = (parser: parserState): token => {
  Array.get(parser.tokens, parser.current)->Option.getOr({
    tokenType: EOF,
    value: "",
    literal: None,
    span: {
      start: {line: 0, column: 0, offset: 0},
      end_: {line: 0, column: 0, offset: 0},
      source: None,
    },
  })
}

let advance = (parser: parserState): token => {
  let token = peek(parser)
  parser.current = parser.current + 1
  token
}

let check = (parser: parserState, tokenType: tokenType): bool => {
  let token = peek(parser)
  token.tokenType == tokenType
}

let match_ = (parser: parserState, tokenTypes: array<tokenType>): bool => {
  let matches = Array.some(tokenTypes, tt => check(parser, tt))
  if matches {
    let _ = advance(parser)
    true
  } else {
    false
  }
}

let consume = (parser: parserState, tokenType: tokenType, message: string): result<token, eclexiaError> => {
  if check(parser, tokenType) {
    Ok(advance(parser))
  } else {
    Error(SyntaxError(message, None))
  }
}

let rec parseExpression = (parser: parserState): result<expression, eclexiaError> => {
  parseBinary(parser)
}

and parseBinary = (parser: parserState): result<expression, eclexiaError> => {
  parsePrimary(parser)
}

and parsePrimary = (parser: parserState): result<expression, eclexiaError> => {
  let token = peek(parser)

  switch token.tokenType {
  | NUMBER => {
      let _ = advance(parser)
      switch token.literal {
      | Some(lit) => Ok(Literal(lit, token.span))
      | None => Ok(Literal(LitNumber(0.0), token.span))
      }
    }
  | STRING => {
      let _ = advance(parser)
      switch token.literal {
      | Some(lit) => Ok(Literal(lit, token.span))
      | None => Ok(Literal(LitString(""), token.span))
      }
    }
  | TRUE | FALSE => {
      let _ = advance(parser)
      switch token.literal {
      | Some(lit) => Ok(Literal(lit, token.span))
      | None => Ok(Literal(LitBool(false), token.span))
      }
    }
  | NULL => {
      let _ = advance(parser)
      Ok(Literal(LitNull, token.span))
    }
  | IDENTIFIER => {
      let _ = advance(parser)
      Ok(Identifier(token.value, token.span))
    }
  | CURRENCY_UNIT => {
      let _ = advance(parser)
      switch token.literal {
      | Some(lit) => Ok(Literal(lit, token.span))
      | None => Ok(Literal(LitCurrency(0.0, "USD"), token.span))
      }
    }
  | LBRACKET => {
      let _ = advance(parser)
      let elements = []

      if !check(parser, RBRACKET) {
        // Parse array elements (simplified)
      }

      switch consume(parser, RBRACKET, "Expected ']'") {
      | Ok(_) => Ok(ArrayExpr(elements, token.span))
      | Error(e) => Error(e)
      }
    }
  | LPAREN => {
      let _ = advance(parser)
      let expr = parseExpression(parser)
      switch consume(parser, RPAREN, "Expected ')'") {
      | Ok(_) => expr
      | Error(e) => Error(e)
      }
    }
  | _ => Error(SyntaxError("Expected expression", Some(token.span)))
  }
}

let parseStatement = (parser: parserState): result<statement, eclexiaError> => {
  if match_(parser, [CONST]) {
    switch consume(parser, IDENTIFIER, "Expected variable name") {
    | Ok(nameToken) => {
        switch consume(parser, ASSIGN, "Expected '='") {
        | Ok(_) => {
            switch parseExpression(parser) {
            | Ok(expr) => Ok(ConstDecl(nameToken.value, expr))
            | Error(e) => Error(e)
            }
          }
        | Error(e) => Error(e)
        }
      }
    | Error(e) => Error(e)
    }
  } else if match_(parser, [RETURN]) {
    let expr = if check(parser, SEMICOLON) || check(parser, RBRACE) {
      None
    } else {
      switch parseExpression(parser) {
      | Ok(e) => Some(e)
      | Error(_) => None
      }
    }
    Ok(ReturnStmt(expr))
  } else {
    switch parseExpression(parser) {
    | Ok(expr) => Ok(ExprStmt(expr))
    | Error(e) => Error(e)
    }
  }
}

let parseDeclaration = (parser: parserState): result<declaration, eclexiaError> => {
  if match_(parser, [FUNCTION]) {
    switch consume(parser, IDENTIFIER, "Expected function name") {
    | Ok(nameToken) => {
        switch consume(parser, LPAREN, "Expected '('") {
        | Ok(_) => {
            // Simplified: skip parameter parsing
            let params = []

            switch consume(parser, RPAREN, "Expected ')'") {
            | Ok(_) => {
                switch consume(parser, LBRACE, "Expected '{'") {
                | Ok(_) => {
                    let body = []
                    // Parse body statements (simplified)

                    switch consume(parser, RBRACE, "Expected '}'") {
                    | Ok(_) => Ok(Statement(FunctionDecl({
                        name: nameToken.value,
                        parameters: params,
                        body: body,
                      })))
                    | Error(e) => Error(e)
                    }
                  }
                | Error(e) => Error(e)
                }
              }
            | Error(e) => Error(e)
            }
          }
        | Error(e) => Error(e)
        }
      }
    | Error(e) => Error(e)
    }
  } else {
    switch parseStatement(parser) {
    | Ok(stmt) => Ok(Statement(stmt))
    | Error(e) => Error(e)
    }
  }
}

let parse = (tokens: array<token>): result<program, eclexiaError> => {
  let parser = createParser(tokens)
  let declarations = []

  let rec loop = () => {
    if check(parser, EOF) {
      Ok(declarations)
    } else {
      switch parseDeclaration(parser) {
      | Ok(decl) => {
          Array.push(declarations, decl)
          loop()
        }
      | Error(e) => Error(e)
      }
    }
  }

  switch loop() {
  | Ok(decls) => Ok({declarations: decls})
  | Error(e) => Error(e)
  }
}
