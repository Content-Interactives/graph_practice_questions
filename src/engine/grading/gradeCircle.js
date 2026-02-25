const CENTER_TOLERANCE = 0.5;
const RADIUS_TOLERANCE = 0.4;

/**
 * Grade a student's circle against the expected circle.
 *
 * @param {{ center: {x,y}, edgePoint: {x,y}, radius: number }} studentCircle
 * @param {{ h: number, k: number, r: number }} expected
 * @returns {{ isCorrect: boolean, mistakes: Array<{ code: string, meta?: object }> }}
 */
export function gradeSingleCircle(studentCircle, expected) {
  const mistakes = [];

  const centerDx = Math.abs(studentCircle.center.x - expected.h);
  const centerDy = Math.abs(studentCircle.center.y - expected.k);
  const centerCorrect = centerDx <= CENTER_TOLERANCE && centerDy <= CENTER_TOLERANCE;

  const radiusCorrect = Math.abs(studentCircle.radius - expected.r) <= RADIUS_TOLERANCE;

  if (centerCorrect && radiusCorrect) {
    return { isCorrect: true, mistakes: [] };
  }

  if (!centerCorrect) {
    mistakes.push({
      code: 'WRONG_CENTER',
      meta: {
        expectedCenter: { x: expected.h, y: expected.k },
        studentCenter: studentCircle.center,
      },
    });
  }

  if (!radiusCorrect) {
    mistakes.push({
      code: 'WRONG_RADIUS',
      meta: {
        expectedRadius: expected.r,
        studentRadius: studentCircle.radius,
      },
    });
  }

  return { isCorrect: false, mistakes };
}

/**
 * Pick the student circle closest to the expected one (by center distance + radius difference).
 */
export function pickClosestCircle(studentCircles, expected) {
  let best = null;
  let bestScore = Infinity;

  for (const sc of studentCircles) {
    const cDist = Math.hypot(sc.center.x - expected.h, sc.center.y - expected.k);
    const rDiff = Math.abs(sc.radius - expected.r);
    const score = cDist + rDiff;
    if (score < bestScore) {
      bestScore = score;
      best = sc;
    }
  }
  return best;
}
