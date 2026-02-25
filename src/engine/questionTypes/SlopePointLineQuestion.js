import { gradeSingleLine, pickClosestLine } from '../grading/gradeLine.js';

const TYPE_ID = 'slope-point-line';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generate() {
  let m;
  if (Math.random() < 0.15) {
    m = 0;
  } else {
    do { m = randomInt(-5, 5); } while (m === 0);
  }

  const px = randomInt(-8, 8);
  const py = randomInt(-8, 8);

  const yAtNeg5 = m * (-5 - px) + py;
  const yAt5 = m * (5 - px) + py;
  const visible = (yAtNeg5 >= -10 && yAtNeg5 <= 10) || (yAt5 >= -10 && yAt5 <= 10);
  if (!visible) return generate();

  return { m, px, py };
}

function formatSlope(m) {
  if (m === 0) return '0';
  if (m === 1) return '1';
  if (m === -1) return '-1';
  return String(m);
}

function pointsForSlopePoint(m, px, py) {
  const p1 = { x: px, y: py };
  const dx = m === 0 ? 5 : 1;
  const p2 = { x: px + dx, y: py + m * dx };
  return { p1, p2 };
}

export function createSlopePointLineQuestion() {
  const { m, px, py } = generate();
  const { p1, p2 } = pointsForSlopePoint(m, px, py);
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Draw the line with slope ${formatSlope(m)} that passes through (${px}, ${py}).`,
    correctAnswer: { m, point: { x: px, y: py }, p1, p2 },
    grade(studentDrawingData) {
      const studentLines = studentDrawingData.lines;

      if (!studentLines || studentLines.length === 0) {
        return {
          isCorrect: false,
          mistakes: [{ code: 'NO_LINE_DRAWN' }],
        };
      }

      const expectedLine = { p1, p2 };
      const chosen = studentLines.length === 1
        ? studentLines[0]
        : pickClosestLine(studentLines, expectedLine);

      return gradeSingleLine(chosen, expectedLine);
    },
  };
}
