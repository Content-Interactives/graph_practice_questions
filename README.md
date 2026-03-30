# Graph Practice Questions

**Live site:** https://content-interactives.github.io/graph_practice_questions/

A React + Vite single-page app for **coordinate-plane graphing practice**. A teacher (or student) describes what to practice in natural language; the app maps that to a **question type**, generates a random instance, and the learner draws on an interactive grid. **Submit** runs server-free grading with numeric tolerances and, when wrong, shows short **Socratic** follow-up prompts derived from detected mistake codes.

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 19 |
| Build | Vite 7 with `@vitejs/plugin-react` |
| Styling | `App.css` (layout, cards, buttons); Tailwind 3 is wired in `tailwind.config.js` and `index.css` (`@tailwind` layers) |
| Optional NLP | OpenAI Chat Completions (`gpt-4o-mini`) when `VITE_OPENAI_API_KEY` is set; otherwise **keyword fallback** in `topicMatcher.js` |
| Deploy | `gh-pages` → `dist/` (`predeploy` runs `vite build`); `vite.config.js` sets `base: '/graph_practice_questions/'` to match GitHub Pages |

## Quick start

```bash
npm install
npm run dev
```

Production build and local preview:

```bash
npm run build
npm run preview
```

Deploy to GitHub Pages (requires repo settings / branch for `gh-pages` as usual):

```bash
npm run deploy
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_OPENAI_API_KEY` | If set and not the placeholder `your-api-key-here`, `matchTopic()` calls OpenAI to classify the topic prompt into a type ID. If missing, invalid, or the request fails, **keyword matching** is used. |

Create a `.env` or `.env.local` in the project root (do not commit secrets):

```env
VITE_OPENAI_API_KEY=sk-...
```

## User flow

1. **Topic screen** — User describes practice (e.g. “lines from equations”, “parabolas”, “mix”). `TopicPrompt` calls `matchTopic()` → `topicId`.
2. **Practice** — `App` calls `createQuestion(topicId)` or `createRandomQuestion()` for `mixed`, then shows the prompt and the correct **graph component** for that type.
3. **Drawing** — Linear tasks use `TwoPointDrawing`; parabolas use `ParabolaGraphing`; circles use `CircleDrawing`. Each exposes an imperative API via `ref`: `getStudentDrawingData()` and `reset()`.
4. **Submit** — `currentQuestion.grade(studentData)` returns `{ isCorrect, mistakes }`. On incorrect answers, `buildFeedback()` maps mistake codes to up to three guiding questions.

## Question types and registry

Types are registered in `src/engine/questionRegistry.js`. Each factory returns an object with at least: `id`, `typeId`, `prompt`, `correctAnswer`, and `grade(studentDrawingData)`.

| `typeId` | Graph | What the student practices |
|----------|--------|----------------------------|
| `two-points-line` | linear | Line through two given points |
| `equation-line` | linear | Line for an equation (e.g. slope–intercept) |
| `slope-point-line` | linear | Line from slope and a point |
| `parallel-free` | linear | Given line + any parallel line |
| `parallel-through-point` | linear | Given line + parallel through a specific point |
| `vertex-point-parabola` | parabola | Parabola from vertex and another point |
| `center-radius-circle` | circle | Circle from center and radius (via center + edge point in the UI) |
| `mixed` | varies | Random choice among all factories |

`graphTypeForQuestion(typeId)` maps each type to `'linear' | 'parabola' | 'circle'` so `App.jsx` mounts the right canvas.

## Student drawing data (grading input)

Shapes are expressed in **coordinate-plane units** on a bounded domain (components typically use \([-10, 10]\) for both axes).

- **Linear (`TwoPointDrawing`):** `{ lines: [{ p1: {x,y}, p2: {x,y} }], domain }`
- **Parabola (`ParabolaGraphing`):** `{ parabolas: [{ vertex, secondPoint, h, k, a }], domain }`
- **Circle (`CircleDrawing`):** `{ circles: [{ center, edgePoint, radius }], domain }`

Graders in `src/engine/grading/` compare student geometry to `correctAnswer` using shared helpers (`geometry.js`, etc.).

## Grading and tolerances

- Numeric tolerances live in `src/engine/grading/tolerances.js` (e.g. angle and distance thresholds in coordinate units / radians).
- Line work is centralized in `gradeLine.js`; parabolas in `gradeParabola.js`; circles in `gradeCircle.js`.
- A grade result includes `mistakes: [{ code, meta? }]`. Codes are consumed by `src/engine/feedback/misconceptionDetectors.js` and turned into strings by `buildFeedback.js` (deduped, capped at three).

## Repository layout

```
src/
  main.jsx
  App.jsx
  App.css
  index.css                 # Tailwind layers + global box model
  components/
    TopicPrompt.jsx         # Natural-language topic entry
    TwoPointDrawing.jsx     # Lines (multi-segment, clip-to-grid SVG)
    ParabolaGraphing.jsx
    CircleDrawing.jsx
  engine/
    questionRegistry.js     # Factories, random selection, graph type map
    topicMatcher.js         # OpenAI + keyword fallback
    questionTypes/          # One module per type (prompt + grade)
    grading/
    feedback/
```

## Extending the interactive

1. Add a factory module under `engine/questionTypes/` that exports `create…Question()` returning the standard question object.
2. Register the `typeId` and factory in `questionFactories` and `GRAPH_TYPES` inside `questionRegistry.js`.
3. If the new type needs a new graph primitive, add a component with `forwardRef` + `useImperativeHandle` matching the shape expected by your `grade()` function, then branch on `graphTypeForQuestion` in `App.jsx`.
4. Update `VALID_TYPES` and the system/keyword rules in `topicMatcher.js` so prompts can resolve to the new type.

## Scripts

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |
| Deploy | `npm run deploy` (`predeploy` builds first) |
