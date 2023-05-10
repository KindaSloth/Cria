## Builtin types (Strings, Numbers and Booleans)

#### Equals JavaScript

## Math OPs

#### Equals Lisp but with optional parens

## Variables

```
cria minguinha = "EUMINGUINHA";
```

## Functions

```
pegaVisao add(x: number, y: number): number {
    tomali (+ x y);
}
```

## Functions App

```
pegaVisao add(x: number, y: number): number {
    tomali (+ x y);
}

cria result = add(1, 2);
```

## If condition

```
pegaVisao factorial(n: number): number {
    qualfoi? (== n 1) {
        tomali 1;
    }

    tomali (* n factorial(- n 1));
}
```

## I/O output

```
radinho("this string will be logged (aka compiled to console.log)");
```

## High Order Functions

```
pegaVisao add(x: number, y: number): number {
    tomali (+ x y);
}

pegaVisao test(f: (number, number) => number, x: number, y: number): number {
    tomali f(x, y);
}

cria result = test(add, 1, 2);
```
