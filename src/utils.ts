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

export const deepEqual = <T>(x: T, y: T) => {
  if (x === y) {
    return true;
  } else if (
    typeof x == "object" &&
    x != null &&
    typeof y == "object" &&
    y != null
  ) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  } else return false;
};
