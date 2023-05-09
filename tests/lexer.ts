import { describe, it, expect } from "vitest";
import {
  takeLiteral,
  takeString,
  takeNumber,
  lexer,
  Token,
} from "../src/lexer";

describe.concurrent("Utils suite", () => {
  it("Should take literal from string", () => {
    const [literal, rest] = takeLiteral("literal-123_*");

    expect(literal).toBe("literal-123_");
    expect(rest).toBe("*");
  });

  it("Should take string from string", () => {
    const [string, rest] = takeString('"string"*');

    expect(string).toBe("string");
    expect(rest).toBe("*");
  });

  it("Should take number from string", () => {
    const [number, rest] = takeNumber("1234*");

    expect(number).toBe(1234);
    expect(rest).toBe("*");
  });

  it("Should tokenize an variable code correctly", () => {
    const tokens = lexer('cria test = "test";');
    const expectedResult: Token[] = [
      { type: "VariableDeclaration" },
      { type: "Literal", value: "test" },
      { type: "Equal" },
      { type: "String", value: "test" },
      { type: "SemiColon" },
    ];

    expect(tokens).toStrictEqual(expectedResult);
  });

  it("Should tokenize an function code correctly", () => {
    const tokens = lexer('pegaVisao test(x: string, y: number): boolean { tomali true; }');
    const expectedResult: Token[] = [
      { type: 'FunctionDeclaration' },
      { type: 'Literal', value: 'test' },
      { type: 'OpenParentheses' },
      { type: 'Literal', value: 'x' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "String" } },
      { type: 'Comma' },
      { type: 'Literal', value: 'y' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'CloseParentheses' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Boolean" } },
      { type: 'OpenCurlyBracket' },
      { type: 'Return' },
      { type: 'Boolean', value: true },
      { type: "SemiColon" },
      { type: 'CloseCurlyBracket' }
    ];

    expect(tokens).toStrictEqual(expectedResult);
  });

  it("Should tokenize an function application code correctly", () => {
    const tokens = lexer("pegaVisao add(x: number, y: number): number { tomali x; } cria result = add(1, 2);");
    const expectedResult: Token[] = [
      { type: 'FunctionDeclaration' },
      { type: 'Literal', value: 'add' },
      { type: 'OpenParentheses' },
      { type: 'Literal', value: 'x' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'Comma' },
      { type: 'Literal', value: 'y' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'CloseParentheses' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'OpenCurlyBracket' },
      { type: 'Return' },
      { type: 'Literal', value: 'x' },
      { type: 'SemiColon' },
      { type: 'CloseCurlyBracket' },
      { type: "VariableDeclaration" },
      { type: "Literal", value: "result" },
      { type: "Equal" },
      { type: 'Literal', value: 'add' },
      { type: 'OpenParentheses' },
      { type: 'Number', value: 1 },
      { type: 'Comma' },
      { type: 'Number', value: 2 },
      { type: 'CloseParentheses' },
      { type: "SemiColon" },
    ];

    expect(tokens).toStrictEqual(expectedResult);
  });

  it('Should tokenize an function with if condition correctly', () => {
    const tokens = lexer("pegaVisao factorial(n: number): number { qualfoi? (== n 1) { tomali 1; } tomali (* n factorial(- n 1)); }");
    const expectedResult: Token[] = [
      { type: 'FunctionDeclaration' },
      { type: 'Literal', value: 'factorial' },
      { type: 'OpenParentheses' },
      { type: 'Literal', value: 'n' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'CloseParentheses' },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: 'OpenCurlyBracket' },
      { type: 'IfDeclaration' },
      { type: 'OpenParentheses' },
      { type: 'OP', value: '==' },
      { type: 'Literal', value: 'n' },
      { type: 'Number', value: 1 },
      { type: 'CloseParentheses' },
      { type: 'OpenCurlyBracket' },
      { type: 'Return' },
      { type: 'Number', value: 1 },
      { type: 'SemiColon' },
      { type: 'CloseCurlyBracket' },
      { type: 'Return' },
      { type: 'OpenParentheses' },
      { type: 'OP', value: '*' },
      { type: 'Literal', value: 'n' },
      { type: 'Literal', value: 'factorial' },
      { type: 'OpenParentheses' },
      { type: 'OP', value: '-' },
      { type: 'Literal', value: 'n' },
      { type: 'Number', value: 1 },
      { type: 'CloseParentheses' },
      { type: 'CloseParentheses' },
      { type: 'SemiColon' },
      { type: 'CloseCurlyBracket' }
    ];

    expect(tokens).toStrictEqual(expectedResult);
  });
});
