# Codebase Structure

**Analysis Date:** 2026-04-06

## Directory Layout

```
burnout-quiz/
├── index.html            # Main quiz funnel (4 screens)
├── resultats.html        # Personalized results page
├── appel.html            # Calendly booking page
├── script.js             # Quiz logic, state management, webhooks (for index.html)
├── style.css             # Global styles for index.html only
└── .git/                 # Git repository metadata
```

**No subdirectories.** All HTML files are in root. No `src/`, `components/`, `public/`, `css/` directories — flat structure.

## Directory Purposes

**Project Root (`/Users/Enzo/burnout-quiz/`):**
- Purpose: Single-page app with three separate HTML experiences
- Contains: Entry point HTML files, JavaScript logic, CSS styling, git metadata
- Key files: `index.html` (quiz), `resultats.html` (results), `appel.html` (booking)

## Key File Locations

**Entry Points:**

- `index.html`: Quiz and teaser flow (intro → quiz → teaser → confirmation). 146 lines. Loads `script.js` and `style.css`.
- `resultats.html`: Personalized results (server-side rendered via n8n). 426 lines. Standalone with inline styles and inline JavaScript.
- `appel.html`: Discovery call booking page. 236 lines. Standalone with inline styles and inline JavaScript. Embeds Calendly widget.

**Configuration:**

- No config files. URLs hardcoded:
  - `WEBHOOK_URL = 'https://enzo-os.vercel.app/api/quiz'` (line 2 in `script.js`)
  - `PING_URL = 'https://enzo-os.vercel.app/api/quiz'` (line 3 in `script.js`)
  - Calendly URL: `https://calendly.com/contact-remidene-enzo/30min` (line 214 in `appel.html`)
  - n8n webhook: `https://n8n-production-2438.up.railway.app/webhook/calendly-booking` (line 223 in `appel.html`)

**Core Logic:**

- `script.js`: All quiz state, scoring, navigation, validation, webhook submission (lines 1–270). 270 lines total.
  - Lines 1–10: Config (WEBHOOK_URL, PING_URL, ping function)
  - Lines 14–36: Question bank (QUESTIONS array) and answer scale (SCALE)
  - Lines 39–47: State object
  - Lines 50–55: DOM refs (screens)
  - Lines 58–71: showScreen() helper (screen transitions)
  - Lines 73–82: calcScores() (dimension summing)
  - Lines 84–104: getLevel() and getMirrorText() (classification and advisory text)
  - Lines 107–155: Quiz rendering and answer handling
  - Lines 158–195: Teaser rendering with animated bars
  - Lines 198–227: Email capture and validation
  - Lines 229–254: sendWebhook() (POST with full answer payload)
  - Lines 257–270: Event listeners (start button, back button, init)

**Styling:**

- `style.css`: All CSS for index.html (11,407 bytes, 516 lines). Global styles applied to all screens.
  - Lines 1–30: Reset, base fonts, custom properties (colors, spacing)
  - Lines 31–46: Screen state classes (.screen, .screen.active, .screen.visible)
  - Lines 55–88: Intro screen styles
  - Lines 152–178: Button styles
  - Lines 180–196: Progress bar
  - Lines 198–288: Quiz screen and answer buttons
  - Lines 290–410: Teaser screen, level badge, dimensions, email capture
  - Lines 464–490: Confirmation screen
  - Lines 492–502: Level color utilities
  - Lines 503–515: Desktop media query (min-width: 680px)

- `resultats.html` (lines 10–268): Inline `<style>` block with light theme and results-specific styling. Colors differ from index.html (light background `#fafaf8`, dark text `#1c1c1c`).

- `appel.html` (lines 10–160): Inline `<style>` block with light theme, Calendly integration, steps layout, scroll hint animation.

**Testing:**

- No test files. No test framework. Manual testing only.

## Naming Conventions

**Files:**

- Lowercase, no hyphens: `index.html`, `resultats.html`, `appel.html`, `script.js`, `style.css`
- French-language filenames acceptable in this codebase (e.g., `resultats.html` not `results.html`)

**HTML IDs and Classes:**

