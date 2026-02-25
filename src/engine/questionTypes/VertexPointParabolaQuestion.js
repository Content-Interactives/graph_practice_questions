import { gradeSingleParabola, pickClosestParabola } from '../grading/gradeParabola.js';

const TYPE_ID = 'vertex-point-parabola';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const A_VALUES = [-2, -1, -0.5, 0.5, 1, 2];

function generateParabolaParams() {
  const h = randomInt(-5, 5);
  const k = randomInt(-5, 5);
  const a = A_VALUES[Math.floor(Math.random() * A_VALUES.length)];

  // Pick a pass-through point: choose px != h, compute py = a(px-h)^2 + k, ensure py is on-grid
  let px, py;
  let attempts = 0;
  do {
    px = randomInt(-8, 8);
    if (px === h) continue;
    py = a * (px - h) * (px - h) + k;
    // py must be an integer within visible range
    if (Number.isInteger(py) && py >= -8 && py <= 8) break;
    attempts++;
  } while (attempts < 100);

  if (attempts >= 100) {
    // Fallback: use simple known-good values
    return { h: 0, k: 0, a: 1, px: 2, py: 4 };
  }

  return { h, k, a, px, py };
}

export function createVertexPointParabolaQuestion() {
  const { h, k, a, px, py } = generateParabolaParams();
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Graph a parabola with vertex (${h}, ${k}) that passes through (${px}, ${py}).`,
    correctAnswer: { h, k, a },
    grade(studentDrawingData) {
      const studentParabolas = studentDrawingData.parabolas;

      if (!studentParabolas || studentParabolas.length === 0) {
        return {
          isCorrect: false,
          mistakes: [{ code: 'NO_PARABOLA_DRAWN' }],
        };
      }

      const chosen = studentParabolas.length === 1
        ? studentParabolas[0]
        : pickClosestParabola(studentParabolas, { h, k, a });

      return gradeSingleParabola(chosen, { h, k, a });
    },
  };
}
