import { Type } from "./checker";
import { OP } from "./lexer";

export type Expr =
  | { type: "Literal"; value: string }
  | { type: "String"; value: string }
  | { type: "Number"; value: number }
  | { type: "Boolean"; value: boolean }
  | { type: "Variable"; name: string; value: Expr }
  | { type: "Function"; name: string; params: { name: string, ty: Type }[]; body: Expr[]; returnTy: Type }
  | { type: "FunctionApp"; functionName: string; params: Expr[] }
  | { type: "ReturnStatement"; value: Expr }
  | { type: "OP"; op: OP, left: Expr, right: Expr }
  | { type: "If"; condition: Expr; then: Expr[] }
  | { type: "Console"; values: Expr[] };