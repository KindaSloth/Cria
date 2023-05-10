import { Expr } from "./ast";
import { deepEqual } from "./utils";

export type Type =
  | { type: "String" }
  | { type: "Number" }
  | { type: "Boolean" }
  | { type: "Void" }
  | { type: "Arrow"; params: Type[]; returnTy: Type };

type TyContext = { name: string; value: Type }[];

type BasicTypesExpr =
  | Extract<Expr, { type: "String" }>
  | Extract<Expr, { type: "Number" }>
  | Extract<Expr, { type: "Boolean" }>;

const checkStrictEqualParams = (params1: Type[], params2: Type[]): boolean => {
  if (params1.length === 0 && params2.length === 0) return true;

  const [current1, ...rest1] = params1;
  const [current2, ...rest2] = params2;

  if (current1 === current2) return checkStrictEqualParams(rest1, rest2);

  return false;
};

const equal = (ty1: Type, ty2: Type): boolean => {
  if (ty1.type === "Arrow" && ty2.type === "Arrow") {
    if (
      equal(ty1.returnTy, ty2.returnTy) &&
      checkStrictEqualParams(ty1.params, ty2.params)
    )
      return true;

    return false;
  }

  if (ty1.type === ty2.type) return true;

  return false;
};

const isBasicType = (expr: Expr): expr is BasicTypesExpr =>
  ["String", "Number", "Boolean"].includes(expr.type);

const inferBasicTypes = (basicType: BasicTypesExpr): Type => {
  if (basicType.type === "String") return { type: "String" };

  if (basicType.type === "Number") return { type: "Number" };

  // Boolean
  return { type: "Boolean" };
};

const inferOp = (
  op: Extract<Expr, { type: "OP" }>,
  context: TyContext
): Type => {
  // Boolean OPs
  if (["==", "!=", ">", ">=", "<", "<="].includes(op.op)) {
    const leftTy = infer(op.left, context);
    const rightTy = infer(op.right, context);

    if (equal(leftTy, rightTy)) return { type: "Boolean" };

    throw new Error(
      `Type Mismatch in ${JSON.stringify(
        op.op
      )}, This condition will always return 'false' since the types have no overlap.`
    );
  }

  if (op.op === "+") {
    const leftTy = infer(op.left, context);
    const rightTy = infer(op.right, context);

    if (equal(leftTy, { type: "Number" }) && equal(rightTy, { type: "Number" }))
      return { type: "Number" };

    // Concat
    if (equal(leftTy, { type: "String" }) && equal(rightTy, { type: "String" }))
      return { type: "String" };

    throw new Error(
      `Type Error, both sides of this operation: ${JSON.stringify(
        op.op
      )} should have type number`
    );
  }

  // Math OPs
  const leftTy = infer(op.left, context);
  const rightTy = infer(op.right, context);

  if (equal(leftTy, { type: "Number" }) && equal(rightTy, { type: "Number" }))
    return { type: "Number" };

  throw new Error(
    `Type Error, both sides of this operation: ${JSON.stringify(
      op.op
    )} should have type number`
  );
};

const inferFunctionApp = (
  functionApp: Extract<Expr, { type: "FunctionApp" }>,
  context: TyContext
): Type => {
  const f = context.find(
    (item) => item.name === functionApp.functionName
  )?.value;

  if (!f)
    throw new Error(
      `Type Error, Cannot found: ${JSON.stringify(functionApp.functionName)}`
    );

  if (f.type !== "Arrow")
    throw new Error(
      `Type Error, ${JSON.stringify(
        functionApp.functionName
      )} is not a function.`
    );

  // For now I'll just support BasicTypes, OP, FunctionApps and Variables as params.
  const paramsTypes = functionApp.params.map((param) => {
    if (isBasicType(param)) return inferBasicTypes(param);

    if (param.type === "OP") return inferOp(param, context);

    if (param.type === "FunctionApp") return inferFunctionApp(param, context);

    if (param.type === "Literal") {
      const ty = context.find((item) => item.name === param.value)?.value;

      if (!ty)
        throw new Error(
          `Type Error, Cannot found: ${JSON.stringify(param.value)}`
        );

      return ty;
    }

    if (param.type === "Function") {
      const exprAlreadyExist = context.find((item) => item.name === param.name);

      if (exprAlreadyExist) {
        throw new Error(`Function: ${param.name} already exist`);
      }

      const paramsExprAlreadyExist = param.params
        .map((param) => context.find((item) => item.name === param.name))
        .filter(
          (
            item
          ): item is {
            name: string;
            value: Type;
          } => item !== undefined
        );

      if (paramsExprAlreadyExist.length > 0) {
        throw new Error(`Invalid param name in function: ${param.name}`);
      }

      const paramsContext: TyContext = param.params.map(
        (param): { name: string; value: Type } => ({
          name: param.name,
          value: param.ty,
        })
      );

      // Dirty (and lazy) hack to allow recursion
      const internalContext: TyContext = [
        {
          name: param.name,
          value: {
            type: "Arrow",
            params: param.params.map((param) => param.ty),
            returnTy: param.returnTy,
          },
        },
        ...paramsContext,
        ...context,
      ];

      return inferFunction(param, internalContext);
    }

    throw new Error(
      `Unexpected Expression: ${JSON.stringify(
        param.type
      )}, this can't be used as param type`
    );
  });

  if (deepEqual(paramsTypes, f.params)) return f.returnTy;

  throw new Error(`Type Error, wrong param types`);
};

const inferLiteral = (
  literal: Extract<Expr, { type: "Literal" }>,
  context: TyContext
): Type => {
  const ty = context.find((item) => item.name === literal.value)?.value;

  if (!ty)
    throw new Error(
      `Type Error, Cannot found: ${JSON.stringify(literal.value)}`
    );

  return ty;
};

