import { gradeSingleCircle, pickClosestCircle } from '../grading/gradeCircle.js';

const TYPE_ID = 'center-radius-circle';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCircleParams() {
  const h = randomInt(-5, 5);
  const k = randomInt(-5, 5);
  const r = randomInt(1, 5);

  // Ensure at least part of the circle is visible within [-10, 10]
  const leftEdge = h - r;
  const rightEdge = h + r;
  const topEdge = k + r;
  const bottomEdge = k - r;
  const visible =
    rightEdge >= -10 && leftEdge <= 10 &&
    topEdge >= -10 && bottomEdge <= 10;

  if (!visible) return generateCircleParams();

  return { h, k, r };
}

export function createCenterRadiusCircleQuestion() {
  const { h, k, r } = generateCircleParams();
  const id = `${TYPE_ID}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    typeId: TYPE_ID,
    prompt: `Graph a circle with center (${h}, ${k}) and radius ${r}.`,
    correctAnswer: { h, k, r },
    grade(studentDrawingData) {
      const studentCircles = studentDrawingData.circles;

      if (!studentCircles || studentCircles.length === 0) {
        return {
          isCorrect: false,
          mistakes: [{ code: 'NO_CIRCLE_DRAWN' }],
        };
      }

      const chosen = studentCircles.length === 1
        ? studentCircles[0]
        : pickClosestCircle(studentCircles, { h, k, r });

      return gradeSingleCircle(chosen, { h, k, r });
    },
  };
}
