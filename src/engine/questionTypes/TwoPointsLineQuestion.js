import { gradeSingleLine, pickClosestLine } from '../grading/gradeLine.js';

const TYPE_ID = 'two-points-line';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MAX_SLOPE = 5;

function generateTwoDistinctPoints() {
  let p1, p2;
  do {
    p1 = { x: randomInt(-8, 8), y: randomInt(-8, 8) };
    p2 = { x: randomInt(-8, 8), y: randomInt(-8, 8) };
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const identical = dx === 0 && dy === 0;
    const vertical = dx === 0;
    const tooSteep = Math.abs(dx) > 0 && Math.abs(dy / dx) > MAX_SLOPE;
    if (identical || vertical || tooSteep) continue;
    break;
  } while (true);

  return { p1, p2 };
}

export function createTwoPointsLineQuestion() {
  const { p1, p2 } = generateTwoDistinctPoints();
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Draw the line that passes through (${p1.x}, ${p1.y}) and (${p2.x}, ${p2.y}).`,
    correctAnswer: { p1, p2 },
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

      const result = gradeSingleLine(chosen, expectedLine);

      // For two-points questions, if slope is correct but intercept is wrong,
      // also flag WRONG_POINTS since the mental model is about passing through points
      if (!result.isCorrect && result.mistakes.every((m) => m.code !== 'WRONG_SLOPE')) {
        const hasIntercept = result.mistakes.some((m) => m.code === 'WRONG_INTERCEPT');
        if (hasIntercept) {
          result.mistakes.push({ code: 'WRONG_POINTS', meta: { p1, p2 } });
        }
      }

      return result;
    },
  };
}
