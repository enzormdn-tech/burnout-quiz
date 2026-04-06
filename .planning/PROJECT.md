# Burnout Quiz — Infrastructure Upgrade

## What This Is

A burnout assessment tool (Copenhagen Burnout Inventory) that serves as a lead generation funnel for Enzo's coaching practice. Visitors take a 13-question quiz, get personalized burnout analysis, and can book a discovery call. Currently a static HTML/CSS/JS site with n8n webhook integrations — being upgraded to Vercel + Neon PostgreSQL for proper data ownership and funnel visibility.

## Core Value

Enzo can see every lead, their burnout scores, and where they are in the funnel — no more flying blind on conversion.

## Requirements

### Validated

- ✓ 13-question CBI quiz with 3 dimensions (Personal, Work, Withdrawal) — existing
- ✓ Score calculation and burnout level classification — existing
- ✓ Teaser screen with email gate before full results — existing
- ✓ Full results page with dimension breakdown — existing
- ✓ Booking page with Calendly embed and prefill — existing

### Active

- [ ] Replace n8n webhooks with Vercel API routes writing to Neon PostgreSQL
- [ ] Store leads in DB (email, name, scores, burnout level, timestamps)
- [ ] Track funnel events in DB (quiz started, each question viewed, quiz completed, email submitted, results viewed, call booked)
- [ ] Deploy quiz on Vercel (static files + API routes)
- [ ] Dashboard page to view leads, scores, funnel drop-off, and conversion metrics
- [ ] Remove all n8n/Railway dependencies

### Out of Scope

- Quiz redesign (questions, UX, design) — infra only for now
- Multi-user auth — Enzo is the only user of the dashboard
- Email automation (Brevo/Mailchimp) — defer until funnel data shows what to optimize
- Claude AI analysis of results — keep current approach, revisit after funnel data
- Mobile app — web only

## Context

- Quiz already partially points to `enzo-os.vercel.app/api/quiz` for submissions
- Booking confirmation currently hits n8n on Railway (`n8n-production-2438.up.railway.app`)
- Results are passed via base64-encoded URL params between pages (no server-side rendering)
- Neon PostgreSQL already in Enzo's stack (used by glow-up/RunCoach)
- Site is pure HTML/CSS/JS — no build step, no framework
- Vercel can serve static files + API routes without migrating to Next.js
- Enzo has low energy, 2-3h/day — keep changes surgical

## Constraints

- **Stack**: Vercel (static + serverless API routes) + Neon PostgreSQL — no new services
- **Simplicity**: Keep HTML/CSS/JS static approach — don't migrate to Next.js
- **Timeline**: Ship fast — this feeds the coaching pipeline (North Star: 1500EUR/month)
- **Data**: All lead data must be owned (no third-party dependency for core data)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vercel + API routes (not Next.js) | Keep static simplicity, add only what's needed | — Pending |
| Neon PostgreSQL (shared with glow-up) | Already provisioned, no new infra cost | — Pending |
| Dashboard as separate page in same project | Simple, no auth needed (Vercel protection or env var) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after initialization*
