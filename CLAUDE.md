<!-- GSD:project-start source:PROJECT.md -->
## Project

**Burnout Quiz — Infrastructure Upgrade**

A burnout assessment tool (Copenhagen Burnout Inventory) that serves as a lead generation funnel for Enzo's coaching practice. Visitors take a 13-question quiz, get personalized burnout analysis, and can book a discovery call. Currently a static HTML/CSS/JS site with n8n webhook integrations — being upgraded to Vercel + Neon PostgreSQL for proper data ownership and funnel visibility.

**Core Value:** Enzo can see every lead, their burnout scores, and where they are in the funnel — no more flying blind on conversion.

### Constraints

- **Stack**: Vercel (static + serverless API routes) + Neon PostgreSQL — no new services
- **Simplicity**: Keep HTML/CSS/JS static approach — don't migrate to Next.js
- **Timeline**: Ship fast — this feeds the coaching pipeline (North Star: 1500EUR/month)
- **Data**: All lead data must be owned (no third-party dependency for core data)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- HTML5 - All page structure (`index.html`, `resultats.html`, `appel.html`)
- CSS3 - All styling, inline and external (`style.css`)
- JavaScript (ES6+, vanilla) - UI logic, state management, API calls (`script.js`)
- None — pure frontend, no backend runtime required
## Runtime
- Browser only — no Node.js, no build pipeline, no compilation step
- Modern browser with ES6+ support required
- No server-side execution
- None installed locally
- No `package.json`, no lockfile
- No dependencies managed via npm or yarn
## Frameworks
- None — vanilla HTML/CSS/JavaScript
- CSS custom properties (CSS variables) for design tokens
- No CSS preprocessor (no Sass, Less, Postcss)
- No CSS-in-JS
- None — no test framework configured
- None — no build step
- Static file hosting only
- Files served as-is from browser (HTML → CSS → JS)
## Key Dependencies
- `marked.js` - Markdown-to-HTML parser for parsing Claude-generated analysis text
- `Inter` (weights 300, 400) - Primary font family
- Calendly widget (embedded iframe)
## Configuration
- No `.env` file in use
- All configuration hardcoded in source files:
- No build configuration files
- No bundler config (Webpack, Vite, Parcel, etc.)
- No transpiler config (Babel, SWC, etc.)
- Static HTML/CSS/JS served directly
- Git tracked (`.git` directory present)
- No semantic versioning scheme
## Platform Requirements
- Text editor or IDE (no specific requirement)
- Git for version control
- Web browser for preview
- Static file server optional (can open `index.html` directly in browser)
- Static file hosting (GitHub Pages, Vercel, Netlify, or any HTTP server)
- No server-side runtime required
- No database required
- CDN for external libraries (Google Fonts, jsDelivr, Calendly)
- ES6+ syntax requirement (arrow functions, template literals, const/let, destructuring)
- Assumes modern browsers (Chrome, Firefox, Safari, Edge from ~2018+)
- No polyfills or legacy browser support
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Lowercase, kebab-case for HTML files: `index.html`, `resultats.html`, `appel.html`
- Single stylesheet: `style.css`
- Single script: `script.js`
- No file type suffixes in names (no `.component.html`, `.utils.js`)
- camelCase: `ping()`, `calcScores()`, `getLevel()`, `getMirrorText()`, `renderQuestion()`, `onAnswer()`, `onQuizComplete()`, `renderTeaser()`, `sendWebhook()`, `showScreen()`, `getLevelClass()`, `render()`, `showError()`, `esc()`
- Action verbs as prefixes: `get*`, `render*`, `on*`, `show*`, `calc*`, `send*`, `strip*`
- Named functions preferred over anonymous (except in event listeners for brevity)
- camelCase for all variables: `state`, `screens`, `WEBHOOK_URL`, `PING_URL`, `QUESTIONS`, `SCALE`, `prenom`, `email`, `answering`, `submitted`
- SCREAMING_SNAKE_CASE for constants: `WEBHOOK_URL`, `PING_URL`, `QUESTIONS`, `SCALE`
- State object uses camelCase properties: `state.current`, `state.answers`, `state.scores`, `state.prenom`, `state.email`, `state.answering`, `state.submitted`
- DOM element IDs use kebab-case: `screen-intro`, `screen-quiz`, `screen-teaser`, `screen-confirm`, `btn-start`, `btn-back`, `progress-bar`, `question-counter`, `question-wrapper`, `question-text`, `answers`, `level-badge`, `dim-personal-fill`, `dim-work-fill`, `teaser-text`, `prenom-input`, `email-input`, `btn-submit-email`
- BEM methodology with strict kebab-case: `.screen`, `.screen.active`, `.screen.visible`, `.container`, `.intro-content`, `.intro-hook`, `.intro-body`, `.intro-what`, `.intro-what-label`, `.intro-list`, `.intro-meta`, `.btn-primary`, `.btn-back`
- State classes use `is-` prefix or direct state class: `.active`, `.visible`, `.selected`, `.locked`, `.disabled`
- Utility/layout classes: `.container`, `.section`, `.section-label`, `.level-badge`, `.dimensions`, `.dimension`, `.step`, `.steps`
- No underscore separators in class names—only kebab-case
- Double-dash prefix: `--bg`, `--text`, `--sub`, `--btn-idle`, `--btn-hover`, `--btn-sel`, `--btn-sel-t`, `--border`, `--accent`, `--bar-bg`
- Level colors use dash separators: `--level-green`, `--level-yellow`, `--level-orange`, `--level-red`
- Pattern: `--role-descriptor` (e.g., `--btn-idle`, `--level-orange`)
## Code Style
- No automated formatter configured. Manual consistency maintained.
- 2-space indentation throughout (HTML, CSS, JS)
- Line length: no hard limit, but lines typically stay under 100 characters
- No semicolons in CSS (common practice for modern CSS)
- Semicolons required in JavaScript
- No linter configured
- No `.eslintrc`, `.prettier`, or similar config files
- Code quality enforced by manual review and convention
- Blank lines between logical sections marked by comment dividers
- HTML comments use: `<!-- Screen 1: Intro -->` format
- CSS comments use: `/* ─── Reset & Base ─────────────────────────────────────────────────── */` format with decorative dashes
- JS comments use: `// ─── Config ──────────────────────────────────────────────────────────` format
- Single blank line between sections within functions
- No blank lines between property declarations in CSS rules
## Import Organization
- No import statements—all code is inline in single `script.js` file
- No module system (CommonJS, ES6 modules)
- External dependencies loaded via inline `<script>` tags: Calendly widget loaded in `appel.html`
- Order within `script.js`:
- Link order in `<head>`:
- Inline styles permitted only in `<style>` tags (used in `resultats.html` and `appel.html`)
- Scripts loaded at end of `<body>` before closing tag
- No CSS imports. Single stylesheet with all rules inline.
- Organization within `style.css`:
## Error Handling
- Email validation via regex on client side: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Form field error state shown by inline border color change: `borderColor = '#c0622a'` (orange error color)
- No error messages shown to user—just visual border highlight on invalid field
- Name input checked with `.trim()` for non-empty
- Prenom input focused on validation failure
- No error handling on webhook fetch calls—errors silently caught: `.catch(() => {})`
- User sees confirmation screen regardless of webhook success/failure
- Prevents retry loops and awkward error states for user
- No TypeScript. Plain JavaScript with loose typing.
- Null/undefined coalescing used in specific places: `state.answers[i] ?? 0`, `data.score_total = 0`
- XSS prevention via `esc()` function for user data output in `resultats.html`: replaces `&`, `<`, `>`, `"`
- State object mutated directly: `state.answering = true`, `state.answers[index] = value`
- No immutability patterns or defensive copies
- State is single source of truth for quiz progression
## Logging
- `ping()` function sends beacon events to tracking endpoint: `PING_URL`
- Events tracked: `'question_view'`, `'quiz_complete'`, `'email_submitted'`
- Uses `navigator.sendBeacon()` for non-blocking event delivery
- Payload includes event name, question number, total questions
- No console.log or debug output in production code
## Comments
- Comment blocks separate logical sections within files
- Each screen section in HTML commented: `<!-- Screen 1: Intro -->`
- Each code section in JS commented with decorative divider: `// ─── Quiz ─────────────────────────────────────────────────────`
- Inline comments rare—code structure and naming should be self-documenting
- Not used. No formal documentation strings.
- Complex functions (like `stripMd()` in `resultats.html`) explained with inline comments
- Example: `stripMd(str)` comment explains it strips Markdown formatting
- Question data commented with dimension mapping: `// dim P = personnel (Q1-6, max 24), W = travail (Q7-11, max 20), D = retrait (Q12-13, max 8)`
- Scale values documented inline in SCALE array structure
- No separate documentation file for data schemas
## Function Design
- Functions kept small and focused: typically 5-20 lines
- Longest function: `render()` in `resultats.html` (~50 lines, but mostly HTML string generation)
- Event handlers generally 10-15 lines
- Functions take minimal parameters
- Prefer reading from global `state` object over passing params: `sendWebhook()` reads `state.scores`, `state.prenom`, `state.email` directly
- Single parameter pattern: `showScreen(name)`, `onAnswer(index, value, btn)`
- No destructuring—all parameters used as-is
- Functions return primitives or objects, never undefined unless unnecessary
- `calcScores()` returns object: `{ personal, work, retrait, total }`
- `getLevel()` returns object: `{ label, cls, pct }`
- Helper functions return transformed data: `getLevelClass()` returns string class name
- Functions regularly perform DOM mutations and state changes
- No pure function enforcement—side effects are accepted pattern
- Example: `renderQuestion()` updates DOM, reads/modifies state, triggers animation
## Module Design
- No module system. All code in global scope.
- Functions accessed as globals: `ping()`, `calcScores()`, etc.
- No explicit export/import statements
- Not applicable—single file per function type
- All quiz logic in one `script.js` file (~270 lines)
- All styling in one `style.css` file (~516 lines)
- Each HTML page is self-contained with its own inline `<style>` and `<script>`
- Duplication across files accepted as trade-off for independence (e.g., CSS reset duplicated in each HTML file)
## Responsive Design
- Base styles target small screens (mobile)
- Breakpoints are explicit: `@media (min-width: 680px)`
- Font sizes increase on larger screens
- Layout adjustments (button width, padding) on desktop
- `.intro-hook` increases from 24px to 28px at 680px+
- `.btn-full` becomes `.btn-full` centered with fixed width on desktop
- Quiz content padding adjusted for larger screens
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Four sequential screens (intro → quiz → teaser → confirmation) managed by a single mutable state object
- Client-side quiz scoring engine with no backend processing of quiz logic
- Results delivered via URL-encoded base64 parameters to separate results page
- Webhook integration for funnel analytics and lead capture via n8n
- Separate single-page results and booking experiences with minimal coupling
## Layers
- Purpose: DOM rendering and user interface state visualization
- Location: `index.html`, `resultats.html`, `appel.html`
- Contains: HTML5 semantic structure, screen containers, form inputs, progress indicators, dimension bars
- Depends on: CSS via `style.css` (for index.html only; resultats.html and appel.html have inline styles), JavaScript via `script.js` (index.html only)
- Used by: Browser; internal cross-links between pages
- Purpose: Visual presentation, theming, responsive design, animations
- Location: `style.css` (global for index.html) + inline `<style>` blocks in `resultats.html` and `appel.html`
- Contains: CSS custom properties (design tokens), reset, screen transitions, button states, progress bars, dimension visualizations, level color coding
- Depends on: Google Fonts (Inter) via CDN, nothing else
- Used by: HTML pages for layout and visual polish
- Purpose: Quiz state management, scoring, screen navigation, data serialization, webhook submission
- Location: `script.js` (only loaded by index.html)
- Contains: State object, question/scale definitions, screen switching, answer tracking, score calculation, teaser rendering, email validation, webhook payload construction
- Depends on: navigator.sendBeacon (browser API for analytics), fetch (browser API for webhooks)
- Used by: index.html only
- Purpose: Server-side generated results display (data passed via URL parameter)
- Location: `resultats.html` — inline JavaScript at `<script>` tag (lines 274–423)
- Contains: URL parameter parsing, base64 decoding, data validation, HTML template rendering, progress bar animation triggering, HTML escaping for XSS prevention
- Depends on: URL query parameter `d` (base64url-encoded JSON), nothing else
- Used by: n8n webhook response (sends personalized email with resultats.html link containing base64'd data)
- Purpose: Discovery call landing page with embedded Calendly widget
- Location: `appel.html` — inline JavaScript at `<script>` tag (lines 207–233)
- Contains: Calendly widget initialization with prefill (email/name from URL params), booking confirmation listener, webhook to n8n for CRM flag updates
- Depends on: Calendly widget.js CDN, n8n webhook endpoint
- Used by: Outbound link from resultats.html with prefill params
## Data Flow
```javascript
```
## Key Abstractions
- Purpose: Manage visibility and transition between four distinct UX phases
- Examples: `screen-intro`, `screen-quiz`, `screen-teaser`, `screen-confirm` divs in `index.html` (lines 14–142)
- Pattern: Only one screen has `.active` + `.visible` classes at a time; CSS transitions opacity over 0.4s; `showScreen(name)` function controls all transitions
- Triggers screen-specific behaviors (e.g., progress bar hidden on intro/teaser, visible on quiz)
- Purpose: Organize 13 questions into three clinical dimensions (Copenhagen Burnout Inventory)
- Examples: Questions tagged `dim: "P"` (personal, Q1–6), `"W"` (work, Q7–11), `"D"` (withdrawal/detachment, Q12–13)
- Pattern: `calcScores()` iterates QUESTIONS, sums by dimension, enforces max per dimension (24, 20, 8)
- Purpose: Map total score to burnout severity tier and visual styling
- Examples: `getLevel(total)` returns `{ label, cls, pct }` — cls is one of `'green'`, `'yellow'`, `'orange'`, `'red'`
- Pattern: Score thresholds (0–16=green, 17–30=yellow, 31–44=orange, 45+–52=red) determine color and advisory text via `getMirrorText(level)`
- Purpose: Encode quiz results securely in URL parameter without exposing PII
- Examples: `resultats.html` decodes `d` parameter (lines 400–407)
- Pattern: JSON → UTF-8 bytes → standard base64 → base64url (replace `+` with `-`, `/` with `_`) → URL param; reverse on resultats page
- Purpose: Visual feedback for selected answer
- Examples: `.answer-btn` buttons in `screen-quiz` (lines 123–132 in script.js)
- Pattern: Hover state (lighter background), selected state (dark background + white text), transition 120ms for snappy feel
## Entry Points
- Location: `/Users/Enzo/burnout-quiz/index.html`
- Triggers: Direct navigation (quiz funnel entry) or backlink from resultats.html
- Responsibilities: 
- Location: `/Users/Enzo/burnout-quiz/resultats.html`
- Triggers: Email link from n8n containing `?d=[base64url]` parameter
- Responsibilities:
- Location: `/Users/Enzo/burnout-quiz/appel.html`
- Triggers: Link from resultats.html with `?e=[email]&p=[prenom]` params, or direct navigation
- Responsibilities:
## Error Handling
- **Quiz validation:** Form inputs checked before submission; invalid fields highlighted with orange border (`#c0622a`), field refocused. No submission allowed until fixed.
- **Email validation:** Regex check for basic email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); on error, field border turns orange.
- **Webhook failures:** `fetch()` catches errors silently (`.catch(() => {})` lines 253, 230). User sees confirmation screen regardless — no error message shown. If webhook fails, no email sent; user will not receive results link.
- **Results page data errors:** `resultats.html` checks for missing `d` param or invalid JSON; if absent/malformed, shows error state with link back to quiz (lines 382–389).
- **No alerts:** No `alert()` or modal dialogs; all validation is UX-integrated (field highlighting, inline validation messages where needed).
## Cross-Cutting Concerns
- `ping(event, question)` function sends navigator.sendBeacon to PING_URL (`https://enzo-os.vercel.app/api/quiz`)
- Events tracked: `'question_view'` (every question rendered), `'quiz_complete'` (on final answer), `'email_submitted'` (on email capture)
- Payload: `{ event, question, total: 13 }`
- No error handling; beacons fire asynchronously
- Client-side form validation only (no server-side revalidation)
- Email regex check; prenom required (non-empty trim)
- No CSRF protection; no rate limiting
- Data validation in resultats.html: presence of prenom + stade before rendering
- None. Quiz is anonymous; no user account system
- resultats.html data encapsulated in URL parameter (base64url-encoded JSON) — only someone with the email link can see their results
- appel.html assumes user who clicked resultats CTA link is the quiz taker (no verification)
- None on client side (no localStorage/sessionStorage)
- All persistence happens via n8n webhooks → Brevo CRM
- Each visit is stateless; navigating away from quiz clears all state
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
