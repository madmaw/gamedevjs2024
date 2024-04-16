export function normalizeAngle(a: number): number {
  return a > Math.PI
    ? a - Math.PI * 2
    : a < -Math.PI
    ? a + Math.PI * 2
    : a;
}
