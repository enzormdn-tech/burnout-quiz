# Architecture

**Analysis Date:** 2026-04-06

## Pattern Overview

**Overall:** Single-Page Application (SPA) with multi-screen state machine

**Key Characteristics:**
- Four sequential screens (intro → quiz → teaser → confirmation) managed by a single mutable state object
- Client-side quiz scoring engine with no backend processing of quiz logic
- Results delivered via URL-encoded base64 parameters to separate results page
- Webhook integration for funnel analytics and lead capture via n8n
- Separate single-page results and booking experiences with minimal coupling

## Layers

**Presentation Layer:**
- Purpose: DOM rendering and user interface state visualization
- Location: `index.html`, `resultats.html`, `appel.html`
- Contains: HTML5 semantic structure, screen containers, form inputs, progress indicators, dimension bars
- Depends on: CSS via `style.css` (for index.html only; resultats.html and appel.html have inline styles), JavaScript via `script.js` (index.html only)
- Used by: Browser; internal cross-links between pages

**Styling Layer:**
- Purpose: Visual presentation, theming, responsive design, animations
- Location: `style.css` (global for index.html) + inline `<style>` blocks in `resultats.html` and `appel.html`
- Contains: CSS custom properties (design tokens), reset, screen transitions, button states, progress bars, dimension visualizations, level color coding
- Depends on: Google Fonts (Inter) via CDN, nothing else
- Used by: HTML pages for layout and visual polish

**Logic Layer:**
- Purpose: Quiz state management, scoring, screen navigation, data serialization, webhook submission
- Location: `script.js` (only loaded by index.html)
- Contains: State object, question/scale definitions, screen switching, answer tracking, score calculation, teaser rendering, email validation, webhook payload construction
- Depends on: navigator.sendBeacon (browser API for analytics), fetch (browser API for webhooks)
- Used by: index.html only

