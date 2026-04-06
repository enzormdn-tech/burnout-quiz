# Architecture Patterns

**Domain:** Lead tracking dashboard for solo coach quiz funnel
**Researched:** 2026-04-06

## Recommended Architecture

Single-page read-only dashboard served as a static HTML file, fetching data from Vercel API routes that query Neon PostgreSQL.

```
dashboard.html (static, protected by token)
    |
    ├── GET /api/dashboard/leads     → Lead list with scores
    ├── GET /api/dashboard/funnel    → Funnel step counts
    ├── GET /api/dashboard/stats     → Aggregate metrics (conversion rates, totals)
    |
    └── Neon PostgreSQL
         ├── leads table (email, name, scores, burnout_level, booked, created_at)
         └── events table (event_type, question_index, session_id, created_at)
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| dashboard.html | Render lead table, metric cards, funnel chart | API routes via fetch() |
| /api/dashboard/* | Query DB, aggregate data, return JSON | Neon PostgreSQL |
| /api/quiz (existing) | Receive quiz submissions and funnel events | Neon PostgreSQL (write) |
| Neon PostgreSQL | Store leads and events | Read by dashboard API, written by quiz API |

### Data Flow

**Write path (quiz taker):**
1. User starts quiz -> `ping("question_view", 1)` -> `/api/quiz` -> INSERT into `events`
2. User answers questions 1-13 -> ping per question -> INSERT into `events`
3. User submits email -> `sendWebhook()` -> `/api/quiz` -> INSERT into `leads` + `events`
4. User views results -> (new) beacon on resultats.html -> INSERT into `events`
5. User books call -> Calendly postMessage -> `/api/quiz` or direct -> UPDATE `leads.booked = true`

**Read path (Enzo checks dashboard):**
1. Enzo opens `dashboard.html?token=xxx`
2. JS validates token against API
3. Parallel fetch: `/api/dashboard/leads`, `/api/dashboard/funnel`, `/api/dashboard/stats`
4. Render table, cards, chart from JSON responses

## Patterns to Follow

### Pattern 1: API Routes as Thin Data Layer
**What:** API routes do SQL query + JSON response. No business logic, no transformations.
**When:** All dashboard endpoints.
**Example:**
```javascript
// api/dashboard/leads.js
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const days = parseInt(req.query.days) || 30;
  
  const leads = await sql`
    SELECT email, name, score_total, score_personnel, score_travail, 
           score_retrait, burnout_level, booked, created_at
    FROM leads
    WHERE created_at > NOW() - INTERVAL '${days} days'
    ORDER BY created_at DESC
  `;
  
  res.json({ leads });
}
```

### Pattern 2: Session-Based Event Grouping
**What:** Generate a unique session ID per quiz attempt (client-side UUID), attach to all events.
**When:** Funnel tracking events.
**Why:** Allows accurate funnel analysis even if same person takes quiz twice.

### Pattern 3: Progressive Enhancement for Charts
**What:** Show data as numbers/text first, load Chart.js asynchronously for visualization.
**When:** Dashboard page load.
**Why:** Dashboard works even if CDN fails. Numbers are always visible.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Server-Side Rendering for Dashboard
**What:** Using SSR or templating for the dashboard page.
**Why bad:** Adds complexity, requires Node.js runtime for page serve. Dashboard is accessed rarely.
**Instead:** Static HTML + client-side fetch. Simpler, cacheable, consistent with quiz architecture.

### Anti-Pattern 2: Real-Time Event Streaming
**What:** WebSocket or SSE for live dashboard updates.
**Why bad:** Quiz gets a few leads per day. Real-time adds infrastructure for zero value.
**Instead:** Fresh data on page load. Manual refresh if needed.

### Anti-Pattern 3: Storing Derived Metrics
**What:** Pre-computing conversion rates, averages, etc. in the database.
**Why bad:** Low data volume makes real-time computation trivial. Pre-computed data gets stale.
**Instead:** Compute aggregates on read via SQL COUNT/AVG/GROUP BY.

### Anti-Pattern 4: Shared Database Schema with glow-up
**What:** Using the same tables or schema as the glow-up/RunCoach app.
**Why bad:** Coupling between unrelated projects. Schema changes in one break the other.
**Instead:** Separate schema (e.g., `burnout_quiz` schema in same Neon database) or separate database branch.

## Scalability Considerations

| Concern | At 10 leads/week | At 100 leads/week | At 1000 leads/week |
|---------|-------------------|--------------------|--------------------|
| Query performance | No concern | No concern | Add indexes on created_at, consider pagination |
| Storage | Negligible | ~50MB/year | Consider event retention policy |
| API response time | <100ms | <200ms | Consider caching layer |
| Dashboard load | Instant | Fine | Paginate lead table, lazy-load charts |

Note: Enzo is firmly in the "10 leads/week" column. Design for this, not for scale.

## Sources

- Vercel serverless functions patterns: https://vercel.com/docs/functions
- Neon serverless driver: https://neon.tech/docs/serverless/serverless-driver
