/**
 * Canonical line form: Ax + By + C = 0, normalized so sqrt(A²+B²) = 1,
 * with a consistent sign convention (A >= 0, or if A == 0 then B > 0).
 */
export function toCanonical(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Ax + By + C = 0  where A = dy, B = -dx (normal to direction vector)
  let A = dy;
  let B = -dx;
  let C = -(A * p1.x + B * p1.y);

  const norm = Math.hypot(A, B);
  if (norm < 1e-12) return null; // degenerate (identical points)

  A /= norm;
  B /= norm;
  C /= norm;

  // Enforce sign convention: A > 0, or if A ≈ 0 then B > 0
  if (A < -1e-12 || (Math.abs(A) < 1e-12 && B < 0)) {
    A = -A;
    B = -B;
    C = -C;
  }

  return { A, B, C };
}

/** Angle of the line direction in [0, π) */
export function lineAngle(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI;
  if (angle >= Math.PI) angle -= Math.PI;
  return angle;
}

/** Perpendicular distance from a point to a canonical line */
export function pointToLineDistance(canonical, px, py) {
  return Math.abs(canonical.A * px + canonical.B * py + canonical.C);
}

/** Slope from two points (returns Infinity for vertical) */
export function slopeFromPoints(p1, p2) {
  const dx = p2.x - p1.x;
  if (Math.abs(dx) < 1e-12) return Infinity;
  return (p2.y - p1.y) / dx;
}

/** Y-intercept from two points (returns null for vertical lines) */
export function yInterceptFromPoints(p1, p2) {
  const dx = p2.x - p1.x;
  if (Math.abs(dx) < 1e-12) return null;
  const m = (p2.y - p1.y) / dx;
  return p1.y - m * p1.x;
}