- Kebab-case: `screen-intro`, `screen-quiz`, `screen-teaser`, `screen-confirm`, `btn-start`, `btn-back`, `btn-submit-email`, `btn-primary`, `question-wrapper`, `answer-btn`, `level-badge`, `dim-personal-fill`, etc.
- Screen IDs: `#screen-{name}` (line 14–142 in index.html)
- Button IDs: `#btn-{action}` (e.g., `#btn-start`, `#btn-back`, `#btn-submit-email`)
- Input IDs: `#{field}-input` (e.g., `#prenom-input`, `#email-input`)
- Utility classes: `.container`, `.btn-primary`, `.btn-back`, `.btn-full`, `.active`, `.selected`, `.visible`, `.locked`
- Level color classes: `.level-{color}`, `.fill-{color}` where color ∈ {green, yellow, orange, red}
- State classes: `.active`, `.visible`, `.selected`, `.locked`, `.disabled`

**JavaScript:**

- camelCase for variables and functions:
  - State object: `state` (line 39)
  - Screens ref: `screens` (line 50)
  - Functions: `showScreen()`, `calcScores()`, `getLevel()`, `getMirrorText()`, `renderQuestion()`, `onAnswer()`, `onQuizComplete()`, `renderTeaser()`, `sendWebhook()`, `ping()`
  - Question/scale data: `QUESTIONS`, `SCALE` (UPPERCASE for immutable data)
  - DOM nodes: `prenomInput`, `emailInput`, `btn`, etc.

- Event handlers: `btn-{action}.addEventListener('click', onAction)`

**CSS Custom Properties:**

- Pattern: `--{category}-{modifier}` where category ∈ {bg, text, sub, border, btn, bar, level}
- Examples:
  - Colors: `--bg`, `--text`, `--sub`, `--border`, `--accent`, `--bar-bg`
  - Button states: `--btn-idle`, `--btn-hover`, `--btn-sel`, `--btn-sel-t`
  - Level colors: `--level-green`, `--level-yellow`, `--level-orange`, `--level-red`

## Where to Add New Code

**New Quiz Question:**

- Add entry to QUESTIONS array in `script.js` (line 14–28)
- Format: `{ id: N, text: "...", dim: "P|W|D" }`
- Update dimension max values in `resultats.html` (lines 289–292) if changing dimension max scores

**New Screen (Feature):**

- Add HTML `<div id="screen-{name}" class="screen">` in `index.html` between lines 55–142
- Add to `screens` object in `script.js` (line 50–55)
- Implement `showScreen('{name}')` call in appropriate event handler
- Add CSS styles in `style.css` (after line 462, before media queries)

**New Button or Interactive Element:**

- Add HTML button with id `#btn-{action}` in appropriate screen div
- Add event listener in `script.js` init section (after line 256)
- Style in `style.css` — inherit from `.btn-primary` or `.btn-back` or create new class

**Email/API Integration Changes:**

- Update WEBHOOK_URL in `script.js` (line 2) if changing quiz webhook endpoint
- Update PING_URL in `script.js` (line 3) if changing analytics endpoint
- Update Calendly URL in `appel.html` (line 214) if changing calendar or account
- Update n8n webhook in `appel.html` (line 223) if changing booking notification

**Styling Changes:**

- Index.html (quiz flow): Edit `style.css` directly; affects all screens
- resultats.html: Edit inline `<style>` block (lines 10–268)
- appel.html: Edit inline `<style>` block (lines 10–160)
- Global colors/tokens: Edit `:root` in `style.css` (lines 4–20)

## Special Directories

**None.** Project has no special directories — no build artifacts, no generated files, no vendor directories.

**What's in `.git/`:**
- Standard git metadata; ignore for code changes

## File Dependencies

**index.html** depends on:
- `script.js` (loaded at line 144)
- `style.css` (linked at line 9)
- Google Fonts CDN (Inter, weights 300 + 400)

**resultats.html** depends on:
- Google Fonts CDN (Inter)
- No external JavaScript (inline at lines 274–423)

**appel.html** depends on:
- Google Fonts CDN (Inter)
- Calendly widget.js CDN (`https://assets.calendly.com/assets/external/widget.js`, line 206)
- No other dependencies

**script.js** depends on:
- Browser APIs: `fetch()`, `navigator.sendBeacon()`, DOM APIs
- No external libraries

## Build and Deployment

**No build step.** Project is pure HTML/CSS/JS — served as-is.

- Development: Open `index.html` in browser from filesystem or via simple HTTP server
- Production: Deploy files to static host (GitHub Pages, Vercel, Netlify, etc.)
- Deploy all 5 files: `index.html`, `resultats.html`, `appel.html`, `script.js`, `style.css`

