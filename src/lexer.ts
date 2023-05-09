import { Type } from "./checker";
import {
  dropFromString,
  isAlphaNum,
  isDigit,
  isLetter,
  take,
  takeWhile,
} from "./utils";

export type OP = "+" | "-" | "*" | "/" | "%" | "<" | ">" | "==" | "!=" | "<=" | ">=";

export type Token =
  | { type: "Literal"; value: string }
  | { type: "String"; value: string }
  | { type: "Number"; value: number }
  | { type: "Boolean"; value: boolean }
  | { type: "TypeDeclaration", tyValue: Type }
  | { type: "VariableDeclaration" }
  | { type: "Equal" }
  | { type: "FunctionDeclaration" }
  | { type: "OpenParentheses" }
  | { type: "CloseParentheses" }
  | { type: "Comma" }
  | { type: "OpenCurlyBracket" }
  | { type: "CloseCurlyBracket" }
  | { type: "Return" }
  | { type: "IfDeclaration" }
  | { type: "OP"; value: OP }
  | { type: "Colon" }
  | { type: "SemiColon" };

export type TokenType = Token["type"];

export const tokenToString = (token: Token): string => {
  if (token.type === "TypeDeclaration") {
    return token.tyValue.type;
  }

  if (token.type === "VariableDeclaration") {
    return "cria";
  }

  if (token.type === "Equal") {
    return "=";
  }

  if (token.type === "FunctionDeclaration") {
    return "pegaVisao";
  }

  if (token.type === "OpenParentheses") {
    return "(";
  }

  if (token.type === "CloseParentheses") {
    return ")";
  }

  if (token.type === "Comma") {
    return ",";
  }

  if (token.type === "OpenCurlyBracket") {
    return "{";
  }

  if (token.type === "CloseCurlyBracket") {
    return "}";
  }

  if (token.type === "Return") {
    return "tomali";
  }

  if (token.type === "IfDeclaration") {
    return "qualfoi?";
  }

  if (token.type === 'Colon') {
    return ':';
  }

  if (token.type === "SemiColon") {
    return ";";
  }

  return String(token.value);
};

export const takeLiteral = (str: string): [string, string] => {
  const literal = takeWhile(
    str,
    (c) => isAlphaNum(c) || c === "_" || c === "-"
  );
  const rest = dropFromString(str, literal.length);

  return [literal, rest];
};

export const takeString = (str: string): [string, string] => {
  const strWithoutFirstQuote = dropFromString(str, 1);

  const string = takeWhile(strWithoutFirstQuote, (c) => c !== '"' && c !== '\'' );
  const rest = dropFromString(strWithoutFirstQuote, string.length + 1);

  return [string, rest];
};

export const takeNumber = (str: string): [number, string] => {
  const number = takeWhile(str, (c) => isDigit(c));
  const rest = dropFromString(str, number.length);

  return [Number(number), rest];
};

export const lexer = (str: string): Token[] => {
  if (!str[0]) return [];

  const current = str[0];

  if (isDigit(current)) {
    const [number, rest] = takeNumber(str);

    return [{ type: "Number", value: number }, ...lexer(rest)];
  } else if (isLetter(current)) {
    if (current === "c" && take(str, 4) === "cria") {
      return [
        { type: "VariableDeclaration" },
        ...lexer(dropFromString(str, 4)),
      ];
    }

    if (current === "p" && take(str, 9) === "pegaVisao") {
      return [
        { type: "FunctionDeclaration" },
        ...lexer(dropFromString(str, 9)),
      ];
    }

    if (current === "t" && take(str, 6) === "tomali") {
      return [{ type: "Return" }, ...lexer(dropFromString(str, 6))];
    }

    if (current === "t" && take(str, 4) === "true") {
      return [
        { type: "Boolean", value: true },
        ...lexer(dropFromString(str, 4)),
      ];
    }

    if (current === "f" && take(str, 5) === "false") {
      return [
        { type: "Boolean", value: false },
        ...lexer(dropFromString(str, 5)),
      ];
    }

    if (current === "q" && take(str, 8) === "qualfoi?") {
      return [{ type: "IfDeclaration" }, ...lexer(dropFromString(str, 8))];
    }

    if (current === "s" && take(str, 6) === "string") {
      return [{ type: "TypeDeclaration", tyValue: { type: "String" } }, ...lexer(dropFromString(str, 6))];
    }

    if (current === "n" && take(str, 6) === "number") {
      return [{ type: "TypeDeclaration", tyValue: { type: "Number" } }, ...lexer(dropFromString(str, 6))];
    }

    if (current === "b" && take(str, 7) === "boolean") {
      return [{ type: "TypeDeclaration", tyValue: { type: "Boolean" } }, ...lexer(dropFromString(str, 7))];
    }

    const [literal, rest] = takeLiteral(str);

    return [{ type: "Literal", value: literal }, ...lexer(rest)];
  } else {
    const xs = dropFromString(str, 1);

    if (current === '"' || current === '\'') {
      const [string, rest] = takeString(str);

      return [{ type: "String", value: string }, ...lexer(rest)];
    }

    if (current === "=" && take(str, 2) === "==") {
      return [{ type: "OP", value: "==" }, ...lexer(dropFromString(str, 2))];
    }

    if (current === "=") {
      return [{ type: "Equal" }, ...lexer(xs)];
    }

    if (current === "(") {
      return [{ type: "OpenParentheses" }, ...lexer(xs)];
    }

    if (current === ")") {
      return [{ type: "CloseParentheses" }, ...lexer(xs)];
    }

    if (current === ",") {
      return [{ type: "Comma" }, ...lexer(xs)];
    }

    if (current === "{") {
      return [{ type: "OpenCurlyBracket" }, ...lexer(xs)];
    }

    if (current === "}") {
      return [{ type: "CloseCurlyBracket" }, ...lexer(xs)];
    }

    if (current === "!" && take(str, 2) === "!=") {
      return [{ type: "OP", value: "!=" }, ...lexer(dropFromString(str, 2))];
    }

    if (current === "+") {
      return [{ type: "OP", value: "+" }, ...lexer(xs)];
    }

    if (current === "-") {
      return [{ type: "OP", value: "-" }, ...lexer(xs)];
    }

    if (current === "*") {
      return [{ type: "OP", value: "*" }, ...lexer(xs)];
    }

    if (current === "/") {
      return [{ type: "OP", value: "/" }, ...lexer(xs)];
    }

    if (current === "%") {
      return [{ type: "OP", value: "%" }, ...lexer(xs)];
    }

    if (current === ">" && take(str, 2) === ">=") {
      return [{ type: "OP", value: ">=" }, ...lexer(dropFromString(str, 2))];
    }

    if (current === ">") {
      return [{ type: "OP", value: ">" }, ...lexer(xs)];
    }

    if (current === "<" && take(str, 2) === "<=") {
      return [{ type: "OP", value: "<=" }, ...lexer(dropFromString(str, 2))];
    }

    if (current === "<") {
      return [{ type: "OP", value: "<" }, ...lexer(xs)];
    }

    if (current === ":") {
      return [{ type: "Colon" }, ...lexer(xs)];
    }

    if (current === ";") {
      return [{ type: "SemiColon" }, ...lexer(xs)];
    }

    return lexer(xs);
  }
};
