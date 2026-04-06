# Requirements: Burnout Quiz Infrastructure Upgrade

**Defined:** 2026-04-06
**Core Value:** Enzo can see every lead, their burnout scores, and where they are in the funnel

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: Project deployed on Vercel with static files + API routes (no Next.js)
- [ ] **INFRA-02**: Neon PostgreSQL database with leads and events tables (prefixed `quiz_`)
- [ ] **INFRA-03**: Drizzle ORM schema with TypeScript types for all tables
- [ ] **INFRA-04**: Database migrations runnable via `drizzle-kit push`
- [ ] **INFRA-05**: Environment variables configured in Vercel (DATABASE_URL, DASHBOARD_TOKEN)

### API Routes

- [ ] **API-01**: POST `/api/quiz` receives quiz submission (name, email, scores, answers) and stores in DB
- [ ] **API-02**: POST `/api/event` receives funnel events (session_id, event_type, metadata) and stores in DB
- [ ] **API-03**: POST `/api/booking` receives Calendly booking confirmation and updates lead status
- [ ] **API-04**: GET `/api/leads` returns all leads with scores, burnout level, booking status
- [ ] **API-05**: GET `/api/funnel` returns funnel step counts (started, per question, completed, email, booked)
- [ ] **API-06**: GET `/api/stats` returns conversion rates and total lead counts
- [ ] **API-07**: All API routes validate input with Zod schemas
- [ ] **API-08**: Read endpoints protected by simple token auth (query param or header)

### Client Migration

- [ ] **CLIENT-01**: `script.js` sends quiz submission to new Vercel API instead of n8n
- [ ] **CLIENT-02**: `script.js` sends funnel events with session_id (UUID per visit) to new API
- [ ] **CLIENT-03**: `script.js` has proper error handling (no empty catch blocks)
- [ ] **CLIENT-04**: `appel.html` sends booking confirmation to new API instead of n8n webhook
- [ ] **CLIENT-05**: `resultats.html` fires a `results_viewed` beacon event on page load
- [ ] **CLIENT-06**: All n8n/Railway URLs removed from codebase

### Dashboard

- [ ] **DASH-01**: `dashboard.html` page with lead list table (name, email, scores, level, date, booked)
- [ ] **DASH-02**: Funnel step counts displayed as summary cards
- [ ] **DASH-03**: Conversion rate cards (quiz→email, email→booked)
- [ ] **DASH-04**: Dashboard protected by token (not publicly accessible)
- [ ] **DASH-05**: Dashboard styled consistently with quiz (dark theme, Inter font, CSS custom properties)

### Analytics (Phase 2)

- [ ] **ANAL-01**: Funnel drop-off visualization (bar chart showing count at each of 13 questions + email + booking)
- [ ] **ANAL-02**: Time-based filtering on all views (7 days, 30 days, all time)
- [ ] **ANAL-03**: Burnout level distribution chart (% of leads per severity level)
- [ ] **ANAL-04**: Lead detail view (expandable row with full dimension breakdown and answers)

## v2 Requirements

### Engagement

- **ENG-01**: UTM source tracking (capture URL params at quiz start, store with lead)
- **ENG-02**: Daily/weekly email digest of new leads and funnel metrics
- **ENG-03**: CSV export of lead list
- **ENG-04**: Cohort analysis (conversion rates week-over-week)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user auth / roles | Enzo is the only user — token protection is sufficient |
| CRM pipeline / kanban / deal stages | This is a quiz funnel, not a sales tool. 2 states: lead vs booked |
| Email automation / drip sequences | Keep in external service (Brevo). Dashboard is read-only |
| AI-powered lead scoring | Over-engineering for <100 leads/month |
| Real-time WebSocket updates | Leads trickle in. Page refresh is fine |
| Mobile app / PWA | Desktop dashboard checked occasionally |
| A/B testing framework | Premature — get funnel visible first |
| Next.js migration | Unnecessary complexity for this project |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-07 | Phase 2 | Pending |
| CLIENT-01 | Phase 3 | Pending |
| CLIENT-02 | Phase 3 | Pending |
| CLIENT-03 | Phase 3 | Pending |
| CLIENT-04 | Phase 4 | Pending |
| CLIENT-05 | Phase 4 | Pending |
| CLIENT-06 | Phase 4 | Pending |
| API-04 | Phase 5 | Pending |
| API-05 | Phase 5 | Pending |
| API-06 | Phase 5 | Pending |
| API-08 | Phase 5 | Pending |
| DASH-01 | Phase 6 | Pending |
| DASH-04 | Phase 6 | Pending |
| DASH-05 | Phase 6 | Pending |
| DASH-02 | Phase 7 | Pending |
| DASH-03 | Phase 7 | Pending |
| ANAL-01 | Phase 8 | Pending |
| ANAL-03 | Phase 8 | Pending |
| ANAL-02 | Phase 9 | Pending |
| ANAL-04 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation (9-phase structure)*
