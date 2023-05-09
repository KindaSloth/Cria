import { Expr } from "./ast";

export type Doc =
  | { type: "Nil" }
  | { type: ":<>"; left: Doc; right: Doc }
  | { type: "Nest"; index: number; doc: Doc }
  | { type: "Text"; value: string }
  | { type: "Line" };

const append = (left: Doc, right: Doc): Doc => {
  return { type: ":<>", left, right };
};

export type DocNormalForm =
  | { type: "Nil" }
  | { type: "Text"; value: string; doc: DocNormalForm }
  | { type: "Line"; index: number; doc: DocNormalForm };

const copy = (i: number, x: string): string => Array(i).fill(x).join("");

const nil = (): Doc => {
  return { type: "Nil" };
};

const nest = (index: number, doc: Doc): Doc => {
  return { type: "Nest", index, doc };
};

const text = (value: string): Doc => {
  return { type: "Text", value };
};

const line = (): Doc => {
  return { type: "Line" };
};

const space = (): Doc => {
  return { type: "Text", value: " " };
};

const folddoc = (f: (x: Doc, y: Doc) => Doc, docs: Doc[]): Doc => {
  if (docs.length === 1 && docs[0]) return docs[0];

  const [x, ...xs] = docs;

  if (x) {
    return f(x, folddoc(f, xs));
  }

  return nil();
};

const layout = (doc: DocNormalForm): string => {
  if (doc.type === "Text") {
    return doc.value + layout(doc.doc);
  }

  if (doc.type === "Line") {
    return "\n" + copy(doc.index, " ") + layout(doc.doc);
  }

  return "";
};

const be = (index: number, docs: [number, Doc][]): DocNormalForm => {
  const [x, ...xs] = docs;

  if (x) {
    const [i, doc] = x;

    if (doc.type === "Nil") return be(index, xs);

    if (doc.type === ":<>") {
      const first: [number, Doc] = [i, doc.left];
      const second: [number, Doc] = [i, doc.right];

      return be(index, [first, second, ...xs]);
    }

    if (doc.type === "Nest") {
      const first: [number, Doc] = [i + doc.index, doc.doc];

      return be(index, [first, ...xs]);
    }

    if (doc.type === "Text") {
      return {
        type: "Text",
        value: doc.value,
        doc: be(index + doc.value.length, xs),
      };
    }

    return { type: "Line", index: i, doc: be(i, xs) };
  }

  return { type: "Nil" };
};

const best = (index: number, doc: Doc): DocNormalForm => be(index, [[0, doc]]);

const pretty = (doc: Doc): string => layout(best(0, doc));

const parametersToDoc = (params: string[]): Doc => {
  if (params.length === 1 && params[0]) return text(params[0]);

  const [param, ...xs] = params;

  if (param) {
    return append(
      text(param),
      append(text(","), append(space(), parametersToDoc(xs)))
    );
  }

  return nil();
};

const convertExprsInSequence = (exprs: Expr[]): Doc => {
  if (exprs.length === 1 && exprs[0]) return printExpr(exprs[0]);

  const [expr, ...xs] = exprs;

  if (expr) {
    return append(
      printExpr(expr),
      append(text(","), append(space(), convertExprsInSequence(xs)))
    );
  }

  return nil();
};

const printExprs = (exprs: Expr[]): Doc => {
  if (exprs.length === 1 && exprs[0]) return printExpr(exprs[0]);

  const [expr, ...xs] = exprs;

  if (expr) {
    return append(
      printExpr(expr),
      append(line(), append(line(), printExprs(xs)))
    );
  }

  return nil();
};

const printExpr = (expr: Expr): Doc => {
  if (expr.type === "String") {
    return append(text('"'), append(text(expr.value), text('"')));
  }

  if (expr.type === "Number") {
    return text(expr.value.toString());
  }

  if (expr.type === "Boolean") {
    return text(expr.value.toString());
  }

  if (expr.type === "Literal") {
    return text(expr.value);
  }

  if (expr.type === "Variable") {
    return append(
      text("const"),
      append(
        space(),
        append(
          text(expr.name),
          append(
            space(),
            append(
              text("="),
              append(space(), append(printExpr(expr.value), text(";")))
            )
          )
        )
      )
    );
  }

  if (expr.type === "Function") {
    return append(
      text("function"),
      append(
        space(),
        append(
          text(expr.name),
          append(
            text("("),
            append(
              parametersToDoc(expr.params.map((param) => param.name)),
              append(
                text(")"),
                append(
                  space(),
                  append(
                    text("{"),
                    append(
                      nest(2, append(line(), printExprs(expr.body))),
                      append(line(), text("}"))
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  if (expr.type === "FunctionApp") {
    return append(
      text(expr.functionName),
      append(text("("), append(convertExprsInSequence(expr.params), text(")")))
    );
  }

  if (expr.type === "ReturnStatement") {
    return append(
      text("return"),
      append(space(), append(printExpr(expr.value), text(";")))
    );
  }

  if (expr.type === "OP") {
    return append(
      printExpr(expr.left),
      append(
        space(),
        append(text(expr.op), append(space(), printExpr(expr.right)))
      )
    );
  }

  if (expr.type === "If") {
    return append(
      text("if"),
      append(
        space(),
        append(
          text("("),
          append(
            printExpr(expr.condition),
            append(
              text(")"),
              append(
                space(),
                append(
                  text("{"),
                  append(
                    nest(2, append(line(), printExprs(expr.then))),
                    append(line(), text("}"))
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  if (expr.type === "Console") {
    return append(
      text("console.log"),
      append(
        text("("),
        append(
          convertExprsInSequence(expr.values),
          append(text(")"), text(";"))
        )
      )
    );
  }

  return nil();
};

export const printer = (exprs: Expr[]): string => pretty(printExprs(exprs));
