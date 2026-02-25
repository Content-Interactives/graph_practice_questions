import { toCanonical, lineAngle, pointToLineDistance, slopeFromPoints, yInterceptFromPoints } from './geometry.js';
import { ANGLE_TOLERANCE, DISTANCE_TOLERANCE } from './tolerances.js';

/**
 * Grade a single student line against the expected line.
 *
 * @param {{ p1: {x,y}, p2: {x,y} }} studentLine
 * @param {{ p1: {x,y}, p2: {x,y} }} expectedLine  - defined by two points
 * @returns {{ isCorrect: boolean, mistakes: Array<{ code: string, meta?: object }> }}
 */
export function gradeSingleLine(studentLine, expectedLine) {
  const mistakes = [];

  const expectedCanonical = toCanonical(expectedLine.p1, expectedLine.p2);
  const studentCanonical = toCanonical(studentLine.p1, studentLine.p2);
  if (!expectedCanonical || !studentCanonical) {
    mistakes.push({ code: 'DEGENERATE_LINE' });
    return { isCorrect: false, mistakes };
  }

  const expectedAngle = lineAngle(expectedLine.p1, expectedLine.p2);
  const studentAngle = lineAngle(studentLine.p1, studentLine.p2);
  let angleDiff = Math.abs(expectedAngle - studentAngle);
  if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;

  const slopeCorrect = angleDiff <= ANGLE_TOLERANCE;

  // Sample test x-values and measure vertical distance to expected line
  const testXs = [-4, 0, 4];
  const distances = testXs.map((x) => pointToLineDistance(expectedCanonical, x, evalLineAtX(studentLine, x)));
  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const distanceCorrect = avgDistance <= DISTANCE_TOLERANCE;

  if (slopeCorrect && distanceCorrect) {
    return { isCorrect: true, mistakes: [] };
  }

  if (!slopeCorrect) {
    const expectedSlope = slopeFromPoints(expectedLine.p1, expectedLine.p2);
    const studentSlope = slopeFromPoints(studentLine.p1, studentLine.p2);
    mistakes.push({
      code: 'WRONG_SLOPE',
      meta: { expectedSlope, studentSlope },
    });
  }

  if (!distanceCorrect && slopeCorrect) {
    const expectedIntercept = yInterceptFromPoints(expectedLine.p1, expectedLine.p2);
    const studentIntercept = yInterceptFromPoints(studentLine.p1, studentLine.p2);
    mistakes.push({
      code: 'WRONG_INTERCEPT',
      meta: { expectedIntercept, studentIntercept },
    });
  }

  return { isCorrect: false, mistakes };
}

/** Evaluate y on the student's line at a given x (returns y). For vertical lines, returns the y of p1. */
function evalLineAtX(line, x) {
  const dx = line.p2.x - line.p1.x;
  if (Math.abs(dx) < 1e-12) return line.p1.y;
  const t = (x - line.p1.x) / dx;
  return line.p1.y + t * (line.p2.y - line.p1.y);
}

/**
 * Pick the closest student line to the expected line.
 * "Closest" = smallest average perpendicular distance at test points.
 */
export function pickClosestLine(studentLines, expectedLine) {
  const expectedCanonical = toCanonical(expectedLine.p1, expectedLine.p2);
  if (!expectedCanonical) return studentLines[0];

  let best = null;
  let bestScore = Infinity;

  for (const sl of studentLines) {
    const testXs = [-4, 0, 4];
    const avg = testXs
      .map((x) => pointToLineDistance(expectedCanonical, x, evalLineAtX(sl, x)))
      .reduce((a, b) => a + b, 0) / testXs.length;
    if (avg < bestScore) {
      bestScore = avg;
      best = sl;
    }
  }
  return best;
}
