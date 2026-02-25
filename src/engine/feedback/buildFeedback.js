import { questionsForMistake } from './misconceptionDetectors.js';

/**
 * Build Socratic feedback from a GradeResult.
 * @param {{ isCorrect: boolean, mistakes: Array<{ code: string, meta?: object }> }} gradeResult
 * @param {string} typeId - the question type (e.g. 'two-points-line', 'equation-line', 'slope-point-line')
 * @returns {string[]} Array of 1-3 guiding questions
 */
export function buildFeedback(gradeResult, typeId) {
  if (gradeResult.isCorrect) return [];

  const allQuestions = [];
  for (const mistake of gradeResult.mistakes) {
    allQuestions.push(...questionsForMistake(mistake.code, typeId));
  }

  const unique = [...new Set(allQuestions)];
  return unique.slice(0, 3);
}
