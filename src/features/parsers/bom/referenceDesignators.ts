export function parseReferenceDesignators(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(/[,\s;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      const match = /^([A-Za-z]+)(\d+)-\1?(\d+)$/.exec(part);

      if (!match) {
        return [part];
      }

      const [, prefix, startText, endText] = match;
      const start = Number(startText);
      const end = Number(endText);

      if (!Number.isInteger(start) || !Number.isInteger(end) || end < start || end - start > 200) {
        return [part];
      }

      return Array.from({ length: end - start + 1 }, (_, index) => `${prefix}${start + index}`);
    });
}
