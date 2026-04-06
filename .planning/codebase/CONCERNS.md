# Codebase Concerns

**Analysis Date:** 2026-04-06

## Error Handling & Network Resilience

**Silent webhook failures:**
- Issue: `sendWebhook()` in `script.js` line 249-253 silently swallows all fetch errors with `.catch(() => {})`
- Files: `script.js` (line 249-253)
- Impact: User sees confirmation screen even if data never reaches backend. Leads to lost leads, no analysis email sent, broken funnel
- Fix approach: Implement retry logic with exponential backoff; show user error state if webhook fails after 3 attempts; fall back to alternative notification (localStorage, re-prompt form)

**Beacon vs Fetch race condition:**
- Issue: `ping()` function (line 5-10) uses `navigator.sendBeacon()` for analytics, but quiz completion data goes via fetch. If page unloads during quiz, beacon fires but webhook may not
- Files: `script.js` (lines 5-10, 224, 249-253)
- Impact: Analytics show quiz completion but lead never entered pipeline; ghost leads in funnel
- Fix approach: Use sendBeacon for webhook payload instead of fetch; or ensure fetch completes before page transition

**No network timeout handling:**
- Issue: fetch in `sendWebhook()` has no timeout. Slow network hangs user on confirmation screen indefinitely
- Files: `script.js` (line 249-253)
- Impact: User experience breaks on poor networks; never knows if submission worked
- Fix approach: Add AbortController with 5-10 second timeout; implement timeout feedback

## Email Validation & Data Quality

