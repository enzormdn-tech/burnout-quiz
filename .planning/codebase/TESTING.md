# Testing Patterns

**Analysis Date:** 2026-04-06

## Test Framework

**Runner:**
- No test framework configured
- No test files present in codebase
- No `package.json` or Node.js tooling

**Assertion Library:**
- Not applicable

**Run Commands:**
- Not applicable — no automated test runner available

## Test Coverage

**Current State:**
- Zero test coverage
- No unit tests
- No integration tests
- No end-to-end tests

**Testing Approach:**
- Manual testing only
- Code quality relies on code review and convention enforcement
- No automated validation

## Quality Assurance Without Tests

**Manual Verification Patterns:**

The codebase relies on several patterns to ensure quality without automated tests:

1. **State Management Verification:**
   - `state` object in `script.js` is single source of truth
   - State transitions are synchronous and predictable
   - Example: Quiz progression tracked via `state.current` (lines 40-41 in `script.js`)
   - Answer storage via `state.answers[index] = value` (line 144)

2. **Screen Transition Testing:**
   - `showScreen()` function (lines 58-71) controls all screen visibility
   - Only one screen has `.active` class at a time
   - CSS display toggles prevent visual overlaps: `display: none` → `display: flex` (lines 32-43 in `style.css`)
   - Animation via `requestAnimationFrame()` double-call ensures smooth transitions (lines 66-68)

3. **Data Validation:**
   - Email validation via regex pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (line 211 in `script.js`)
   - Visual feedback on validation failure: `borderColor = '#c0622a'` (orange highlight)
   - Empty prenom check via `.trim()` to prevent whitespace-only submission
   - Field focus on error helps user correct input

4. **Scoring Calculation:**
   - `calcScores()` function (lines 73-82) groups answers by dimension using `q.dim` property
   - Hardcoded max values: Personal 24, Work 20, Retrait 8 (total 52)
   - Score boundaries define levels in `getLevel()` (lines 84-89): ≤16 (green), ≤30 (yellow), ≤44 (orange), else red
   - Test manually by answering all questions with same value and verifying totals

5. **Event Tracking:**
   - `ping()` function (lines 5-10) sends beacons for each question view, quiz completion, email submission
   - Uses `navigator.sendBeacon()` which doesn't require response handling
   - Fallback check: `if (navigator.sendBeacon)` prevents errors in unsupported browsers

## Browser Compatibility Testing

**Manual Test Checklist:**
- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile devices (iPhone, Android)
- Form validation and focus states
- CSS animations on low-motion devices (`@media (prefers-reduced-motion: reduce)`)
- Font loading from Google Fonts CDN
- Calendly widget embedding in `appel.html`

## Code Safety Patterns

**XSS Prevention:**
- `esc()` function in `resultats.html` (lines 391-397) escapes user input before rendering
- Escapes: `&`, `<`, `>`, `"`
- Applied to: `prenom`, `stade`, `score_*` values when rendering HTML
- Example usage: `${esc(prenom)}` (line 315)

**Data Integrity:**
- Form inputs cleared after submission via `state.submitted` flag (line 219)
- Prevents duplicate submissions
- Webhook URL hardcoded, no injection risk
- Question order immutable (array accessed, not mutated)

**Type Coercion:**
- Nullish coalescing used to provide defaults: `state.answers[i] ?? 0` (lines 76, 244)
- Ensures numeric 0 returned for missing answers, not undefined
- String coercion in scale lookup: `SCALE.find(s => s.value === ...) ?? 'Jamais'` (line 244)

## Instrumentation for Debugging

**Beacon Events Sent:**
- `ping('question_view', index + 1)` on line 135 — when user views each question
- `ping('quiz_complete', QUESTIONS.length)` on line 160 — when quiz completes
- `ping('email_submitted', QUESTIONS.length)` on line 224 — when email captured
- Events logged server-side at `PING_URL = 'https://enzo-os.vercel.app/api/quiz'`
- Server-side analytics provide visibility into user flow and drop-off points

