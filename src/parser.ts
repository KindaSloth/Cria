import { Expr } from "./ast";
import { Type } from "./checker";
import { Token, TokenType } from "./lexer";

type ExtractToken<T extends Token["type"]> = Extract<Token, { type: T }>;

export class Parser {
  tokens: Token[];
  pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token | null {
    return this.tokens[this.pos] || null;
  }

  private consume<T extends TokenType>(expected: T): ExtractToken<T> {
    const currentToken = this.peek();

    if (!currentToken) {
      throw new Error(`Expected: ${expected}, but found: Nothing`);
    }

    this.pos++;

    // type guard function to narrow down the type of the currentToken variable
    function isToken<T extends Token["type"]>(
      token: Token,
      type: T
    ): token is ExtractToken<T> {
      return token.type === type;
    }

    // use the type guard function to return the correct type
    if (isToken(currentToken, expected)) {
      return currentToken;
    }

    throw new Error(`Expected: ${expected}, but found: ${currentToken.type}`);
  }

  private parseVariable(): Expr {
    this.consume("VariableDeclaration");
    const name = this.consume("Literal");
    this.consume("Equal");

    const value: Expr = this.parseOne();
    const optionalSemicolon = this.peek();

    if (optionalSemicolon?.type === "SemiColon") {
      this.consume("SemiColon");
    }

    return { type: "Variable", name: name.value, value };
  }

  private parseFunction(): Expr {
    this.consume("FunctionDeclaration");
    const name = this.consume("Literal");

    this.consume("OpenParentheses");

    const params: { name: string; ty: Type }[] = [];

    if (this.peek()?.type !== "CloseParentheses") {
      const lit = this.consume("Literal");
      this.consume("Colon");
      const ty = this.consume("TypeDeclaration");
      params.push({ name: lit.value, ty: ty.tyValue });

      if (this.peek()?.type === "Comma") {
        while (this.peek()?.type !== "CloseParentheses") {
          this.consume("Comma");

          // calling this of newLit and newTy just to avoid shadowing
          const newLit = this.consume("Literal");
          this.consume("Colon");
          const newTy = this.consume("TypeDeclaration");
          params.push({ name: newLit.value, ty: newTy.tyValue });
        }
      }
    }

    this.consume("CloseParentheses");

    this.consume("Colon");
    const returnTy = this.consume("TypeDeclaration");

    this.consume("OpenCurlyBracket");

    const body: Expr[] = [];

    while (this.peek()?.type !== "CloseCurlyBracket") {
      body.push(this.parseOne());
    }

    this.consume("CloseCurlyBracket");

    return {
      type: "Function",
      name: name.value,
      params: params,
      body,
      returnTy: returnTy.tyValue,
    };
  }

  private parseIf(): Expr {
    this.consume("IfDeclaration");

    this.consume("OpenParentheses");

    const condition = this.parseOne();

    this.consume("CloseParentheses");

    this.consume("OpenCurlyBracket");

    const then: Expr[] = [];

    while (this.peek()?.type !== "CloseCurlyBracket") {
      then.push(this.parseOne());
    }

    this.consume("CloseCurlyBracket");

    return { type: "If", condition, then };
  }

  private parseReturn(): Expr {
    this.consume("Return");
    const value = this.parseOne();
    const optionalSemicolon = this.peek();

    if (optionalSemicolon?.type === "SemiColon") {
      this.consume("SemiColon");
    }

    return { type: "ReturnStatement", value };
  }

  private parseFunctionApp(): Expr {
    const name = this.consume("Literal");
    this.consume("OpenParentheses");

    const params: Expr[] = [];

    if (this.peek()?.type !== "CloseParentheses") {
      params.push(this.parseOne());

      if (this.peek()?.type === "Comma") {
        while (this.peek()?.type !== "CloseParentheses") {
          this.consume("Comma");
          params.push(this.parseOne());
        }
      }
    }

    this.consume("CloseParentheses");

    const optionalSemicolon = this.peek();

    if (optionalSemicolon?.type === "SemiColon") {
      this.consume("SemiColon");
    }

    if (name.value === "radinho") {
      return { type: "Console", values: params };
    }

    return { type: "FunctionApp", functionName: name.value, params };
  }

  private parseOne(): Expr {
    if (this.peek()?.type === "VariableDeclaration")
      return this.parseVariable();

    if (this.peek()?.type === "FunctionDeclaration")
      return this.parseFunction();

    if (this.peek()?.type === "IfDeclaration") return this.parseIf();

    if (
      (this.peek()?.type === "OpenParentheses" &&
        this.tokens[this.pos + 1]?.type === "OP") ||
      this.peek()?.type === "OP"
    ) {
      const hasParentheses = this.peek()?.type === "OpenParentheses";

      if (hasParentheses) this.consume("OpenParentheses");

      const op = this.consume("OP");
      const left = this.parseOne();
      const right = this.parseOne();

      if (hasParentheses) this.consume("CloseParentheses");

      return {
        type: "OP",
        op: op.value,
        left,
        right
      }
    }

    if (this.peek()?.type === "Return") return this.parseReturn();

    if (this.peek()?.type === "Literal") {
      const nextToken = this.tokens[this.pos + 1];

      if (nextToken?.type === "OpenParentheses") return this.parseFunctionApp();

      return this.consume("Literal");
    }

    if (this.peek()?.type === "String") return this.consume("String");

    if (this.peek()?.type === "Number") return this.consume("Number");

    if (this.peek()?.type === "Boolean") return this.consume("Boolean");

    throw new Error(`Unexpected token: ${JSON.stringify(this.peek())}`);
  }

  parse(): Expr[] {
    let result: Expr[] = [];

    while (this.peek()) {
      result.push(this.parseOne());
    }

    return result;
  }
}
