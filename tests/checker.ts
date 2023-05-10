import { describe, it, expect } from "vitest";
import { Expr } from "../src/ast";
import { check, infer } from "../src/checker";

describe.concurrent("Checker suite", () => {
  it.fails("Should fail because literal is not in the context", () => {
    const literal: Expr = { type: "Literal", value: "whatever" };
    const [checked] = check([literal], []);

    expect(checked).toBe(false);
  });

  it("Should check literal", () => {
    const literal: Expr = { type: "Literal", value: "whatever" };
    const [checked] = check(
      [literal],
      [{ name: "whatever", value: { type: "Boolean" } }]
    );

    expect(checked).toBe(true);
  });

  it("Should check basic types", () => {
    const string: Expr = { type: "String", value: "" };
    const number: Expr = { type: "Number", value: 1 };
    const boolean: Expr = { type: "Boolean", value: true };
    const exprs = [string, number, boolean];
    const [checked] = check(exprs, []);

    expect(checked).toBe(true);
  });

  it("Should check variable and add into the context", () => {
    const variable: Expr = {
      type: "Variable",
      name: "var",
      value: { type: "Boolean", value: true },
    };
    const [checked, context] = check([variable], []);

    expect(checked).toBe(true);
    expect(context).toStrictEqual([
      { name: "var", value: { type: "Boolean" } },
    ]);
  });

  it("Should check boolean OPs", () => {
    const equals: Expr = {
      type: "OP",
      op: "==",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const diff: Expr = {
      type: "OP",
      op: "!=",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const greater: Expr = {
      type: "OP",
      op: ">",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const greaterEqual: Expr = {
      type: "OP",
      op: ">=",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const smaller: Expr = {
      type: "OP",
      op: "<",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const smallerEqual: Expr = {
      type: "OP",
      op: "<=",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const exprs = [equals, diff, greater, greaterEqual, smaller, smallerEqual];
    const [checked] = check(exprs, []);

    expect(checked).toBe(true);
  });

  it.fails("Should not check wrong boolean OPs", () => {
    const equals: Expr = {
      type: "OP",
      op: "==",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const diff: Expr = {
      type: "OP",
      op: "!=",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const greater: Expr = {
      type: "OP",
      op: ">",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const greaterEqual: Expr = {
      type: "OP",
      op: ">=",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const smaller: Expr = {
      type: "OP",
      op: "<",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const smallerEqual: Expr = {
      type: "OP",
      op: "<=",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const exprs = [equals, diff, greater, greaterEqual, smaller, smallerEqual];
    const [checked] = check(exprs, []);

    expect(checked).toBe(false);
  });

  it("Should check math OPs", () => {
    const add: Expr = {
      type: "OP",
      op: "+",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const subtract: Expr = {
      type: "OP",
      op: "-",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const mult: Expr = {
      type: "OP",
      op: "*",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const div: Expr = {
      type: "OP",
      op: "/",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const module: Expr = {
      type: "OP",
      op: "%",
      left: { type: "Number", value: 1 },
      right: { type: "Number", value: 1 },
    };
    const exprs = [add, subtract, mult, div, module];
    const [checked] = check(exprs, []);

    expect(checked).toBe(true);
  });

  it.fails("Should not check wrong math OPs", () => {
    const add: Expr = {
      type: "OP",
      op: "+",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const subtract: Expr = {
      type: "OP",
      op: "-",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const mult: Expr = {
      type: "OP",
      op: "*",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const div: Expr = {
      type: "OP",
      op: "/",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const module: Expr = {
      type: "OP",
      op: "%",
      left: { type: "Number", value: 1 },
      right: { type: "Boolean", value: true },
    };
    const exprs = [add, subtract, mult, div, module];
    const [checked] = check(exprs, []);

    expect(checked).toBe(false);
  });

  it("Should check If conditions", () => {
    const ifCondition: Expr = {
      type: "If",
      condition: { type: "Boolean", value: true },
      then: [
        { type: "ReturnStatement", value: { type: "Boolean", value: true } },
      ],
    };
    const [checked] = check([ifCondition], []);

    expect(checked).toBe(true);
  });

  it.fails("Should not check wrong If conditions", () => {
    const ifCondition: Expr = {
      type: "If",
      condition: { type: "Number", value: 1 },
      then: [
        { type: "ReturnStatement", value: { type: "Boolean", value: true } },
      ],
    };
    const [checked] = check([ifCondition], []);

    expect(checked).toBe(false);
  });

  it.fails("Should not check If conditions without Return statement", () => {
    const ifCondition: Expr = {
      type: "If",
      condition: { type: "Boolean", value: true },
      then: [],
    };
    const [checked] = check([ifCondition], []);

    expect(checked).toBe(false);
  });

  it("Should check functions and add into the context", () => {
    const f: Expr = {
      type: "Function",
      name: "f",
      params: [],
      returnTy: { type: "Boolean" },
      body: [
        { type: "ReturnStatement", value: { type: "Boolean", value: true } },
      ],
    };
    const g: Expr = {
      type: "Function",
      name: "g",
      params: [{ name: "x", ty: { type: "Boolean" } }],
      returnTy: { type: "Boolean" },
      body: [
        { type: "ReturnStatement", value: { type: "Literal", value: "x" } },
      ],
    };
    const [checked, context] = check([f, g], []);

    expect(checked).toBe(true);
    expect(context).toStrictEqual([
      {
        name: "g",
        value: {
          type: "Arrow",
          params: [{ type: "Boolean" }],
          returnTy: { type: "Boolean" },
        },
      },
      {
        name: "f",
        value: { type: "Arrow", params: [], returnTy: { type: "Boolean" } },
      },
    ]);
  });

  it.fails("Should not check function without return statement", () => {
    const f: Expr = {
      type: "Function",
      name: "f",
      params: [],
      returnTy: { type: "Boolean" },
      body: [],
    };
    const [checked] = check([f], []);

    expect(checked).toBe(false);
  });

  it("Should check function application", () => {
    const booleanId: Expr = {
      type: "Function",
      name: "booleanId",
      params: [{ name: "x", ty: { type: "Boolean" } }],
      returnTy: { type: "Boolean" },
      body: [
        { type: "ReturnStatement", value: { type: "Literal", value: "x" } },
      ],
    };
    const functionCall: Expr = {
      type: "FunctionApp",
      functionName: "booleanId",
      params: [{ type: "Boolean", value: true }],
    };
    const [checked] = check([booleanId, functionCall], []);

    expect(checked).toBe(true);
  });

  it.fails(
    "Should not check function application of a function that not exist",
    () => {
      const functionCall: Expr = {
        type: "FunctionApp",
        functionName: "booleanId",
        params: [{ type: "Boolean", value: true }],
      };
      const [checked] = check([functionCall], []);

      expect(checked).toBe(false);
    }
  );

  it("Should check Console", () => {
    const console: Expr = {
      type: "Console",
      values: [{ type: "Boolean", value: true }],
    };
    const [checked] = check([console], []);

    expect(checked).toBe(true);
  });

  it.fails("Should not check Console with any value", () => {
    const console: Expr = {
      type: "Console",
      values: [],
    };
    const [checked] = check([console], []);

    expect(checked).toBe(false);
  });

  it("Should infer Return Statement type", () => {
    const returnStatement: Expr = {
      type: "ReturnStatement",
      value: { type: "Boolean", value: true },
    };
    const ty = infer(returnStatement, []);

    expect(ty).toStrictEqual({ type: "Boolean" });
  });

  it("Should infer High Order Function type and add into the context", () => {
    const exprs: Expr[] = [
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
    const [checked, context] = check(exprs, []);

    expect(checked).toBe(true);
    expect(context).toStrictEqual([
      {
        name: "result",
        value: { type: "Number" },
      },
      {
        name: "test",
        value: {
          type: "Arrow",
          params: [
            {
              type: "Arrow",
              params: [{ type: "Number" }, { type: "Number" }],
              returnTy: { type: "Number" },
            },
            { type: "Number" },
            { type: "Number" },
          ],
          returnTy: { type: "Number" },
        },
      },
      {
        name: "add",
        value: {
          type: "Arrow",
          params: [{ type: "Number" }, { type: "Number" }],
          returnTy: { type: "Number" },
        },
      },
    ]);
  });
});
