const VERTEX_TOLERANCE = 0.5;
const A_TOLERANCE = 0.15;

/**
 * Grade a student's parabola against the expected parabola.
 *
 * @param {{ vertex: {x,y}, secondPoint: {x,y}, h: number, k: number, a: number }} studentParabola
 * @param {{ h: number, k: number, a: number }} expected
 * @returns {{ isCorrect: boolean, mistakes: Array<{ code: string, meta?: object }> }}
 */
export function gradeSingleParabola(studentParabola, expected) {
  const mistakes = [];

  const vertexDx = Math.abs(studentParabola.vertex.x - expected.h);
  const vertexDy = Math.abs(studentParabola.vertex.y - expected.k);
  const vertexCorrect = vertexDx <= VERTEX_TOLERANCE && vertexDy <= VERTEX_TOLERANCE;

  const aCorrect = Math.abs(studentParabola.a - expected.a) <= A_TOLERANCE;

  if (vertexCorrect && aCorrect) {
    return { isCorrect: true, mistakes: [] };
  }

  if (!vertexCorrect) {
    mistakes.push({
      code: 'WRONG_VERTEX',
      meta: {
        expectedVertex: { x: expected.h, y: expected.k },
        studentVertex: studentParabola.vertex,
      },
    });
  }

  if (!aCorrect) {
    const expectedSign = Math.sign(expected.a);
    const studentSign = Math.sign(studentParabola.a);
    if (expectedSign !== studentSign && expectedSign !== 0 && studentSign !== 0) {
      mistakes.push({
        code: 'WRONG_DIRECTION',
        meta: { expectedA: expected.a, studentA: studentParabola.a },
      });
    } else {
      mistakes.push({
        code: 'WRONG_SHAPE',
        meta: { expectedA: expected.a, studentA: studentParabola.a },
      });
    }
  }

  return { isCorrect: false, mistakes };
}

/**
 * Pick the student parabola closest to the expected one (by vertex distance + a difference).
 */
export function pickClosestParabola(studentParabolas, expected) {
  let best = null;
  let bestScore = Infinity;

  for (const sp of studentParabolas) {
    const vDist = Math.hypot(sp.vertex.x - expected.h, sp.vertex.y - expected.k);
    const aDiff = Math.abs(sp.a - expected.a);
    const score = vDist + aDiff * 5;
    if (score < bestScore) {
      bestScore = score;
      best = sp;
    }
  }
  return best;
}