**Webhook Payload Inspection:**
- `sendWebhook()` (lines 229-254) sends full quiz data including all answers
- Payload structure includes: prenom, email, all score dimensions, stade, full answer array
- Each answer includes: bloc (dimension), question text, response label, numeric value
- Can inspect n8n webhook handler to verify payload shape

**Browser DevTools Verification:**
- Network tab: inspect beacon calls and webhook POST requests
- Console: no errors logged by design (silent catch blocks)
- Elements: inspect CSS variables and class state changes
- Performance: animations smooth without jank

## Data Flow Testing

**Quiz Flow:**
1. User starts on `screen-intro` with "Commencer" button (line 14 in `index.html`)
2. Button click triggers `showScreen('quiz')` (line 257-259 in `script.js`)
3. `renderQuestion(0)` displays first question (line 107-136)
4. User selects answer → `onAnswer()` called (line 138-155)
5. State updated: `state.answers[index] = value`
6. After 350ms delay, next question rendered or `onQuizComplete()` triggered
7. On completion: `renderTeaser()` calculates scores and displays results (lines 165-195)
8. User enters email/prenom, clicks submit (lines 198-227)
9. `sendWebhook()` POST to n8n (lines 229-254)
10. `showScreen('confirm')` displays confirmation message

**Results Page Flow (`resultats.html`):**
1. Page expects base64url-encoded data in `?d=` query param (line 400)
2. Script decodes: `atob()` then `TextDecoder` (lines 404-407)
3. Validates: `prenom` and `stade` present (line 409)
4. `render(data)` generates HTML with scores and analysis (lines 282-380)
5. Bars animate after 80ms delay (line 378)
6. Email/prenom passed to booking link via `encodeURIComponent()` (line 417)

**Booking Page Flow (`appel.html`):**
1. Page reads email/prenom from URL params `?e=` and `?p=` (lines 209-211)
2. Calendly widget initialized with prefilled email/name (lines 214-218)
3. `window.addEventListener('message')` listens for Calendly booking confirmation (line 221)
4. On booking: POST to n8n webhook to sync to Brevo (lines 223-231)

## What's Not Tested (Risk Areas)

**High Risk:**
- Base64 encoding/decoding edge cases in `resultats.html` (lines 404-407)
  - Malformed base64 could crash with `atob()` error
  - Invalid UTF-8 byte sequences could fail `TextDecoder`
  - No try-catch around decoding (wrapped in outer try-catch line 399)

- Webhook failure handling in `sendWebhook()` (line 253: `.catch(() => {})`)
  - User sees confirmation regardless of webhook success
  - No retry logic—missed submissions not recovered
  - Silent failure makes debugging n8n issues difficult

- CSS animation performance on low-end devices
  - Multiple `transition` properties on bars, fills, text (e.g., line 195, 327, 375)
  - No reduced-motion sensitivity on animation delays (e.g., 350ms on line 146, 80ms on line 378)

**Medium Risk:**
- Email regex validation incomplete
  - Pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` allows single-char TLDs and subdomains
  - No DNS validation or bounce checking
  - Examples that pass but are questionable: `a@b.c`, `test@domain.c`

- Answer array bounds
  - If user manually edits URL state or manipulates DOM, could answer questions out of order
  - `state.answers` stores answers by index; no validation that all required answers present
  - `calcScores()` assumes answer at index, uses `?? 0` fallback

- Google Fonts CDN reliability
  - Preconnect links (lines 7-8 in `index.html`) depend on CDN availability
  - No fallback font-stack if Google Fonts fails
  - Font loading not explicitly monitored

**Low Risk:**
- `navigator.sendBeacon()` support
  - Checked with `if (navigator.sendBeacon)` (line 7)
  - Fallback: event not sent, but doesn't break app
  - Affects analytics only

- Calendly widget embedding (`appel.html`)
  - External dependency on Calendly CDN
  - Widget loads asynchronously, could be slow on poor connections
  - No visual loading indicator or fallback UI

---

*Testing analysis: 2026-04-06*
