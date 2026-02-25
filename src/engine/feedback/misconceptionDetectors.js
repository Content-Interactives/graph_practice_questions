const SHARED = {
  NO_LINE_DRAWN: [
    'Have you placed two points yet?',
    'What two points could define your line?',
  ],
  DEGENERATE_LINE: [
    'Make sure your two points are not in the same location.',
    'A line needs two distinct points — try placing them further apart.',
  ],
  NEED_TWO_LINES: [
    'This question requires two lines. Have you drawn both?',
    'You need to draw a second line — click two more points on the grid.',
  ],
  NOT_PARALLEL: [
    'Parallel lines have the same slope. Do both of your lines have the same steepness?',
    'If one line goes up 2 for every 1 to the right, the parallel line should too.',
    'Check that your second line tilts at exactly the same angle as the first.',
  ],
  LINES_IDENTICAL: [
    'Your two lines look the same. A parallel line must be shifted up or down.',
    'Parallel means same slope but a different position — try moving your second line.',
  ],
  PARALLEL_MISSING_POINT: [
    'Your second line is parallel, but it doesn\'t pass through the required point.',
    'Check: does your parallel line go through the specific point given in the problem?',
    'Try shifting your parallel line so it crosses the given point.',
  ],
};

const BY_TYPE = {
  'two-points-line': {
    WRONG_SLOPE: [
      'Does your line pass through both given points?',
      'Try computing the slope: (y₂ − y₁) / (x₂ − x₁). Does your line match?',
      'Check that the steepness of your line matches what the two points require.',
    ],
    WRONG_INTERCEPT: [
      'Your line has the right steepness, but it looks shifted. Does it pass through both points?',
      'Try substituting one of the given points into your line — does it fit?',
    ],
    WRONG_POINTS: [
      'Does your line pass exactly through both given points?',
      'What happens if you substitute the x-values of the given points into your line?',
      'Try verifying each point lies on your drawn line.',
    ],
  },
  'equation-line': {
    WRONG_SLOPE: [
      'What is the coefficient of x in the equation? That is your slope.',
      'If x increases by 1, how much should y change according to the equation?',
      'Check the steepness of your line — does it match the equation?',
    ],
    WRONG_INTERCEPT: [
      'Where should the line cross the y-axis? Look at the constant in the equation.',
      'What value does the equation give when x = 0?',
      'Your slope looks right, but the line is shifted up or down.',
    ],
    WRONG_POINTS: [
      'Pick an easy x-value (like 0 or 1) and compute y from the equation. Does your line pass through that point?',
      'Try checking two points on your line against the equation.',
    ],
  },
  'slope-point-line': {
    WRONG_SLOPE: [
      'The slope is given directly in the problem. If x increases by 1, y should change by exactly that amount.',
      'Check the steepness of your line — does it match the given slope?',
      'Try counting grid squares: for each 1 unit right, how many units does your line go up or down?',
    ],
    WRONG_INTERCEPT: [
      'Your line has the right steepness but doesn\'t pass through the given point.',
      'Try substituting the given point\'s coordinates — does your line actually go through it?',
      'Slide your line (without changing its tilt) so it passes through the required point.',
    ],
    WRONG_POINTS: [
      'Does your line pass through the specific point given in the problem?',
      'Check: if you plug the given x-value into your line, do you get the given y-value?',
    ],
  },
  'parallel-free': {
    WRONG_SLOPE: [
      'Look at the equation — what is the coefficient of x? That determines the slope of your first line.',
      'Does your first line match the given equation?',
    ],
    WRONG_INTERCEPT: [
      'Your first line has the right slope but is shifted. Where should it cross the y-axis?',
      'What value does the equation give when x = 0?',
    ],
  },
  'parallel-through-point': {
    WRONG_SLOPE: [
      'Does your first line match the given equation? Check the slope.',
      'What is the coefficient of x in the equation?',
    ],
    WRONG_INTERCEPT: [
      'Your first line has the right slope but is shifted. Check where it crosses the y-axis.',
    ],
  },
  'vertex-point-parabola': {
    NO_PARABOLA_DRAWN: [
      'Have you placed a vertex and a second point yet?',
      'Click to place the vertex first, then click a second point to shape the parabola.',
    ],
    WRONG_VERTEX: [
      'Where is the vertex of this parabola? The problem tells you directly.',
      'The vertex is the turning point — place it at the coordinates given in the problem.',
    ],
    WRONG_DIRECTION: [
      'Your parabola opens the wrong way. Should it open upward or downward?',
      'Check whether the given point is above or below the vertex — that determines the direction.',
      'If the pass-through point is below the vertex, the parabola must open downward.',
    ],
    WRONG_SHAPE: [
      'Your vertex is correct, but the parabola doesn\'t pass through the required point.',
      'Try placing your second point so the curve goes through the given point.',
      'Check: does your parabola actually pass through the second coordinate given in the problem?',
    ],
  },
  'center-radius-circle': {
    NO_CIRCLE_DRAWN: [
      'Have you placed a center and an edge point yet?',
      'Click to place the center first, then click a point on the circle\'s edge.',
    ],
    WRONG_CENTER: [
      'Where should the center of the circle be? The problem gives you the coordinates.',
      'Place the center point at the exact coordinates given in the problem.',
    ],
    WRONG_RADIUS: [
      'Your center is correct, but the radius doesn\'t match.',
      'Count grid squares from the center to your edge point — does the distance equal the given radius?',
      'Remember: the radius is the distance from center to any point on the circle.',
    ],
  },
};

/**
 * Given a mistake code and question type, return 1–3 Socratic guiding questions.
 */
export function questionsForMistake(code, typeId) {
  const typePool = BY_TYPE[typeId];
  const pool = (typePool && typePool[code]) || SHARED[code] || BY_TYPE['equation-line'][code] || [];

  if (pool.length === 0) return ['Take another look at the problem and try again.'];

  const count = Math.min(pool.length, 2 + Math.floor(Math.random() * 2));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
