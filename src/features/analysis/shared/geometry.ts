export function distanceMm(
  a: { x?: number; y?: number },
  b: { x?: number; y?: number }
): number | undefined {
  if (a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) {
    return undefined;
  }

  return Math.hypot(a.x - b.x, a.y - b.y);
}