**Insufficient email validation:**
- Issue: Line 211 in `script.js` uses simple regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` which allows technically invalid emails (e.g., `a@b.c`, no TLD length check)
- Files: `script.js` (line 211)
- Impact: Invalid emails reach backend; bounce-backs; polluted lead database; deliverability issues
- Fix approach: Use RFC 5322 regex or server-side validation; add +1 check (email must have >1 char before @)

**No firstName trimming validation:**
- Issue: `prenom` field (line 201) only checks for empty string after trim, allows spaces-only input that passes
- Files: `script.js` (lines 199-209)
- Impact: Users enter names like `"   "` or `"."`, polluting CRM data
- Fix approach: Add `/\S/` regex check to ensure at least one non-whitespace character exists

**No duplicate submission prevention:**
- Issue: `state.submitted` flag (line 218-219) only prevents double-clicking button, but doesn't prevent re-submitting via browser dev tools or form replay
- Files: `script.js` (lines 218-219, 198-227)
- Impact: Same user can submit multiple times; duplicate leads in Brevo; inflated analytics
- Fix approach: Lock button immediately after first click with visual feedback; use timestamp+nonce in payload for server-side dedup

## Session & State Management

**No session persistence:**
- Issue: All quiz progress stored in volatile `state` object (line 39-47). If user closes tab mid-quiz, all answers lost
- Files: `script.js` (lines 39-47)
- Impact: Poor UX for users on slow networks or with interruptions; abandonment
- Fix approach: Save answers to localStorage after each question; load on page return; implement "resume quiz" flow

**State can be manipulated in browser console:**
- Issue: Global `state` object is directly accessible; user can modify scores, answers, email before submission
- Files: `script.js` (lines 39-47)
- Impact: Users can fake scores; gaming analytics; fake leads with modified data
- Fix approach: Calculate scores server-side from answer array; never trust client scores; validate answer values are 0-4

**Shared state across page reloads:**
- Issue: Inline scripts in `resultats.html` and `appel.html` decode data from URL params but don't validate origin or CSRF
- Files: `resultats.html` (lines 399-422), `appel.html` (lines 209-231)
- Impact: Anyone with a result URL can share it; data exposure; no user binding
- Fix approach: Add timestamp+signature to data payload; validate CSRF tokens; require email verification before viewing full results

## Security & Data Exposure

**Hardcoded webhook URLs exposed in client:**
- Issue: `WEBHOOK_URL` and `PING_URL` hardcoded in `script.js` line 2-3
- Files: `script.js` (lines 2-3)
- Impact: Anyone reading page source sees internal API endpoints; potential for direct exploitation; abuse of webhook
- Fix approach: Proxy webhook calls through same domain; use form submission instead of fetch; move URLs to server config

**Base64 decode without validation:**
- Issue: `resultats.html` line 405-407 decodes base64url data but doesn't validate data size, preventing zip-bomb-style attacks
- Files: `resultats.html` (lines 405-407)
- Impact: Potential for DoS via oversized payload
- Fix approach: Add max size check before decode (e.g., 10KB limit); validate JSON schema after decode

**XSS vulnerability in result rendering:**
- Issue: `esc()` function in `resultats.html` line 391-397 manually escapes HTML, but `stripMd()` line 294-301 uses regex replacement that could miss edge cases; direct `innerHTML` assignment (line 311)
- Files: `resultats.html` (lines 311, 391-397, 294-301)
- Impact: Attacker can inject malicious HTML/JS via `analyse` or `actionLongue` fields if backend is compromised
- Fix approach: Use `textContent` for plain text; use DOMParser or template literals for safe HTML; use a proper markdown parser library

**Email address leakage via query params:**
- Issue: `appel.html` line 210-211 reads email from URL params and logs to Calendly embed; email visible in browser history
- Files: `appel.html` (lines 210-211, 214-216)
- Impact: Email exposed in browser history, shared URLs, server logs, and Calendly tracking
- Fix approach: Pass email via POST to backend; use session storage; don't embed in URLs

**No HTTPS enforcement:**
- Issue: No meta tag, CSP, or script checks to enforce HTTPS; quiz collects PII over potentially unencrypted connection
- Files: All HTML files
- Impact: MITM attacks possible; PII (email, first name, burnout scores) interceptable
- Fix approach: Add Strict-Transport-Security header server-side; add content-security-policy; validate all external resources are HTTPS

## Form UX & Accessibility

**No form submission feedback:**
- Issue: Submit button (line 125 in `index.html`, line 198 in `script.js`) has no loading state, spinner, or error message
- Files: `index.html` (line 125), `script.js` (lines 198-227)
- Impact: User sees confirmation screen even if network is slow; no feedback on what's happening; appears broken on poor networks
- Fix approach: Show loading state on button; disable button; display error message if webhook fails

**Inline border-color manipulation instead of CSS classes:**
- Issue: Form validation errors set `borderColor` directly (lines 205, 209, 212, 216 in `script.js`)
- Files: `script.js` (lines 205-216)
- Impact: Breaks if CSS variable names change; hard to maintain; no animation/transition on error state
- Fix approach: Add/remove error CSS class (`input.classList.add('error')`); define error styling in style.css

**No autocomplete hints on inputs:**
- Issue: `prenom-input` (line 123 in `index.html`) has `autocomplete="given-name"` but appears to be input, not semantic form
- Files: `index.html` (lines 118-128)
- Impact: Password managers and autofill services may not work correctly
- Fix approach: Wrap inputs in `<form>` element; move to semantic form structure; ensure proper field semantics

**No focus management between screens:**
- Issue: `showScreen()` (line 58 in `script.js`) changes screens but doesn't set focus; Tab key navigation broken between screens
- Files: `script.js` (lines 58-71)
- Impact: Keyboard-only users can't navigate; screen reader users lose context
- Fix approach: Set `focus()` on first interactive element in new screen; manage focus trap for teaser screen

**Progress bar accessibility:**
- Issue: Progress bar (line 69 in `index.html`) has no `aria-label` or `role="progressbar"`; screen readers see it as visual decoration only
- Files: `index.html` (lines 59-61), `style.css` (lines 181-189)
- Impact: Screen reader users don't know their progress
- Fix approach: Add `role="progressbar" aria-valuenow aria-valuemin="0" aria-valuemax="100"` to progress element

## Performance & Animation

**Animation triggering page reflow:**
- Issue: `renderQuestion()` line 115-117 in `script.js` forces reflow via `offsetHeight` to trigger animation, but does this every question
- Files: `script.js` (lines 107-136)
- Impact: Janky animation on slower devices; unnecessary reflow; battery drain
- Fix approach: Use CSS `animation-play-state: paused/running` or data attributes instead of inline style manipulation

**Progress bar transition on every question:**
- Issue: Progress bar width transition (line 195 in `style.css`) is 0.4s, but question animation is 0.3s (line 223); misaligned timing creates visual stutter
- Files: `script.js` (line 110-111), `style.css` (lines 195, 223)
- Impact: Feels janky; distracting animation
- Fix approach: Sync both to 0.3s; consider whether progress bar needs animation at all

**Beacons block page unload:**
- Issue: `ping()` sends beacon on every question, but doesn't guarantee delivery before unload
- Files: `script.js` (line 135)
- Impact: Poor analytics data; funnel incomplete
- Fix approach: Use beacon for page-unload analytics only; use fetch for question events

## Data Validation & Scoring

**Answer array can have gaps:**
- Issue: `state.answers` (line 41 in `script.js`) initialized as empty array, questions can be skipped, leaving `undefined` in array
- Files: `script.js` (lines 76, 144)
- Impact: Scoring logic uses `?? 0` default (line 76), so unanswered questions count as 0. User can submit incomplete quiz
- Fix approach: Require all questions answered before submission; disable submit button until complete; validate `answers.length === QUESTIONS.length`

**Score calculation vulnerable to array mutation:**
- Issue: `calcScores()` iterates `state.answers` by index, but doesn't validate each value is 0-4
- Files: `script.js` (lines 73-82)
- Impact: Malicious user can inject non-numeric values; scoring breaks
- Fix approach: Validate each answer: `if (typeof val !== 'number' || val < 0 || val > 4) val = 0`

**Level thresholds are arbitrary:**
- Issue: Level thresholds (lines 85-88 in `script.js`) for 52-point scale don't clearly relate to CBI scoring rules
- Files: `script.js` (lines 84-89)
- Impact: Threshold percentages may not match published CBI research; inaccurate diagnosis
- Fix approach: Document threshold source (CBI research paper); add comments with percentile equivalents

## Cross-Domain & Third-Party

**Calendly calendar hidden by CSS blur:**
- Issue: `resultats.html` line 108 shows `locked-fill` with `filter: blur(2px)` to hide third score, but this is purely visual
- Files: `resultats.html` (line 108), `style.css` (line 388)
- Impact: User can inspect element or screenshot before blur; score not actually locked
- Fix approach: Don't render locked bar at all; use server-side gating to decide what to show

**Calendly integration has no error handling:**
- Issue: `appel.html` line 206-207 loads Calendly widget from CDN with no fallback if load fails
- Files: `appel.html` (lines 206-207)
- Impact: If Calendly CDN down, user sees blank calendar; no booking possible
- Fix approach: Load event listener for script error; show fallback CTA (email booking button)

**n8n webhook hardcoded:**
- Issue: `appel.html` line 223 calls n8n webhook directly from client; URL hardcoded and exposed
- Files: `appel.html` (lines 222-230)
- Impact: Anyone can trigger this webhook; no authentication; abuse vector
- Fix approach: Move to Calendly webhook integration; proxy through your domain with auth token

**External CSS fonts loading from CDN:**
- Issue: All pages load Inter from Google Fonts CDN; if CDN down, font not loaded
- Files: All HTML files (link rel=preconnect to fonts.googleapis.com)
- Impact: Fallback to system font if Google down; visual regression; no fallback-display strategy
- Fix approach: Add `display=swap` parameter (already present); consider self-hosting font files

## Multi-Page State Consistency

**Result data encoded in URL without expiry:**
- Issue: `resultats.html` decodes base64 from `?d=` param (line 401) with no timestamp or expiration
- Files: `resultats.html` (lines 401-407)
- Impact: Links are permanent; user can share results with anyone; no time-limited access
- Fix approach: Add `exp` field to data; validate timestamp on decode; expire links after 7 days

**No server-side session binding:**
- Issue: Result page only validates base64 decode and presence of fields, doesn't tie results to user session or email
- Files: `resultats.html` (lines 399-422)
- Impact: Anyone with result URL can view; no privacy; could be exposed in logs, caches, proxies
- Fix approach: Generate unique token; store encrypted data on backend; require email or token to view

**Appel page email passing via URL:**
- Issue: `appel.html` receives email via `?e=` param (line 210), no HTTPS validation
- Files: `appel.html` (lines 209-216)
- Impact: Email exposed in referrer header to Calendly; visible in browser history; shared in Slack/email
- Fix approach: Use sessionStorage after redirect; pass via POST; don't include PII in URLs

## Browser Compatibility & Fallbacks

**No fallback for missing TextDecoder:**
- Issue: `resultats.html` line 407 uses `TextDecoder` API which is not available in older browsers
- Files: `resultats.html` (line 407)
- Impact: IE11, older mobile browsers fail silently
- Fix approach: Add polyfill or use `String.fromCharCode()` for compatibility

**CSS Grid/Flexbox unsupported in IE11:**
- Issue: All CSS uses flexbox and grid without fallback; no `@supports` checks
- Files: `style.css`
- Impact: IE11 users see broken layouts
- Fix approach: Add non-flex fallback; use `@supports (display: flex)` checks

**No graceful degradation for `requestAnimationFrame`:**
- Issue: `showScreen()` line 66-68 and `renderTeaser()` line 372-378 use double rAF without fallback
- Files: `script.js` (lines 66-68, 372-378)
- Impact: Older browsers may not have rAF; animation timing unpredictable
- Fix approach: Use `setTimeout(fn, 0)` as fallback; or just use CSS animations

## Data Persistence & Recovery

**No quiz recovery after crash:**
- Issue: Quiz data in volatile `state` object; browser crash, force reload, or accidental tab close = all progress lost
- Files: `script.js` (lines 39-47)
- Impact: User must restart quiz; abandonment; poor UX
- Fix approach: Auto-save answers to localStorage after each question; restore on page load with "continue" prompt

**No mechanism to retry failed submissions:**
- Issue: Once submit button clicked and webhook fails silently, no way to retry; user sees confirmation but data never sent
- Files: `script.js` (lines 198-227, 249-253)
- Impact: Ghost leads; users think data sent but backend never received it
- Fix approach: Queue submission; show "retrying" state; allow manual retry button on error

## Analytics & Funnel

**Funnel leakage not visible:**
- Issue: `ping()` function logs events but doesn't log failures; no way to know if users drop between screens
- Files: `script.js` (lines 5-10)
- Impact: Can't measure drop-off rates; don't know if quiz completion is real or ghost data
- Fix approach: Log screen exits; log form validation errors; log webhook failures; create dashboard with funnel metrics

**Quiz abandonment not tracked:**
- Issue: If user clicks away or closes tab during quiz, no event fires to track abandonment
- Files: `script.js`
- Impact: No visibility into when/where users leave
- Fix approach: Add `beforeunload` listener; fire abandonment event with current question index

**No UTM parameter handling:**
- Issue: Quiz doesn't read or pass through campaign/source parameters
- Files: `script.js`, `index.html`
- Impact: Can't attribute leads to traffic source; dark funnel
- Fix approach: Parse UTM params from URL; include in webhook payload; pass to resultats.html and Calendly

## Testing & Reliability

**No test coverage:**
- Issue: No unit tests for scoring logic, validation, form handling
- Files: All JavaScript
- Impact: Changes to CBI thresholds, validation rules, or scoring could break silently
- Fix approach: Add Jest/Vitest tests for `calcScores()`, `getLevel()`, email regex validation

**No error boundary or exception handling:**
- Issue: If any script throws error, app breaks completely; no try-catch around critical paths
- Files: All JavaScript, especially `resultats.html` lines 399-422
- Impact: One broken data payload breaks entire results page; no user feedback
- Fix approach: Wrap all data decoding in try-catch; show error state instead of blank page

**No type checking:**
- Issue: No TypeScript; payload data from backend assumed correct shape
- Files: All JavaScript
- Impact: If backend changes schema, frontend breaks; no compile-time safety
- Fix approach: Use JSDoc type hints; add runtime schema validation (zod/yup); migrate to TypeScript

## Scaling & Maintenance

**Hardcoded question data not modifiable:**
- Issue: Questions embedded in `QUESTIONS` array in `script.js` line 14-28; changing requires code deploy
- Files: `script.js` (lines 14-28)
- Impact: Can't A/B test questions; can't fix wording without deploy; no admin interface
- Fix approach: Fetch questions from backend API; implement question editor

**Scale thresholds and text hardcoded:**
- Issue: `getLevel()` thresholds and `getMirrorText()` responses hardcoded in `script.js` lines 84-104
- Files: `script.js` (lines 84-104)
- Impact: Changing language, thresholds, or messaging requires code change
- Fix approach: Move to JSON config file or backend API

**Styling duplicated across pages:**
- Issue: `resultats.html` and `appel.html` have inline CSS; `style.css` used only in `index.html`; colors and typography duplicated
- Files: `index.html` links `style.css`, but `resultats.html` and `appel.html` have inline `<style>` blocks
- Impact: Style changes must be made in 3 places; consistency hard to maintain
- Fix approach: Share common stylesheet; extract colors and typography to CSS variables; use single `style.css` everywhere

## Mobile & Responsive

**Touch targets too small for some elements:**
- Issue: Progress bar is 4px high (line 183 in `style.css`); step numbers in `appel.html` are 10px font with 18px min-width
- Files: `style.css` (line 183), `appel.html` (lines 93-98)
- Impact: Hard to interact on mobile; accessibility issue
- Fix approach: Ensure all interactive elements are min 44x44px; progress bar can be visual-only

**No viewport scaling on mobile:**
- Issue: `viewport` meta set correctly, but no test on small screens documented
- Files: All HTML files (meta viewport present)
- Impact: Unknown mobile behavior; might have rendering issues on phones
- Fix approach: Add mobile breakpoint testing checklist; test on devices

---

*Concerns audit: 2026-04-06*