**Results Layer:**
- Purpose: Server-side generated results display (data passed via URL parameter)
- Location: `resultats.html` — inline JavaScript at `<script>` tag (lines 274–423)
- Contains: URL parameter parsing, base64 decoding, data validation, HTML template rendering, progress bar animation triggering, HTML escaping for XSS prevention
- Depends on: URL query parameter `d` (base64url-encoded JSON), nothing else
- Used by: n8n webhook response (sends personalized email with resultats.html link containing base64'd data)

**Booking Layer:**
- Purpose: Discovery call landing page with embedded Calendly widget
- Location: `appel.html` — inline JavaScript at `<script>` tag (lines 207–233)
- Contains: Calendly widget initialization with prefill (email/name from URL params), booking confirmation listener, webhook to n8n for CRM flag updates
- Depends on: Calendly widget.js CDN, n8n webhook endpoint
- Used by: Outbound link from resultats.html with prefill params

## Data Flow

**Quiz Completion Flow:**

1. User answers 13 questions via `script.js` click handlers → state.answers array updated
2. On final answer, `onQuizComplete()` called
3. `calcScores()` sums answers by dimension (P/W/D) → scores object
4. `renderTeaser()` displays:
   - Overall burnout level (4 colors: green/yellow/orange/red based on total score)
   - Two visible dimension bars (personal + work)
   - Third dimension (retrait) locked, teased as "Disponible dans l'analyse complète"
   - Mirror text reflecting user's level (empathetic, honest self-reflection)
5. User enters prenom + email
6. `sendWebhook()` POSTs to WEBHOOK_URL (`https://enzo-os.vercel.app/api/quiz`)
7. n8n processes webhook: generates Claude analysis + action, encodes results as base64url, sends email with link to `resultats.html?d=[base64url]`
8. User clicks email link → `resultats.html` loads, decodes base64, renders full results + CTA to `appel.html`
9. User books call via Calendly → postMessage event triggers second webhook to mark `APPEL_BOOK = true` in Brevo

**State Management:**

```javascript
const state = {
  current:     0,           // Current question index (0–12)
  answers:     [],          // Array of 13 score values (0–4)
  scores:      null,        // { personal, work, retrait, total } computed on quiz completion
  prenom:      '',          // User's first name (from email capture)
  email:       '',          // User's email (from email capture)
  answering:   false,       // Debounce flag during answer animation
  submitted:   false,       // Debounce flag during webhook send
}
```

## Key Abstractions

**Screen State Machine:**
- Purpose: Manage visibility and transition between four distinct UX phases
- Examples: `screen-intro`, `screen-quiz`, `screen-teaser`, `screen-confirm` divs in `index.html` (lines 14–142)
- Pattern: Only one screen has `.active` + `.visible` classes at a time; CSS transitions opacity over 0.4s; `showScreen(name)` function controls all transitions
- Triggers screen-specific behaviors (e.g., progress bar hidden on intro/teaser, visible on quiz)

**CBI Dimension Grouping:**
- Purpose: Organize 13 questions into three clinical dimensions (Copenhagen Burnout Inventory)
- Examples: Questions tagged `dim: "P"` (personal, Q1–6), `"W"` (work, Q7–11), `"D"` (withdrawal/detachment, Q12–13)
- Pattern: `calcScores()` iterates QUESTIONS, sums by dimension, enforces max per dimension (24, 20, 8)

**Level Classification:**
- Purpose: Map total score to burnout severity tier and visual styling
- Examples: `getLevel(total)` returns `{ label, cls, pct }` — cls is one of `'green'`, `'yellow'`, `'orange'`, `'red'`
- Pattern: Score thresholds (0–16=green, 17–30=yellow, 31–44=orange, 45+–52=red) determine color and advisory text via `getMirrorText(level)`

**Base64url Data Serialization:**
- Purpose: Encode quiz results securely in URL parameter without exposing PII
- Examples: `resultats.html` decodes `d` parameter (lines 400–407)
- Pattern: JSON → UTF-8 bytes → standard base64 → base64url (replace `+` with `-`, `/` with `_`) → URL param; reverse on resultats page

**Answer Button State:**
- Purpose: Visual feedback for selected answer
- Examples: `.answer-btn` buttons in `screen-quiz` (lines 123–132 in script.js)
- Pattern: Hover state (lighter background), selected state (dark background + white text), transition 120ms for snappy feel

## Entry Points

**index.html (Main Quiz):**
- Location: `/Users/Enzo/burnout-quiz/index.html`
- Triggers: Direct navigation (quiz funnel entry) or backlink from resultats.html
- Responsibilities: 
  - Display intro with CBI explanation and expected outcomes
  - Run 13-question quiz with animated transitions
  - Compute scores and render teaser with partial results
  - Capture email + prenom, validate inputs
  - POST to webhook with full answer payload
  - Show confirmation screen

**resultats.html (Full Results):**
- Location: `/Users/Enzo/burnout-quiz/resultats.html`
- Triggers: Email link from n8n containing `?d=[base64url]` parameter
- Responsibilities:
  - Parse and validate base64url data from URL
  - Render personalized greeting (first name)
  - Display full 3-dimension scoring with animated bar fills
  - Show Claude-generated analysis text (markdown stripped for plain text)
  - Show Claude-generated concrete action in highlighted block
  - CTA link to `appel.html` with email/name prefill for Calendly tracking
  - Error handling: show "need personalized link" message if no data

**appel.html (Booking Page):**
- Location: `/Users/Enzo/burnout-quiz/appel.html`
- Triggers: Link from resultats.html with `?e=[email]&p=[prenom]` params, or direct navigation
- Responsibilities:
  - Display hero section explaining 30-minute coaching offer (3 steps)
  - Initialize Calendly widget with optional email + name prefill
  - Listen for booking confirmation (calendly.event_scheduled message event)
  - Trigger secondary webhook to n8n marking booking flag for CRM

## Error Handling

**Strategy:** Graceful degradation with limited user feedback

**Patterns:**

- **Quiz validation:** Form inputs checked before submission; invalid fields highlighted with orange border (`#c0622a`), field refocused. No submission allowed until fixed.
- **Email validation:** Regex check for basic email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); on error, field border turns orange.
- **Webhook failures:** `fetch()` catches errors silently (`.catch(() => {})` lines 253, 230). User sees confirmation screen regardless — no error message shown. If webhook fails, no email sent; user will not receive results link.
- **Results page data errors:** `resultats.html` checks for missing `d` param or invalid JSON; if absent/malformed, shows error state with link back to quiz (lines 382–389).
- **No alerts:** No `alert()` or modal dialogs; all validation is UX-integrated (field highlighting, inline validation messages where needed).

## Cross-Cutting Concerns

**Logging/Analytics:** 

- `ping(event, question)` function sends navigator.sendBeacon to PING_URL (`https://enzo-os.vercel.app/api/quiz`)
- Events tracked: `'question_view'` (every question rendered), `'quiz_complete'` (on final answer), `'email_submitted'` (on email capture)
- Payload: `{ event, question, total: 13 }`
- No error handling; beacons fire asynchronously

**Validation:**

- Client-side form validation only (no server-side revalidation)
- Email regex check; prenom required (non-empty trim)
- No CSRF protection; no rate limiting
- Data validation in resultats.html: presence of prenom + stade before rendering

**Authentication:**

- None. Quiz is anonymous; no user account system
- resultats.html data encapsulated in URL parameter (base64url-encoded JSON) — only someone with the email link can see their results
- appel.html assumes user who clicked resultats CTA link is the quiz taker (no verification)

**Data Persistence:**

- None on client side (no localStorage/sessionStorage)
- All persistence happens via n8n webhooks → Brevo CRM
- Each visit is stateless; navigating away from quiz clears all state

