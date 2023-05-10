import { describe, it, expect } from "vitest";
import { Expr } from "../src/ast";
import { Token } from "../src/lexer";
import { Parser } from "../src/parser";

describe.concurrent("Parser suite", () => {
  it("Should parse a variable correctly", () => {
    const input: Token[] = [
      { type: "VariableDeclaration" },
      { type: "Literal", value: "test" },
      { type: "Equal" },
      { type: "String", value: "test" },
      { type: "SemiColon" },
    ];
    const expected: Expr[] = [
      {
        type: "Variable",
        name: "test",
        value: { type: "String", value: "test" },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse a function correctly", () => {
    const input: Token[] = [
      { type: "FunctionDeclaration" },
      { type: "Literal", value: "test" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "x" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "String" } },
      { type: "Comma" },
      { type: "Literal", value: "y" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: "CloseParentheses" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Boolean" } },
      { type: "OpenCurlyBracket" },
      { type: "Return" },
      { type: "Boolean", value: true },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
    ];
    const expected: Expr[] = [
      {
        type: "Function",
        name: "test",
        params: [
          { name: "x", ty: { type: "String" } },
          { name: "y", ty: { type: "Number" } },
        ],
        body: [
          { type: "ReturnStatement", value: { type: "Boolean", value: true } },
        ],
        returnTy: { type: "Boolean" },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse a variable and a function correctly", () => {
    const input: Token[] = [
      { type: "VariableDeclaration" },
      { type: "Literal", value: "test" },
      { type: "Equal" },
      { type: "String", value: "test" },
      { type: "SemiColon" },
      { type: "FunctionDeclaration" },
      { type: "Literal", value: "test" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "x" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "String" } },
      { type: "Comma" },
      { type: "Literal", value: "y" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: "CloseParentheses" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Boolean" } },
      { type: "OpenCurlyBracket" },
      { type: "Return" },
      { type: "Boolean", value: true },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
    ];
    const expected: Expr[] = [
      {
        type: "Variable",
        name: "test",
        value: { type: "String", value: "test" },
      },
      {
        type: "Function",
        name: "test",
        params: [
          { name: "x", ty: { type: "String" } },
          { name: "y", ty: { type: "Number" } },
        ],
        body: [
          { type: "ReturnStatement", value: { type: "Boolean", value: true } },
        ],
        returnTy: { type: "Boolean" },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse an function with if condition correctly", () => {
    const input: Token[] = [
      { type: "FunctionDeclaration" },
      { type: "Literal", value: "factorial" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "n" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: "CloseParentheses" },
      { type: "Colon" },
      { type: "TypeDeclaration", tyValue: { type: "Number" } },
      { type: "OpenCurlyBracket" },
      { type: "IfDeclaration" },
      { type: "OpenParentheses" },
      { type: "OP", value: "==" },
      { type: "Literal", value: "n" },
      { type: "Number", value: 1 },
      { type: "CloseParentheses" },
      { type: "OpenCurlyBracket" },
      { type: "Return" },
      { type: "Number", value: 1 },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
      { type: "Return" },
      { type: "OpenParentheses" },
      { type: "OP", value: "*" },
      { type: "Literal", value: "n" },
      { type: "Literal", value: "factorial" },
      { type: "OpenParentheses" },
      { type: "OP", value: "-" },
      { type: "Literal", value: "n" },
      { type: "Number", value: 1 },
      { type: "CloseParentheses" },
      { type: "CloseParentheses" },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
    ];
    const expected: Expr[] = [
      {
        type: "Function",
        name: "factorial",
        params: [{ name: "n", ty: { type: "Number" } }],
        body: [
          {
            type: "If",
            condition: {
              type: "OP",
              op: "==",
              left: { type: "Literal", value: "n" },
              right: { type: "Number", value: 1 },
            },
            then: [
              { type: "ReturnStatement", value: { type: "Number", value: 1 } },
            ],
          },
          {
            type: "ReturnStatement",
            value: {
              type: "OP",
              op: "*",
              left: { type: "Literal", value: "n" },
              right: {
                type: "FunctionApp",
                functionName: "factorial",
                params: [
                  {
                    type: "OP",
                    op: "-",
                    left: { type: "Literal", value: "n" },
                    right: { type: "Number", value: 1 },
                  },
                ],
              },
            },
          },
        ],
        returnTy: { type: "Number" },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse nested OPs correctly", () => {
    const input: Token[] = [
      { type: "OpenParentheses" },
      { type: "OP", value: "+" },
      { type: "Number", value: 1 },
      { type: "OpenParentheses" },
      { type: "OP", value: "+" },
      { type: "Number", value: 1 },
      { type: "OpenParentheses" },
      { type: "OP", value: "+" },
      { type: "Number", value: 1 },
      { type: "Number", value: 1 },
      { type: "CloseParentheses" },
      { type: "CloseParentheses" },
      { type: "CloseParentheses" },
    ];
    const expected: Expr[] = [
      {
        type: "OP",
        op: "+",
        left: { type: "Number", value: 1 },
        right: {
          type: "OP",
          op: "+",
          left: { type: "Number", value: 1 },
          right: {
            type: "OP",
            op: "+",
            left: { type: "Number", value: 1 },
            right: { type: "Number", value: 1 },
          },
        },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse functionApp with string, number and boolean params correctly", () => {
    const input: Token[] = [
      { type: "Literal", value: "test" },
      { type: "OpenParentheses" },
      { type: "String", value: "string" },
      { type: "Comma" },
      { type: "Number", value: 1 },
      { type: "Comma" },
      { type: "Boolean", value: true },
      { type: "CloseParentheses" },
      { type: "SemiColon" },
    ];
    const expected: Expr[] = [
      {
        type: "FunctionApp",
        functionName: "test",
        params: [
          { type: "String", value: "string" },
          { type: "Number", value: 1 },
          { type: "Boolean", value: true },
        ],
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });

  it("Should parse an high order function correctly", () => {
    const input: Token[] = [
      { type: "FunctionDeclaration" },
      { type: "Literal", value: "add" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "x" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "Comma" },
      { type: "Literal", value: "y" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "CloseParentheses" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "OpenCurlyBracket" },
      { type: "Return" },
      { type: "OpenParentheses" },
      { type: "OP", value: "+" },
      { type: "Literal", value: "x" },
      { type: "Literal", value: "y" },
      { type: "CloseParentheses" },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
      { type: "FunctionDeclaration" },
      { type: "Literal", value: "test" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "f" },
      { type: "Colon" },
      { type: "OpenParentheses" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "Comma" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "CloseParentheses" },
      { type: "Arrow" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "Comma" },
      { type: "Literal", value: "x" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "Comma" },
      { type: "Literal", value: "y" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "CloseParentheses" },
      { type: "Colon" },
      {
        type: "TypeDeclaration",
        tyValue: {
          type: "Number",
        },
      },
      { type: "OpenCurlyBracket" },
      { type: "Return" },
      { type: "Literal", value: "f" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "x" },
      { type: "Comma" },
      { type: "Literal", value: "y" },
      { type: "CloseParentheses" },
      { type: "SemiColon" },
      { type: "CloseCurlyBracket" },
      { type: "VariableDeclaration" },
      { type: "Literal", value: "result" },
      { type: "Equal" },
      { type: "Literal", value: "test" },
      { type: "OpenParentheses" },
      { type: "Literal", value: "add" },
      { type: "Comma" },
      { type: "Number", value: 1 },
      { type: "Comma" },
      { type: "Number", value: 2 },
      { type: "CloseParentheses" },
      { type: "SemiColon" },
    ];
    const expected: Expr[] = [
      {
        type: "Function",
        name: "add",
        params: [
          {
            name: "x",
            ty: {
              type: "Number",
            },
          },
          {
            name: "y",
            ty: {
              type: "Number",
            },
          },
        ],
        body: [
          {
            type: "ReturnStatement",
            value: {
              type: "OP",
              op: "+",
              left: {
                type: "Literal",
                value: "x",
              },
              right: {
                type: "Literal",
                value: "y",
              },
            },
          },
        ],
        returnTy: {
          type: "Number",
        },
      },
      {
        type: "Function",
        name: "test",
        params: [
          {
            name: "f",
            ty: {
              type: "Arrow",
              params: [
                {
                  type: "Number",
                },
                {
                  type: "Number",
                },
              ],
              returnTy: {
                type: "Number",
              },
            },
          },
          {
            name: "x",
            ty: {
              type: "Number",
            },
          },
          {
            name: "y",
            ty: {
              type: "Number",
            },
          },
        ],
        body: [
          {
            type: "ReturnStatement",
            value: {
              type: "FunctionApp",
              functionName: "f",
              params: [
                {
                  type: "Literal",
                  value: "x",
                },
                {
                  type: "Literal",
                  value: "y",
                },
              ],
            },
          },
        ],
        returnTy: {
          type: "Number",
        },
      },
      {
        type: "Variable",
        name: "result",
        value: {
          type: "FunctionApp",
          functionName: "test",
          params: [
            {
              type: "Literal",
              value: "add",
            },
            {
              type: "Number",
              value: 1,
            },
            {
              type: "Number",
              value: 2,
            },
          ],
        },
      },
    ];

    const parser = new Parser(input);

    expect(parser.parse()).toStrictEqual(expected);
  });
});
