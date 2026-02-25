import { gradeSingleLine, pickClosestLine } from '../grading/gradeLine.js';

const TYPE_ID = 'equation-line';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEquation() {
  // m in [-5, 5], mostly non-zero but allow 0 ~20% of the time
  let m;
  if (Math.random() < 0.2) {
    m = 0;
  } else {
    do { m = randomInt(-5, 5); } while (m === 0);
  }

  const b = randomInt(-8, 8);

  // Verify the line stays mostly visible: check y at x = -5 and x = 5
  const y1 = m * -5 + b;
  const y2 = m * 5 + b;
  const inRange = (y1 >= -10 && y1 <= 10) || (y2 >= -10 && y2 <= 10);
  if (!inRange) return generateEquation(); // retry (rare with these ranges)

  return { m, b };
}

function formatEquation(m, b) {
  if (m === 0) return `y = ${b}`;

  let slopeStr;
  if (m === 1) slopeStr = 'x';
  else if (m === -1) slopeStr = '-x';
  else slopeStr = `${m}x`;

  if (b === 0) return `y = ${slopeStr}`;
  if (b > 0) return `y = ${slopeStr} + ${b}`;
  return `y = ${slopeStr} - ${Math.abs(b)}`;
}

/**
 * Two points on the line y = mx + b that lie within [-10, 10].
 */
function pointsForEquation(m, b) {
  const p1 = { x: 0, y: b };
  const p2x = m === 0 ? 5 : 1;
  const p2 = { x: p2x, y: m * p2x + b };
  return { p1, p2 };
}

export function createEquationLineQuestion() {
  const { m, b } = generateEquation();
  const { p1, p2 } = pointsForEquation(m, b);
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Draw the line: ${formatEquation(m, b)}`,
    correctAnswer: { m, b, p1, p2 },
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
