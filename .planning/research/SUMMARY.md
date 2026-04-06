# Research Summary: Lead Dashboard & Funnel Analytics

**Domain:** Lead tracking dashboard and quiz funnel analytics for solo coaching practice
**Researched:** 2026-04-06
**Overall confidence:** HIGH

## Executive Summary

Enzo's burnout quiz already tracks funnel events (question views, quiz completion, email submission) and collects lead data (name, email, scores, burnout level). The problem is not data collection -- it is visibility. All this data flows to n8n/Brevo with no way for Enzo to see it, query it, or act on it. The dashboard milestone is about making existing data visible and actionable.

The feature landscape for a solo coach's lead dashboard is deliberately narrow compared to enterprise tools like HubSpot or Salesforce. The entire value proposition fits in one sentence: show Enzo who took the quiz, how severe their burnout is, whether they booked a call, and where the funnel leaks. Everything beyond that is premature optimization for a practice targeting 1500 EUR/month in coaching revenue.

Quiz funnel tools like ScoreApp, involve.me, and Perspective all center their analytics on two things: step-by-step drop-off visualization and lead-level detail. These are the two highest-value features. The funnel visualization answers "where am I losing people?" and the lead detail answers "who should I follow up with?"

The anti-feature list is as important as the feature list. Enzo has 2-3 hours/day and low energy. Building a CRM, email automation, AI scoring, or real-time updates would be classic over-engineering and likely an avoidance pattern (building tech instead of coaching). The dashboard should be a simple read-only view that takes 30 seconds to check.

## Key Findings

**Stack:** Vanilla HTML/CSS/JS dashboard page + Vercel API routes + Neon PostgreSQL. No framework needed.
**Architecture:** Static dashboard.html fetching from 3 API endpoints (leads, funnel, stats). Read-only.
**Critical pitfall:** Scope creep into CRM territory -- must stay a simple read-only dashboard.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **See Your Leads** - Ship the minimum: lead table, funnel counts, conversion rate, booking status
   - Addresses: Core visibility gap (Enzo currently flying blind)
   - Avoids: Over-engineering with charts and filters before basic data is visible

2. **Understand Your Funnel** - Add the analytical layer: drop-off visualization, filtering, distribution chart
   - Addresses: Funnel optimization (which question kills conversions?)
   - Avoids: Building before there is enough data to analyze

**Phase ordering rationale:**
- Raw data visibility first (lead list + counts) because it delivers value immediately
- Analytical features second because they need accumulated data to be meaningful
- Differentiators (UTM, email digest, export) deferred -- they optimize a process that must exist first

**Research flags for phases:**
- Phase 1: Standard patterns, straightforward SQL queries and table rendering. No research needed.
- Phase 2: Funnel visualization may need a lightweight chart approach decision (CSS bars vs Chart.js)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Using existing stack (Vercel + Neon), no new tech decisions |
| Features | HIGH | Well-understood domain, clear user need, consistent across all sources |
| Architecture | HIGH | Simple read-only dashboard, no complex patterns needed |
| Pitfalls | HIGH | Primary risk is scope creep, which is a process issue not a tech issue |

## Gaps to Address

- Exact Calendly webhook payload format for booking confirmation (needed to store booking status)
- Whether resultats.html currently sends any beacon event (potential blind spot in funnel)
- Volume expectations: how many quiz takers per week? Affects whether pagination is needed in Phase 1
- Neon database isolation strategy: separate schema vs separate branch vs just prefixed table names
