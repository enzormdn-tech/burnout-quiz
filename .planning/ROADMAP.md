# Roadmap: Burnout Quiz Infrastructure Upgrade

## Overview

Transform the burnout quiz from a static site with n8n webhook dependencies into a self-owned data pipeline on Vercel + Neon PostgreSQL. The journey follows the data flow: set up the database, build write endpoints, migrate the client, build read endpoints, then surface data in a dashboard with analytics. Each phase delivers a verifiable capability, building toward the core value: Enzo can see every lead, their burnout scores, and where they are in the funnel.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Database & Vercel Foundation** - Neon schema, Drizzle ORM, Vercel project with env vars
- [ ] **Phase 2: Write API Routes** - Endpoints that receive quiz submissions, funnel events, and booking confirmations
- [ ] **Phase 3: Quiz Client Migration** - script.js sends data to new API with session tracking and error handling
- [ ] **Phase 4: Booking & Results Migration** - appel.html and resultats.html migrated, all n8n URLs removed
- [ ] **Phase 5: Read API Routes** - Dashboard data endpoints with token auth
- [ ] **Phase 6: Lead Table Dashboard** - Core dashboard page showing all leads with scores and status
- [ ] **Phase 7: Funnel & Conversion Cards** - Summary cards with funnel step counts and conversion rates
- [ ] **Phase 8: Funnel & Distribution Charts** - Visual analytics for drop-off and burnout level distribution
- [ ] **Phase 9: Filtering & Lead Detail** - Time-based filtering and expandable lead detail view

## Phase Details

### Phase 1: Database & Vercel Foundation
**Goal**: A working Vercel deployment with Neon PostgreSQL tables ready to receive quiz data
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):
  1. Visiting the Vercel URL serves the existing quiz HTML exactly as it works today
  2. Running `drizzle-kit push` creates `quiz_leads` and `quiz_events` tables in Neon
  3. TypeScript types for leads and events are generated from the Drizzle schema
  4. DATABASE_URL and DASHBOARD_TOKEN environment variables are configured in Vercel
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Write API Routes
**Goal**: API endpoints that can receive and store quiz submissions, funnel events, and booking confirmations
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03, API-07
**Success Criteria** (what must be TRUE):
  1. POSTing a quiz submission to `/api/quiz` creates a row in `quiz_leads` with name, email, scores, and burnout level
  2. POSTing a funnel event to `/api/event` creates a row in `quiz_events` with session_id and event_type
  3. POSTing a booking confirmation to `/api/booking` updates the corresponding lead's booking status
  4. All three endpoints reject malformed payloads with clear error messages (Zod validation)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Quiz Client Migration
**Goal**: The quiz sends all data to the new Vercel API instead of n8n, with session-level funnel tracking
**Depends on**: Phase 2
**Requirements**: CLIENT-01, CLIENT-02, CLIENT-03
**Success Criteria** (what must be TRUE):
  1. Completing the quiz and submitting email stores the lead in the database (not n8n)
  2. Every quiz session generates a UUID and sends events for quiz_started, each question viewed, quiz_completed, and email_submitted
  3. Network errors during submission show a user-visible retry or fallback (no silent failures)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Booking & Results Migration
**Goal**: The entire client-side codebase talks exclusively to the new API with zero n8n/Railway references remaining
**Depends on**: Phase 3
**Requirements**: CLIENT-04, CLIENT-05, CLIENT-06
**Success Criteria** (what must be TRUE):
  1. Clicking "confirm booking" on appel.html sends data to `/api/booking` (not Railway webhook)
  2. Opening resultats.html fires a `results_viewed` beacon event to `/api/event`
  3. Searching the entire codebase for `n8n` or `railway` returns zero matches
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Read API Routes
**Goal**: Authenticated endpoints that serve lead data, funnel metrics, and conversion stats for the dashboard
**Depends on**: Phase 2
**Requirements**: API-04, API-05, API-06, API-08
**Success Criteria** (what must be TRUE):
  1. GET `/api/leads` returns all leads with scores, burnout level, booking status, and timestamps
  2. GET `/api/funnel` returns counts for each funnel step (started, q1-q13, completed, email, results_viewed, booked)
  3. GET `/api/stats` returns conversion rates (quiz-to-email, email-to-booked) and total lead count
  4. All three endpoints return 401 when called without a valid DASHBOARD_TOKEN
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Lead Table Dashboard
**Goal**: Enzo can open a dashboard page and see every lead who took the quiz, with their scores and booking status
**Depends on**: Phase 5
**Requirements**: DASH-01, DASH-04, DASH-05
**Success Criteria** (what must be TRUE):
  1. Navigating to `/dashboard.html` with the correct token shows a table of all leads (name, email, scores, level, date, booked)
  2. Navigating to `/dashboard.html` without a token shows an access denied message
  3. The dashboard uses the same dark theme, Inter font, and CSS custom properties as the quiz
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Funnel & Conversion Cards
**Goal**: Enzo can see at a glance how many people are at each funnel stage and what the conversion rates are
**Depends on**: Phase 6
**Requirements**: DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Dashboard displays summary cards showing count at each funnel step (started, completed, email submitted, booked)
  2. Dashboard displays conversion rate cards (quiz-to-email %, email-to-booked %)
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 07-01: TBD

### Phase 8: Funnel & Distribution Charts
**Goal**: Enzo can visually identify where the funnel leaks and what burnout severity levels his audience has
**Depends on**: Phase 7
**Requirements**: ANAL-01, ANAL-03
**Success Criteria** (what must be TRUE):
  1. A bar chart shows the count at each of the 13 questions plus email and booking steps, making drop-off points visually obvious
  2. A chart shows the distribution of burnout severity levels across all leads (% per level)
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 08-01: TBD

### Phase 9: Filtering & Lead Detail
**Goal**: Enzo can filter all dashboard views by time period and drill into individual lead details
**Depends on**: Phase 8
**Requirements**: ANAL-02, ANAL-04
**Success Criteria** (what must be TRUE):
  1. Selecting a time filter (7 days, 30 days, all time) updates lead table, funnel chart, and conversion cards
  2. Clicking a lead row expands to show full dimension breakdown (Personal, Work, Withdrawal) and individual answers
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 09-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database & Vercel Foundation | 0/2 | Not started | - |
| 2. Write API Routes | 0/2 | Not started | - |
| 3. Quiz Client Migration | 0/2 | Not started | - |
| 4. Booking & Results Migration | 0/1 | Not started | - |
| 5. Read API Routes | 0/2 | Not started | - |
| 6. Lead Table Dashboard | 0/2 | Not started | - |
| 7. Funnel & Conversion Cards | 0/1 | Not started | - |
| 8. Funnel & Distribution Charts | 0/1 | Not started | - |
| 9. Filtering & Lead Detail | 0/1 | Not started | - |
