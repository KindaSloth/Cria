import { check } from "./checker";
import { lexer } from "./lexer";
import { Parser } from "./parser";
import { printer } from "./printer";
import * as repl from "repl";

repl.start({
  prompt: "Cria => ",
  eval: (input, context, filename, callback) => {
    const sanitizedInput = input.slice(0, input.length - 2);

    const tokens = lexer(sanitizedInput);

    const parser = new Parser(tokens);

    const exprs = parser.parse();

    const _checker = check(exprs, []);

    const result = printer(exprs);

    callback(null, eval(result));
  },
});
