import { gradeSingleLine, pickClosestLine } from '../grading/gradeLine.js';
import { lineAngle, toCanonical, pointToLineDistance } from '../grading/geometry.js';
import { ANGLE_TOLERANCE, DISTANCE_TOLERANCE } from '../grading/tolerances.js';

const TYPE_ID = 'parallel-free';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEquation() {
  let m;
  if (Math.random() < 0.15) {
    m = 0;
  } else {
    do { m = randomInt(-5, 5); } while (m === 0);
  }
  const b = randomInt(-8, 8);
  const y1 = m * -5 + b;
  const y2 = m * 5 + b;
  if (!((y1 >= -10 && y1 <= 10) || (y2 >= -10 && y2 <= 10))) return generateEquation();
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

function pointsForEquation(m, b) {
  const p1 = { x: 0, y: b };
  const p2x = m === 0 ? 5 : 1;
  const p2 = { x: p2x, y: m * p2x + b };
  return { p1, p2 };
}

function areLinesParallel(line1, line2) {
  const a1 = lineAngle(line1.p1, line1.p2);
  const a2 = lineAngle(line2.p1, line2.p2);
  let diff = Math.abs(a1 - a2);
  if (diff > Math.PI / 2) diff = Math.PI - diff;
  return diff <= ANGLE_TOLERANCE;
}

function areSameLine(line1, line2) {
  const canonical = toCanonical(line1.p1, line1.p2);
  if (!canonical) return false;
  const d1 = pointToLineDistance(canonical, line2.p1.x, line2.p1.y);
  const d2 = pointToLineDistance(canonical, line2.p2.x, line2.p2.y);
  return d1 <= DISTANCE_TOLERANCE && d2 <= DISTANCE_TOLERANCE;
}

export function createParallelFreeQuestion() {
  const { m, b } = generateEquation();
  const { p1, p2 } = pointsForEquation(m, b);
  const eqStr = formatEquation(m, b);
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Draw the line ${eqStr}. Then draw any line parallel to it.`,
    correctAnswer: { m, b, p1, p2 },
    grade(studentDrawingData) {
      const studentLines = studentDrawingData.lines;

      if (!studentLines || studentLines.length === 0) {
        return { isCorrect: false, mistakes: [{ code: 'NO_LINE_DRAWN' }] };
      }
      if (studentLines.length < 2) {
        return { isCorrect: false, mistakes: [{ code: 'NEED_TWO_LINES' }] };
      }

      const expectedOriginal = { p1, p2 };
      const originalMatch = pickClosestLine(studentLines, expectedOriginal);
      const otherLine = studentLines.find((l) => l !== originalMatch) || studentLines[1];

      const originalResult = gradeSingleLine(originalMatch, expectedOriginal);

      const mistakes = [];

      if (!originalResult.isCorrect) {
        for (const mk of originalResult.mistakes) {
          mistakes.push({ ...mk, meta: { ...mk.meta, which: 'original' } });
        }
      }

      if (areSameLine(originalMatch, otherLine)) {
        mistakes.push({ code: 'LINES_IDENTICAL' });
      } else if (!areLinesParallel(originalMatch, otherLine)) {
        mistakes.push({ code: 'NOT_PARALLEL' });
      }

      return {
        isCorrect: mistakes.length === 0,
        mistakes,
      };
    },
  };
}
