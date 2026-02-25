const VALID_TYPES = [
  'two-points-line',
  'equation-line',
  'slope-point-line',
  'parallel-free',
  'parallel-through-point',
  'vertex-point-parabola',
  'center-radius-circle',
  'mixed',
];

const SYSTEM_PROMPT = `You are a classifier for a math learning app about graphing on a coordinate grid.

Given a teacher's description of what they want students to practice, return EXACTLY ONE of these type IDs:

- two-points-line — Drawing a line through two given points
- equation-line — Drawing a line from an equation like y = mx + b
- slope-point-line — Drawing a line given a slope and a point
- parallel-free — Drawing a given line and then any parallel line
- parallel-through-point — Drawing a given line and a parallel line through a specific point
- vertex-point-parabola — Graphing a parabola given its vertex and a point it passes through
- center-radius-circle — Graphing a circle given its center and radius
- mixed — A variety/mix of all question types

Return ONLY the type ID. No explanation, no punctuation, no extra text.`;

/**
 * Call OpenAI to classify the teacher's prompt into a question type.
 * Falls back to keyword matching if the API call fails.
 */
export async function matchTopic(userInput) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (apiKey && apiKey !== 'your-api-key-here') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          max_tokens: 20,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userInput },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const answer = (data.choices?.[0]?.message?.content || '').trim().toLowerCase();
        if (VALID_TYPES.includes(answer)) return answer;
      }
    } catch (_) {
      // Fall through to keyword matching
    }
  }

  return keywordMatch(userInput);
}

function keywordMatch(input) {
  const lower = input.toLowerCase();

  const mixedPatterns = ['mix', 'random', 'variety', 'all types', 'any type', 'everything', 'all of'];
  if (mixedPatterns.some((p) => lower.includes(p))) return 'mixed';

  if (lower.includes('parabola') || lower.includes('quadratic') || lower.includes('vertex')) {
    return 'vertex-point-parabola';
  }

  if (lower.includes('circle') || lower.includes('radius')) {
    return 'center-radius-circle';
  }

  if (lower.includes('parallel')) {
    if (lower.includes('through') || lower.includes('point') || lower.includes('specific')) {
      return 'parallel-through-point';
    }
    return 'parallel-free';
  }

  if (lower.includes('two point') || lower.includes('2 point') || lower.includes('through point')) {
    return 'two-points-line';
  }

  if (lower.includes('equation') || lower.includes('y =') || lower.includes('mx + b') || lower.includes('slope intercept') || lower.includes('slope-intercept')) {
    return 'equation-line';
  }

  if (lower.includes('slope') && lower.includes('point')) {
    return 'slope-point-line';
  }
  if (lower.includes('slope') || lower.includes('given slope')) {
    return 'slope-point-line';
  }

  return 'mixed';
}
