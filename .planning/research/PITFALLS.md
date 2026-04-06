# Domain Pitfalls

**Domain:** Lead tracking dashboard and quiz funnel analytics for solo coach
**Researched:** 2026-04-06

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Scope Creep into CRM Territory
**What goes wrong:** Dashboard grows features (notes, tags, pipelines, automation, email sequences) until it becomes a half-baked CRM that took weeks to build and is worse than free tools.
**Why it happens:** Each individual feature seems small ("just add a notes field"), but they compound. Building is more comfortable than coaching.
**Consequences:** Weeks of dev time burned on features Enzo will never use. Classic avoidance pattern (anti-pattern #2 from CLAUDE.md).
**Prevention:** Hard scope limit: dashboard is READ-ONLY. No write operations from the dashboard UI. If Enzo needs to manage leads, use Brevo/Notion. Dashboard is for visibility only.
**Detection:** Any feature request that involves writing data from the dashboard (except marking a lead as "booked") is a scope creep signal.

### Pitfall 2: Missing Session ID on Funnel Events
**What goes wrong:** Funnel events (question_view, quiz_complete, email_submitted) are stored without a session identifier, making it impossible to reconstruct individual user journeys or calculate accurate drop-off rates.
**Why it happens:** Current `ping()` function sends event type + question index but no session ID. Easy to overlook during migration.
**Consequences:** Cannot distinguish "100 people started, 50 finished" from "50 people started twice each." Funnel analytics become meaningless.
**Prevention:** Generate a UUID per quiz session on page load (client-side). Attach to every ping event and the final submission. Store in events table.
**Detection:** If `SELECT COUNT(DISTINCT session_id) FROM events WHERE event = 'question_view' AND question = 1` equals `COUNT(*)`, sessions are working. If session_id is NULL, it was missed.

### Pitfall 3: Losing the Booking Confirmation Event
**What goes wrong:** Calendly booking events (detected via postMessage in appel.html) are sent to n8n but not to the new Neon database. Dashboard shows leads who never booked.
**Why it happens:** The booking webhook in appel.html currently points to n8n. During migration, this endpoint must also write to DB, or the "booked" status is lost.
**Consequences:** The most important conversion metric (lead -> booked call) is invisible. Dashboard shows quiz completions but not the final outcome.
**Prevention:** Update appel.html booking handler to also POST to new API route (or redirect the existing endpoint). Ensure the lead record gets `booked = true`.
**Detection:** Test the full flow: take quiz -> submit email -> view results -> book call -> check dashboard shows "booked."

## Moderate Pitfalls

### Pitfall 4: Base64 URL Data Passing Fragility
**What goes wrong:** Data between pages (index.html -> resultats.html -> appel.html) is passed via base64-encoded URL parameters. If the encoding breaks or params are truncated, the chain breaks silently.
**Prevention:** Keep the existing URL param approach for page-to-page data, but also store in DB as source of truth. Dashboard reads from DB, not from URL params.

### Pitfall 5: Beacon Events Silently Failing
**What goes wrong:** `navigator.sendBeacon()` does not return success/failure status. Events can be lost (ad blockers, network issues) with no indication.
**Prevention:** Accept that funnel data will be approximate, not exact. Design dashboard to show trends, not precise counts. Do not make business decisions on single-digit differences.

### Pitfall 6: Dashboard Token in URL Leaking via Referrer
**What goes wrong:** If dashboard uses `?token=xxx` for auth, the token appears in browser history and can leak via Referrer header if dashboard links to external resources.
**Prevention:** Use Vercel's built-in password protection for the dashboard route instead of query param tokens. Or use a cookie-based token set via a login endpoint.

### Pitfall 7: Neon Cold Start Latency
**What goes wrong:** First API call after inactivity takes 2-5 seconds as Neon compute wakes up. Dashboard feels broken on first load.
**Prevention:** Use Neon's serverless driver (HTTP-based, not TCP) which avoids connection overhead. Accept 1-2s initial load. Show loading state in dashboard.

## Minor Pitfalls

### Pitfall 8: Timezone Confusion in Date Filtering
**What goes wrong:** "Last 7 days" filter gives unexpected results because server timestamps are UTC but Enzo thinks in Europe/Paris.
**Prevention:** Store all timestamps in UTC. Convert to local time for display. Filter by UTC but with timezone-aware boundaries.

### Pitfall 9: Chart.js Bundle Size
**What goes wrong:** Full Chart.js is ~200KB. For 1-2 simple charts, it is heavy.
**Prevention:** Use tree-shakeable ESM import or just use CSS-based bar charts for the funnel. Reserve Chart.js for when a real chart (line, pie) is needed.

### Pitfall 10: No Data State
**What goes wrong:** Dashboard loads with zero leads and shows an empty table with no context. Looks broken.
**Prevention:** Show explicit "No leads yet" empty state with a message about how leads appear when someone takes the quiz.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| DB schema design | Missing session_id on events (Pitfall 2) | Add session_id column from day 1, generate UUID client-side |
| Quiz API migration | Losing booking events (Pitfall 3) | Map all 4 outgoing webhooks, ensure each has a DB write path |
| Dashboard auth | Token leaking (Pitfall 6) | Use Vercel password protection, not query params |
| Funnel visualization | Inaccurate counts from beacon failures (Pitfall 5) | Show trends not absolutes, add "approximate" label |
| First dashboard load | Neon cold start (Pitfall 7) | Loading state, serverless driver |

## Sources

- Neon cold start documentation: https://neon.tech/docs/introduction/auto-suspend
- navigator.sendBeacon spec limitations: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
- Vercel password protection: https://vercel.com/docs/security/deployment-protection
