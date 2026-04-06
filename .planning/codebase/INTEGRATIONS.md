# External Integrations

**Analysis Date:** 2026-04-06

## APIs & External Services

**Quiz & Results Processing:**
- Service: Custom Enzo OS API
  - Endpoint: `https://enzo-os.vercel.app/api/quiz`
  - Method: POST
  - Purpose: Receives quiz responses, scores, answers; triggers Claude analysis and email delivery via n8n
  - Used in: `script.js` line 249 (`sendWebhook()`)
  - Payload includes:
    - `prenom`, `email` — user identification
    - `score_total`, `score_personnel`, `score_travail`, `score_retrait` — CBI dimension scores
    - `stade` — burnout level label
    - `answers` — full question-answer pairs with block (dimension), text, response label, numeric value

**Analytics/Funnel Tracking:**
- Service: Same endpoint (`https://enzo-os.vercel.app/api/quiz`)
  - Method: beacon/POST via `navigator.sendBeacon()`
  - Purpose: Track quiz flow events for conversion funnel
  - Used in: `script.js` lines 5-10 (`ping()` function)
  - Events tracked:
    - `question_view` — when question renders (question index 1-13)
    - `quiz_complete` — when all 13 questions answered
    - `email_submitted` — when user submits email/name
  - Implementation: Uses `navigator.sendBeacon()` for non-blocking delivery

**Booking & Calendar:**
- Service: Calendly
  - Widget: Embedded iframe
  - Endpoint: `https://calendly.com/contact-remidene-enzo/30min`
  - Location: `appel.html` lines 206, 214-218
  - URL Parameters (prefill):
    - `hide_gdpr_banner=1` — hide privacy banner
    - `background_color=fafaf8` — light beige background
    - `text_color=1c1c1c` — dark text
    - `primary_color=1c1c1c` — dark button color
    - `email` — visitor email (optional, passed from resultats.html)
    - `name` — visitor first name (optional, passed from resultats.html)
  - Booking confirmation: Monitored via `window.message` event (calendly.event_scheduled)

**Post-Booking Workflow:**
- Service: n8n automation (webhook receiver)
  - Endpoint: `https://n8n-production-2438.up.railway.app/webhook/calendly-booking`
  - Method: POST
  - Trigger: When Calendly event scheduled
  - Purpose: Mark booking confirmed in Brevo/email marketing (sets `APPEL_BOOK = true`)
  - Used in: `appel.html` lines 221-232
  - Payload: `{ event: 'invitee.created', payload: { email, name } }`

## Data Storage

**Databases:**
- None — this is a client-side quiz only
- Results are not persisted locally (no localStorage, no sessionStorage)
- Data flows to external services (n8n/Brevo) via webhooks

**File Storage:**
- None — no file upload capability
- Static assets served from same domain

**Caching:**
- Browser HTTP cache for static assets
- No explicit caching headers configured in this codebase (server config required)

## Authentication & Identity

**Auth Provider:**
- None — no user authentication system
- Single-user access to quiz (Enzo's personal coaching lead magnet)
- Email capture is free-form (no login required)

**Email Management:**
- Service: Brevo (formerly Sendinblue)
- Integration: Via n8n webhooks
- Purpose: Store leads, segment by burnout level, trigger automated email sequences
- Implementation: Quiz data posted to n8n, which:
  1. Stores contact in Brevo
  2. Sends AI-generated analysis email (from Claude)
  3. Updates contact properties based on level
  4. Tracks booking confirmations

## Monitoring & Observability

**Error Tracking:**
- None configured
- Webhook failures silently caught: `fetch(...).catch(() => {})`
- No error logging or reporting

**Logs:**
- Browser console only
- No centralized logging infrastructure
- Failed webhook requests are silently dropped

**Analytics:**
- Funnel tracking via `navigator.sendBeacon()` to `https://enzo-os.vercel.app/api/quiz`
- Events: question views, quiz completion, email submission
- Calendly booking tracking via postMessage event listeners

## CI/CD & Deployment

**Hosting:**
- Static file hosting required (GitHub Pages, Vercel, Netlify, AWS S3, etc.)
- No server-side execution needed
- Deploy entire directory to public web root

**Backend Services:**
- `https://enzo-os.vercel.app` — Vercel-hosted Node.js API
  - Handles quiz webhook, response storage, Claude API calls
  - Generates personalized analysis via Claude
  - Encodes results as base64url for URL transmission to `resultats.html`
  - Posts to n8n for email delivery

- `https://n8n-production-2438.up.railway.app` — n8n automation platform
  - Receives quiz data via webhook from Enzo OS API
  - Stores contacts in Brevo
  - Triggers email delivery with personalized analysis
  - Monitors Calendly bookings and updates Brevo contacts

**CI Pipeline:**
- None detected in this codebase
- Deployment: Direct file push (git push to hosting provider)

## Environment Configuration

**Required env vars:**
- None in this codebase (all hardcoded)
- Production servers (`enzo-os.vercel.app`, n8n, Brevo) require:
  - `ANTHROPIC_API_KEY` — Claude API key (on enzo-os backend)
  - `BREVO_API_KEY` — Email service credentials (on n8n)
  - Database connection strings (if persisting quiz data)

**Configuration Hardcoded:**
- Webhook URL: `script.js` line 2-3
- Calendly endpoint: `appel.html` line 214
- n8n webhook endpoint: `appel.html` line 223

## Webhooks & Callbacks

**Incoming (to this app):**
- None — this is a client-side SPA, no backend in this repository

**Outgoing (from this app):**

**1. Quiz Submission Webhook:**
- Endpoint: `https://enzo-os.vercel.app/api/quiz` (POST)
- Triggered: User submits email/name on teaser screen
- Payload: Full quiz response with scores and answers
- Purpose: Trigger AI analysis and email delivery
- File: `script.js` lines 229-254

**2. Funnel Tracking Events:**
- Endpoint: `https://enzo-os.vercel.app/api/quiz` (sendBeacon)
- Events:
  - Question view (each question)
  - Quiz complete
  - Email submission
- Purpose: Track conversion funnel
- File: `script.js` lines 5-10, called from lines 135, 160, 224

**3. Calendly Booking Notification:**
- Endpoint: `https://n8n-production-2438.up.railway.app/webhook/calendly-booking` (POST)
- Triggered: Calendly event confirmed (postMessage event)
- Payload: `{ event: 'invitee.created', payload: { email, name } }`
- Purpose: Update Brevo contact with booking confirmation
- File: `appel.html` lines 221-232

**4. Data Passing Between Pages:**
- Mechanism: URL query parameters (base64url encoded)
- `index.html` → `resultats.html`: Pass `d` param with compressed user data
- `resultats.html` → `appel.html`: Pass `e` (email) and `p` (name) params for Calendly prefill
- Encoding: Base64url (URL-safe variant)
- Files: `resultats.html` lines 400-422, `appel.html` lines 209-218

---

*Integration audit: 2026-04-06*
