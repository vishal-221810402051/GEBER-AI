export type GerberBlock = Readonly<{
  index: number;
  raw: string;
  statement: string;
  extended: boolean;
}>;

export function tokenizeGerber(source: string, maxBlocks: number): {
  blocks: readonly GerberBlock[];
  truncated: boolean;
} {
  const blocks: GerberBlock[] = [];
  let cursor = 0;

  while (cursor < source.length && blocks.length < maxBlocks) {
    while (cursor < source.length && /\s/.test(source[cursor])) {
      cursor += 1;
    }

    if (cursor >= source.length) break;

    if (source[cursor] === "%") {
      const end = source.indexOf("%", cursor + 1);
      if (end < 0) {
        const raw = source.slice(cursor);
        blocks.push({
          index: blocks.length + 1,
          raw,
          statement: raw.replace(/^%/, "").trim(),
          extended: true
        });
        break;
      }

      const raw = source.slice(cursor, end + 1);
      const statement = raw.slice(1, -1).trim();
      if (statement) {
        blocks.push({
          index: blocks.length + 1,
          raw,
          statement,
          extended: true
        });
      }
      cursor = end + 1;
      continue;
    }

    const end = source.indexOf("*", cursor);
    const raw = end < 0 ? source.slice(cursor) : source.slice(cursor, end + 1);
    const statement = raw.replace(/\*$/, "").trim();
    if (statement) {
      blocks.push({
        index: blocks.length + 1,
        raw,
        statement,
        extended: false
      });
    }

    cursor = end < 0 ? source.length : end + 1;
  }

  return {
    blocks,
    truncated: cursor < source.length
  };
}
