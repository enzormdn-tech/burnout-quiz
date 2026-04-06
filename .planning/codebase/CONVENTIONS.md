# Coding Conventions

**Analysis Date:** 2026-04-06

## Naming Patterns

**Files:**
- Lowercase, kebab-case for HTML files: `index.html`, `resultats.html`, `appel.html`
- Single stylesheet: `style.css`
- Single script: `script.js`
- No file type suffixes in names (no `.component.html`, `.utils.js`)

**Functions:**
- camelCase: `ping()`, `calcScores()`, `getLevel()`, `getMirrorText()`, `renderQuestion()`, `onAnswer()`, `onQuizComplete()`, `renderTeaser()`, `sendWebhook()`, `showScreen()`, `getLevelClass()`, `render()`, `showError()`, `esc()`
- Action verbs as prefixes: `get*`, `render*`, `on*`, `show*`, `calc*`, `send*`, `strip*`
- Named functions preferred over anonymous (except in event listeners for brevity)

**Variables:**
- camelCase for all variables: `state`, `screens`, `WEBHOOK_URL`, `PING_URL`, `QUESTIONS`, `SCALE`, `prenom`, `email`, `answering`, `submitted`
- SCREAMING_SNAKE_CASE for constants: `WEBHOOK_URL`, `PING_URL`, `QUESTIONS`, `SCALE`
- State object uses camelCase properties: `state.current`, `state.answers`, `state.scores`, `state.prenom`, `state.email`, `state.answering`, `state.submitted`
- DOM element IDs use kebab-case: `screen-intro`, `screen-quiz`, `screen-teaser`, `screen-confirm`, `btn-start`, `btn-back`, `progress-bar`, `question-counter`, `question-wrapper`, `question-text`, `answers`, `level-badge`, `dim-personal-fill`, `dim-work-fill`, `teaser-text`, `prenom-input`, `email-input`, `btn-submit-email`

**CSS Class Names:**
- BEM methodology with strict kebab-case: `.screen`, `.screen.active`, `.screen.visible`, `.container`, `.intro-content`, `.intro-hook`, `.intro-body`, `.intro-what`, `.intro-what-label`, `.intro-list`, `.intro-meta`, `.btn-primary`, `.btn-back`
- State classes use `is-` prefix or direct state class: `.active`, `.visible`, `.selected`, `.locked`, `.disabled`
- Utility/layout classes: `.container`, `.section`, `.section-label`, `.level-badge`, `.dimensions`, `.dimension`, `.step`, `.steps`
- No underscore separators in class names—only kebab-case

**CSS Custom Properties:**
- Double-dash prefix: `--bg`, `--text`, `--sub`, `--btn-idle`, `--btn-hover`, `--btn-sel`, `--btn-sel-t`, `--border`, `--accent`, `--bar-bg`
- Level colors use dash separators: `--level-green`, `--level-yellow`, `--level-orange`, `--level-red`
- Pattern: `--role-descriptor` (e.g., `--btn-idle`, `--level-orange`)

## Code Style

**Formatting:**
- No automated formatter configured. Manual consistency maintained.
- 2-space indentation throughout (HTML, CSS, JS)
- Line length: no hard limit, but lines typically stay under 100 characters
- No semicolons in CSS (common practice for modern CSS)
- Semicolons required in JavaScript

**Linting:**
- No linter configured
- No `.eslintrc`, `.prettier`, or similar config files
- Code quality enforced by manual review and convention

**Spacing and Whitespace:**
- Blank lines between logical sections marked by comment dividers
- HTML comments use: `<!-- Screen 1: Intro -->` format
- CSS comments use: `/* ─── Reset & Base ─────────────────────────────────────────────────── */` format with decorative dashes
- JS comments use: `// ─── Config ──────────────────────────────────────────────────────────` format
- Single blank line between sections within functions
- No blank lines between property declarations in CSS rules

## Import Organization

**JavaScript:**
- No import statements—all code is inline in single `script.js` file
- No module system (CommonJS, ES6 modules)
- External dependencies loaded via inline `<script>` tags: Calendly widget loaded in `appel.html`
- Order within `script.js`:
  1. Configuration constants (`WEBHOOK_URL`, `PING_URL`)
  2. Ping/instrumentation function
  3. Question and scale data
  4. State object
  5. DOM references object
  6. Helper functions
  7. Quiz logic (render, answer handlers)
  8. Teaser logic (results rendering)
  9. Submit/webhook logic
  10. Event listener initialization

**HTML:**
- Link order in `<head>`:
  1. Meta tags (charset, viewport)
  2. Preconnect to Google Fonts
  3. Google Fonts stylesheet link
  4. Project stylesheet (`style.css`)
