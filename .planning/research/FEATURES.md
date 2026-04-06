# Feature Landscape

**Domain:** Lead tracking dashboard and funnel analytics for a solo coach's quiz funnel
**Researched:** 2026-04-06

## Table Stakes

Features Enzo expects and needs. Missing = the dashboard is useless.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Lead list with scores | Core purpose: see who took the quiz, their burnout scores, burnout level | Low | Simple table with sorting. Fields: name, email, scores (P/W/D/total), burnout level, date |
| Funnel step counts | Know how many people start vs finish vs submit email | Low | Aggregate counts per event type (question_view q1, quiz_complete, email_submitted) |
| Funnel drop-off visualization | See WHERE people abandon the quiz (which question kills it) | Medium | Bar chart or step funnel showing count at each of 13 questions + email step. The single most actionable metric |
| Conversion rate | % of quiz starters who submit email, % who book a call | Low | Derived from funnel counts. Display as big number cards |
| Lead detail view | Click a lead to see their full dimension breakdown and answer history | Low | Modal or expandable row showing individual answers, dimension scores, timestamps |
| Time-based filtering | See leads from last 7 days, last 30 days, all time | Low | Date range filter on all views. Essential once data accumulates |
| Call booking status | Know which leads booked a discovery call vs ghosted | Low | Boolean flag per lead (booked/not booked), filterable |
| Total lead count + trend | How many leads this week vs last week | Low | Simple counter with delta indicator |

## Differentiators

Features that would give Enzo an edge in managing his pipeline. Not expected, but high value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Burnout level distribution | Pie/donut chart showing % of leads at each burnout level (moderate/severe/critical) | Low | Helps Enzo understand his audience profile and tailor content |
| Lead scoring / hot leads | Flag leads most likely to convert (high burnout + viewed results + time on page) | Medium | Simple heuristic, not ML. Score = burnout severity + funnel depth |
| Daily/weekly email digest | Automated summary of new leads and funnel performance sent to Enzo's email | Medium | Vercel cron + Resend/email API. Saves Enzo from checking dashboard daily |
| UTM source tracking | Know which LinkedIn post / channel drove each lead | Low | Capture UTM params from URL on quiz start, store with lead. High ROI for content strategy |
| Cohort analysis by week | Compare conversion rates week-over-week to see if changes to quiz improve performance | Medium | Group leads by week, show conversion rate trend line |
| Results page view tracking | Know which leads actually opened their results email (viewed resultats.html) | Low | Add beacon event on resultats.html load. Currently a blind spot in the funnel |
| CSV export | Download lead list for use in other tools | Low | Simple endpoint that streams CSV. Useful for Brevo import or spreadsheet analysis |

## Anti-Features

Features to explicitly NOT build. Over-engineering for a single-user dashboard managing a coaching funnel.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multi-user auth / role-based access | Enzo is the only user. Auth adds complexity for zero value | Simple env var protection or Vercel password protection |
| Email automation / drip sequences | Building email infra is a rabbit hole. Brevo/Resend already handle this | Keep email delivery in external service, dashboard is read-only |
| AI-powered lead scoring / predictions | Over-engineering. With <100 leads/month, Enzo's intuition + burnout severity is enough | Simple heuristic scoring (burnout level + funnel depth) |
| Real-time WebSocket updates | Leads trickle in (a few per day). Polling or page refresh is fine | Static page load with fresh data query |
| CRM pipeline / deal stages / kanban | This is a quiz funnel, not a sales pipeline. 2 states matter: lead vs booked | Boolean "booked" flag on lead record |
| A/B testing framework | Premature optimization. Get the funnel visible first, optimize manually | If needed later, simple variant flag in URL params |
| Mobile app / PWA | Dashboard is checked occasionally from desktop. Not worth the investment | Responsive web page is sufficient |
| Notification system (push/in-app) | Enzo checks the dashboard when he wants to. Push notifications add noise | Email digest (differentiator above) is enough |
| Integration marketplace (Zapier, etc.) | One user, known tools. Direct integrations only | Hard-code the 2-3 services Enzo uses (Calendly, Brevo) |
| Fancy charting library (D3, Recharts) | The data is simple. 13-step funnel + a few counters | CSS bar charts or a minimal charting lib (Chart.js already in marathon-app) |
| Lead notes / activity log / timeline | Enzo knows his few leads personally. CRM-style activity tracking is overkill | Keep it simple: lead data + booked status |

## Feature Dependencies

```
Funnel step counts → Funnel drop-off visualization (need counts to visualize)
Lead list with scores → Lead detail view (detail is expansion of list)
Lead list with scores → Call booking status (booking is a field on lead)
Funnel step counts → Conversion rate (derived metric)
UTM source tracking → requires capturing UTMs at quiz start (frontend change)
Results page view tracking → requires adding beacon to resultats.html (frontend change)
Daily email digest → requires all dashboard data to be queryable via API (backend dependency)
```

## MVP Recommendation

**Phase 1 — See Your Leads (ship in 1 milestone):**
1. Lead list with scores (table stakes)
2. Funnel step counts (table stakes)
3. Conversion rate cards (table stakes)
4. Call booking status (table stakes)

**Phase 2 — Understand Your Funnel (next milestone):**
5. Funnel drop-off visualization (table stakes — the most actionable feature)
6. Time-based filtering (table stakes)
7. Burnout level distribution chart (differentiator, low effort)
8. Lead detail view (table stakes)

**Defer:**
- UTM source tracking: Requires frontend quiz changes, defer until funnel is visible
- Email digest: Nice-to-have, defer until Enzo uses the dashboard regularly
- Cohort analysis: Needs weeks of data before it's useful
- CSV export: Build when Enzo asks for it

## Sources

- [Monday.com: Lead analytics dashboard metrics](https://monday.com/blog/crm-and-sales/lead-analytics-dashboard/)
- [Perspective: Quiz funnel software comparison 2026](https://www.perspective.co/article/quiz-funnel-software)
- [CustomerLabs: Funnel tracking and conversion analysis](https://www.customerlabs.com/blog/funnel-tracking-optimization-conversion/)
- [FullSession: Conversion funnel analysis workflow](https://www.fullsession.io/blog/conversion-funnel-analysis/)
- [Bigin: CRM for solopreneurs](https://www.bigin.com/crm-for-solopreneurs.html)
- [OnePageCRM: Personal CRM for solopreneurs](https://www.onepagecrm.com/personal-crm-for-sales-focused-solopreneurs/)
- [ScoreApp: Quiz funnel marketing](https://www.scoreapp.com/)
- [Landerlab: Quiz analytics](https://kb.landerlab.io/knowledge-base/quiz-analytics/)
