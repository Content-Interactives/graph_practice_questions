import { gradeSingleLine, pickClosestLine } from '../grading/gradeLine.js';
import { lineAngle, toCanonical, pointToLineDistance } from '../grading/geometry.js';
import { ANGLE_TOLERANCE, DISTANCE_TOLERANCE } from '../grading/tolerances.js';

const TYPE_ID = 'parallel-through-point';

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

function generatePoint(m, b) {
  let px, py;
  do {
    px = randomInt(-8, 8);
    py = randomInt(-8, 8);
  } while (py === m * px + b);

  const parallelB = py - m * px;
  const yCheck1 = m * -5 + parallelB;
  const yCheck2 = m * 5 + parallelB;
  if (!((yCheck1 >= -10 && yCheck1 <= 10) || (yCheck2 >= -10 && yCheck2 <= 10))) {
    return generatePoint(m, b);
  }

  return { px, py };
}

export function createParallelThroughPointQuestion() {
  const { m, b } = generateEquation();
  const { p1, p2 } = pointsForEquation(m, b);
  const { px, py } = generatePoint(m, b);
  const eqStr = formatEquation(m, b);

  const parallelP1 = { x: px, y: py };
  const dx = m === 0 ? 5 : 1;
  const parallelP2 = { x: px + dx, y: py + m * dx };

  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Draw the line ${eqStr}. Then draw the parallel line that passes through (${px}, ${py}).`,
    correctAnswer: { m, b, p1, p2, parallelP1, parallelP2 },
    grade(studentDrawingData) {
      const studentLines = studentDrawingData.lines;

      if (!studentLines || studentLines.length === 0) {
        return { isCorrect: false, mistakes: [{ code: 'NO_LINE_DRAWN' }] };
      }
      if (studentLines.length < 2) {
        return { isCorrect: false, mistakes: [{ code: 'NEED_TWO_LINES' }] };
      }

      const expectedOriginal = { p1, p2 };
      const expectedParallel = { p1: parallelP1, p2: parallelP2 };

      const originalMatch = pickClosestLine(studentLines, expectedOriginal);
      const otherLine = studentLines.find((l) => l !== originalMatch) || studentLines[1];

      const originalResult = gradeSingleLine(originalMatch, expectedOriginal);
      const parallelResult = gradeSingleLine(otherLine, expectedParallel);

      const mistakes = [];

      if (!originalResult.isCorrect) {
        for (const mk of originalResult.mistakes) {
          mistakes.push({ ...mk, code: mk.code, meta: { ...mk.meta, which: 'original' } });
        }
      }

      if (!parallelResult.isCorrect) {
        const parallelAngle = lineAngle(expectedParallel.p1, expectedParallel.p2);
        const studentAngle = lineAngle(otherLine.p1, otherLine.p2);
        let angleDiff = Math.abs(parallelAngle - studentAngle);
        if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;
        const slopeOk = angleDiff <= ANGLE_TOLERANCE;

        if (!slopeOk) {
          mistakes.push({ code: 'NOT_PARALLEL' });
        } else {
          const canon = toCanonical(expectedParallel.p1, expectedParallel.p2);
          const dist = canon ? pointToLineDistance(canon, otherLine.p1.x, otherLine.p1.y) : 999;
          if (dist > DISTANCE_TOLERANCE) {
            mistakes.push({ code: 'PARALLEL_MISSING_POINT', meta: { px, py } });
          }
        }
      }

      return {
        isCorrect: mistakes.length === 0,
        mistakes,
      };
    },
  };
}
