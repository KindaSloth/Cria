export const dropFromString = (string: string, number: number): string =>
  string.slice(number, string.length);

export const take = (str: string, number: number): string => {
  let output = "";

  for (let i = 0; i < number; i++) {
    output = output + str[output.length];
  }

  return output;
};

export const takeWhile = (
  str: string,
  condition: (x: string) => boolean
): string => {
  let output = "";
  let finished = false;

  while (!finished) {
    let current = str[output.length];

    if (!current) {
      finished = true;
      continue;
    }

    if (condition(current)) {
      output = output + current;

      continue;
    } else {
      finished = true;
    }
  }

  return output;
};

export const isLetter = (str: string): boolean =>
  str.length === 1 && Boolean(str.match(/[a-zA-Z]/i));

export const isDigit = (str: string): boolean =>
  str.length === 1 && /^\d+$/.test(str);

export const isAlphaNum = (str: string): boolean =>
  isLetter(str) || isDigit(str);

export const arrayEquals = <T>(a: T[], b: T[]): boolean =>
  a.length === b.length &&
  a.every((v) => {
    if (typeof v === "object" && !isNull(v)) {
      if (Array.isArray(v)) {
        return !isNullish(
          b
            .filter((item) => Array.isArray(item))
            .find((item) => arrayEquals(item as any, v))
        );
      }

      return !isNullish(
        b
          .filter((item) => typeof item === "object")
          .find((item) => objectEquals(item as any, v))
      );
    }

    return b.includes(v);
  });

export const objectIncludes = <T extends object>(value: T, arg: T): boolean => {
  const keysIncludes = Object.keys(arg).every((k) =>
    Object.keys(value).includes(k)
  );

  const valuesIncludes = Object.values(arg).every((v) => {
    if (typeof v === "object" && !isNull(v)) {
      if (Array.isArray(v)) {
        return !isNullish(
          Object.values(value).find((item) => arrayEquals(v, item))
        );
      }

      return !isNullish(
        Object.values(value).find((item) => objectEquals(v, item))
      );
    }

    return Object.values(value).includes(v);
  });

  return keysIncludes && valuesIncludes;
};

export const objectEquals = <T extends object>(value: T, arg: T) => {
  if (Object.keys(value).length !== Object.keys(arg).length) return false;

  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(arg, key)) {
      if (value[key] !== arg[key]) return false;
    }
  }

  return true;
};

export const isNull = <T>(value: T): boolean => {
  if (value === null) {
    return true;
  }

  return false;
};

export const isNullish = <T>(value: T): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  return false;
};