- Inline styles permitted only in `<style>` tags (used in `resultats.html` and `appel.html`)
- Scripts loaded at end of `<body>` before closing tag

**CSS:**
- No CSS imports. Single stylesheet with all rules inline.
- Organization within `style.css`:
  1. Reset and base styles
  2. CSS custom properties (`:root`)
  3. Screen layout rules
  4. Component-specific rules (grouped by feature/screen)
  5. Responsive media queries at end

## Error Handling

**Validation:**
- Email validation via regex on client side: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Form field error state shown by inline border color change: `borderColor = '#c0622a'` (orange error color)
- No error messages shown to user—just visual border highlight on invalid field
- Name input checked with `.trim()` for non-empty
- Prenom input focused on validation failure

**Webhook/Fetch:**
- No error handling on webhook fetch calls—errors silently caught: `.catch(() => {})`
- User sees confirmation screen regardless of webhook success/failure
- Prevents retry loops and awkward error states for user

**Type Safety:**
- No TypeScript. Plain JavaScript with loose typing.
- Null/undefined coalescing used in specific places: `state.answers[i] ?? 0`, `data.score_total = 0`
- XSS prevention via `esc()` function for user data output in `resultats.html`: replaces `&`, `<`, `>`, `"`

**State Mutation:**
- State object mutated directly: `state.answering = true`, `state.answers[index] = value`
- No immutability patterns or defensive copies
- State is single source of truth for quiz progression

## Logging

**Framework:** No logging framework. No logs at all.

**Instrumentation:**
- `ping()` function sends beacon events to tracking endpoint: `PING_URL`
- Events tracked: `'question_view'`, `'quiz_complete'`, `'email_submitted'`
- Uses `navigator.sendBeacon()` for non-blocking event delivery
- Payload includes event name, question number, total questions
- No console.log or debug output in production code

## Comments

**When to Comment:**
- Comment blocks separate logical sections within files
- Each screen section in HTML commented: `<!-- Screen 1: Intro -->`
- Each code section in JS commented with decorative divider: `// ─── Quiz ─────────────────────────────────────────────────────`
- Inline comments rare—code structure and naming should be self-documenting

**JSDoc/TSDoc:**
- Not used. No formal documentation strings.
- Complex functions (like `stripMd()` in `resultats.html`) explained with inline comments
- Example: `stripMd(str)` comment explains it strips Markdown formatting

**Data Structure Comments:**
- Question data commented with dimension mapping: `// dim P = personnel (Q1-6, max 24), W = travail (Q7-11, max 20), D = retrait (Q12-13, max 8)`
- Scale values documented inline in SCALE array structure
- No separate documentation file for data schemas

## Function Design

**Size:**
- Functions kept small and focused: typically 5-20 lines
- Longest function: `render()` in `resultats.html` (~50 lines, but mostly HTML string generation)
- Event handlers generally 10-15 lines

**Parameters:**
- Functions take minimal parameters
- Prefer reading from global `state` object over passing params: `sendWebhook()` reads `state.scores`, `state.prenom`, `state.email` directly
- Single parameter pattern: `showScreen(name)`, `onAnswer(index, value, btn)`
- No destructuring—all parameters used as-is

**Return Values:**
- Functions return primitives or objects, never undefined unless unnecessary
- `calcScores()` returns object: `{ personal, work, retrait, total }`
- `getLevel()` returns object: `{ label, cls, pct }`
- Helper functions return transformed data: `getLevelClass()` returns string class name

**Side Effects:**
- Functions regularly perform DOM mutations and state changes
- No pure function enforcement—side effects are accepted pattern
- Example: `renderQuestion()` updates DOM, reads/modifies state, triggers animation

## Module Design

**Exports:**
- No module system. All code in global scope.
- Functions accessed as globals: `ping()`, `calcScores()`, etc.
- No explicit export/import statements

**Barrel Files:**
- Not applicable—single file per function type

**Code Organization:**
- All quiz logic in one `script.js` file (~270 lines)
- All styling in one `style.css` file (~516 lines)
- Each HTML page is self-contained with its own inline `<style>` and `<script>`
- Duplication across files accepted as trade-off for independence (e.g., CSS reset duplicated in each HTML file)

## Responsive Design

**Mobile-First Approach:**
- Base styles target small screens (mobile)
- Breakpoints are explicit: `@media (min-width: 680px)`
- Font sizes increase on larger screens
- Layout adjustments (button width, padding) on desktop

**Component Adjustments:**
- `.intro-hook` increases from 24px to 28px at 680px+
- `.btn-full` becomes `.btn-full` centered with fixed width on desktop
- Quiz content padding adjusted for larger screens

---

*Convention analysis: 2026-04-06*
