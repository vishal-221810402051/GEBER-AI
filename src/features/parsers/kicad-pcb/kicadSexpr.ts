export type KiCadSexpr = string | KiCadSexprList;

export type KiCadSexprList = Readonly<{
  items: KiCadSexpr[];
}>;

function tokenize(source: string): string[] {
  const tokens: string[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push(char);
      index += 1;
      continue;
    }

    if (char === "\"") {
      let value = "";
      index += 1;

      while (index < source.length) {
        const next = source[index];

        if (next === "\\") {
          value += source[index + 1] ?? "";
          index += 2;
          continue;
        }

        if (next === "\"") {
          index += 1;
          break;
        }

        value += next;
        index += 1;
      }

      tokens.push(value);
      continue;
    }

    let value = "";

    while (index < source.length && !/\s|\(|\)/.test(source[index])) {
      value += source[index];
      index += 1;
    }

    tokens.push(value);
  }

  return tokens;
}

function parseList(tokens: readonly string[], index: number): [KiCadSexprList, number] {
  const items: KiCadSexpr[] = [];
  let cursor = index;

  if (tokens[cursor] !== "(") {
    throw new Error("Expected opening parenthesis.");
  }

  cursor += 1;

  while (cursor < tokens.length) {
    const token = tokens[cursor];

    if (token === ")") {
      return [{ items }, cursor + 1];
    }

    if (token === "(") {
      const [child, nextCursor] = parseList(tokens, cursor);
      items.push(child);
      cursor = nextCursor;
      continue;
    }

    items.push(token);
    cursor += 1;
  }

  throw new Error("Unexpected end of file while parsing S-expression.");
}

export function parseKiCadSexpr(source: string): KiCadSexprList {
  const tokens = tokenize(source);

  if (tokens.length === 0) {
    throw new Error("File is empty.");
  }

  const [root, cursor] = parseList(tokens, 0);

  if (cursor !== tokens.length) {
    throw new Error("Unexpected tokens after top-level S-expression.");
  }

  return root;
}

export function atom(value: KiCadSexpr | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function list(value: KiCadSexpr | undefined): KiCadSexprList | undefined {
  return typeof value === "object" ? value : undefined;
}

export function head(value: KiCadSexprList): string | undefined {
  return atom(value.items[0]);
}

export function childLists(value: KiCadSexprList, name?: string): KiCadSexprList[] {
  return value.items
    .map((item) => list(item))
    .filter((item): item is KiCadSexprList => Boolean(item))
    .filter((item) => (name ? head(item) === name : true));
}

export function firstChild(value: KiCadSexprList, name: string): KiCadSexprList | undefined {
  return childLists(value, name)[0];
}

export function numberValue(value: KiCadSexpr | undefined): number | undefined {
  const parsed = Number(atom(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}