const inferVariable = (
  variable: Extract<Expr, { type: "Variable" }>,
  context: TyContext
): Type => {
  const ty = infer(variable.value, context);

  return ty;
};

// I'll make if conditions always return something for now (since I'm not exporting the Void type for users)
const inferIf = (
  ifExpr: Extract<Expr, { type: "If" }>,
  context: TyContext
): Type => {
  const conditionTy = infer(ifExpr.condition, context);

  if (conditionTy.type !== "Boolean")
    throw new Error(`Type Error, If condition should be a boolean`);

  const returnStatement = ifExpr.then.find(
    (expr) => expr.type === "ReturnStatement"
  );

  if (!returnStatement)
    throw new Error(
      `Type Error, If conditions should have an return statement`
    );

  const returnTy = infer(returnStatement, context);

  const nestedIfStatements = ifExpr.then.filter((expr) => expr.type === "If");

  if (nestedIfStatements) {
    const nestedIfStatementsTy = nestedIfStatements.map((nestedIf) =>
      infer(nestedIf, context)
    );

    if (
      !nestedIfStatementsTy.every((nestedIfTy) => equal(nestedIfTy, returnTy))
    ) {
      throw new Error(
        `Type Error, we don't have union types :(, so you can't return two different types`
      );
    }
  }

  const _ = check(ifExpr.then, context);

  return returnTy;
};

const inferFunction = (
  functionExpr: Extract<Expr, { type: "Function" }>,
  context: TyContext
): Type => {
  const paramsTy = functionExpr.params.map((param) => param.ty);

  const returnStatement = functionExpr.body.find(
    (expr) => expr.type === "ReturnStatement"
  );

  if (!returnStatement)
    throw new Error(`Type Error, Functions should have an return statement`);

  const returnTy = infer(returnStatement, context);

  const ifStatements = functionExpr.body.filter((expr) => expr.type === "If");

  if (ifStatements) {
    const ifStatementsTy = ifStatements.map((ifStatement) =>
      infer(ifStatement, context)
    );

    if (!ifStatementsTy.every((ifTy) => equal(ifTy, returnTy))) {
      throw new Error(
        `Type Error, we don't have union types :(, so you can't return two different types`
      );
    }
  }

  if (!equal(functionExpr.returnTy, returnTy)) {
    throw new Error(
      `Type Error, expected: ${JSON.stringify(
        functionExpr.returnTy
      )}, received: ${JSON.stringify(returnTy)}`
    );
  }

  const _ = check(functionExpr.body, context);

  return { type: "Arrow", params: paramsTy, returnTy };
};

const inferConsole = (
  console: Extract<Expr, { type: "Console" }>,
  context: TyContext
): Type => {
  if (console.values.length <= 0) {
    throw new Error("Radinho should have at least one value");
  }

  const _ = check(console.values, context);

  return { type: "Void" };
};

export const infer = (expr: Expr, context: TyContext): Type => {
  if (expr.type === "Literal") return inferLiteral(expr, context);

  if (isBasicType(expr)) return inferBasicTypes(expr);

  if (expr.type === "Variable") return inferVariable(expr, context);

  if (expr.type === "OP") return inferOp(expr, context);

  if (expr.type === "If") return inferIf(expr, context);

  if (expr.type === "Function") return inferFunction(expr, context);

  if (expr.type === "FunctionApp") return inferFunctionApp(expr, context);

  if (expr.type === "Console") return inferConsole(expr, context);

  // Return Statement
  return infer(expr.value, context);
};

export const check = (exprs: Expr[], context: TyContext): [true, TyContext] => {
  try {
    const [current, ...rest] = exprs;
    const isLastExpr = !rest?.[0];

    if (!current) return [true, context];

    if (current.type === "Variable") {
      const exprAlreadyExist = context.find(
        (item) => item.name === current.name
      );

      if (exprAlreadyExist) {
        throw new Error(`Variable: ${current.name} already exist`);
      }

      const ty = infer(current, context);

      const newContext = [{ name: current.name, value: ty }, ...context];

      if (isLastExpr) return [true, newContext];

      return check(rest, newContext);
    }

    if (current.type === "Function") {
      const exprAlreadyExist = context.find(
        (item) => item.name === current.name
      );

      if (exprAlreadyExist) {
        throw new Error(`Function: ${current.name} already exist`);
      }

      const paramsExprAlreadyExist = current.params
        .map((param) => context.find((item) => item.name === param.name))
        .filter(
          (
            item
          ): item is {
            name: string;
            value: Type;
          } => item !== undefined
        );

      if (paramsExprAlreadyExist.length > 0) {
        throw new Error(`Invalid param name in function: ${current.name}`);
      }

      const paramsContext: TyContext = current.params.map(
        (param): { name: string; value: Type } => ({
          name: param.name,
          value: param.ty,
        })
      );

      // Dirty (and lazy) hack to allow recursion
      const internalContext: TyContext = [
        {
          name: current.name,
          value: {
            type: "Arrow",
            params: current.params.map((param) => param.ty),
            returnTy: current.returnTy,
          },
        },
        ...paramsContext,
        ...context,
      ];

      const ty = infer(current, internalContext);

      const newContext = [{ name: current.name, value: ty }, ...context];

      if (isLastExpr) return [true, newContext];

      return check(rest, newContext);
    }

    const _ = infer(current, context);

    if (isLastExpr) return [true, context];

    return check(rest, context);
  } catch (err) {
    if (err instanceof Error) throw new Error(err.message);

    throw new Error(`Unexpected type error, ${JSON.stringify(err)}`);
  }
};
