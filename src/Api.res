// Public API for Eclexia
open Types

type compileResult = {
  ast: option<program>,
  errors: array<string>,
}

type runResult = {
  value: option<runtimeValue>,
  errors: array<string>,
}

let errorToString = (error: eclexiaError): string => {
  switch error {
  | SyntaxError(msg, _) => "SyntaxError: " ++ msg
  | RuntimeError(msg, _) => "RuntimeError: " ++ msg
  | TypeError(msg, _) => "TypeError: " ++ msg
  }
}

let compile = (source: string): compileResult => {
  switch Lexer.tokenize(source) {
  | Ok(tokens) =>
    switch Parser.parse(tokens) {
    | Ok(ast) => {ast: Some(ast), errors: []}
    | Error(e) => {ast: None, errors: [errorToString(e)]}
    }
  | Error(e) => {ast: None, errors: [errorToString(e)]}
  }
}

let run = (source: string): runResult => {
  switch Lexer.tokenize(source) {
  | Ok(tokens) =>
    switch Parser.parse(tokens) {
    | Ok(ast) =>
      switch Runtime.evalProgram(ast) {
      | Ok(value) => {value: Some(value), errors: []}
      | Error(e) => {value: None, errors: [errorToString(e)]}
      }
    | Error(e) => {value: None, errors: [errorToString(e)]}
    }
  | Error(e) => {value: None, errors: [errorToString(e)]}
  }
}
