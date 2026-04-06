# Technology Stack

**Project:** Lead Dashboard & Funnel Analytics
**Researched:** 2026-04-06

## Recommended Stack

### Core Runtime
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel Serverless Functions | Node.js 20 | API routes for quiz data + dashboard | Already hosting quiz; `/api` directory convention works without Next.js; native TypeScript support |
| TypeScript | ^5.x | API route language | Type safety for DB schemas and API payloads; Vercel compiles `.ts` in `/api` natively |

### Frontend (Dashboard Page)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla HTML/CSS/JS | ES6+ | Dashboard UI | Matches existing quiz stack. No framework needed for 1 read-only page |
| CSS custom properties | CSS3 | Theming consistency | Reuse quiz design tokens (dark theme, Inter font) |

### Database Access
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Neon PostgreSQL | Shared instance | Lead and event storage | Already provisioned for glow-up; separate database on same Neon project |
| @neondatabase/serverless | ^1.0.2 | Neon HTTP driver | Purpose-built for serverless cold starts; no persistent connections; already used in glow-up |
| drizzle-orm | ^0.45.2 | Type-safe ORM | Lightweight (no codegen unlike Prisma); native `drizzle-orm/neon-http` adapter; already used in glow-up |
| drizzle-kit | ^0.31.10 | Schema migrations | `drizzle-kit push` from CLI; generates SQL from TypeScript schema |

### Validation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zod | ^4.x | Request validation | Validate incoming quiz payloads before DB insert; already used in glow-up |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Chart.js | 4.x (CDN) | Funnel visualization | Phase 2 only, for drop-off bar chart |
| dotenv | ^16.x | Local env loading | Dev dependency only, for drizzle-kit commands |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | None (Vercel `/api` dir) | Next.js | Massive overkill for 4 static pages + 5 API routes. PROJECT.md says "don't migrate to Next.js" |
| ORM | drizzle-orm | Prisma | Codegen step, heavier cold starts. Drizzle already in glow-up |
| ORM | drizzle-orm | Raw SQL via neon() | Works but loses type safety and schema management |
| Routing | Vercel file-based | Express, tRPC | Vercel's file routing IS the framework. Adding a router fights the platform |
| Auth | Vercel password protection / API key | NextAuth, Clerk, Better Auth | Single user. Auth framework adds complexity with zero ROI |
| Charts | Chart.js via CDN | D3.js, Recharts | Overkill for 2-3 simple charts |
| Dashboard | Custom HTML | Retool, Metabase | External dependency for trivial data needs |

## Database Connection Pattern

```typescript
// api/_lib/db.ts (underscore prefix = not exposed as API route)
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

Use HTTP mode (not WebSocket) -- every API route is a single request-response with no interactive transactions.

## Project Structure

```
burnout-quiz/
  index.html              # Quiz (existing)
  resultats.html          # Results (existing)
  appel.html              # Booking (existing)
  dashboard.html          # NEW: leads dashboard
  style.css               # Existing styles
  script.js               # Existing quiz logic
  dashboard.js            # NEW: dashboard fetch + render
  api/
    _lib/
      db.ts               # Shared DB connection
      schema.ts           # Drizzle schema
    submit.ts             # Quiz submission
    event.ts              # Funnel event tracking
    booking.ts            # Calendly booking confirmation
    dashboard/
      leads.ts            # Lead list endpoint
      funnel.ts           # Funnel analytics endpoint
      stats.ts            # Aggregate metrics
  drizzle.config.ts       # Drizzle Kit config
  package.json            # Dependencies
  tsconfig.json           # TypeScript (include: api/**)
  vercel.json             # Routing + function config
  .env.local              # Local DATABASE_URL (gitignored)
```

## Installation

```bash
npm init -y

# Core
npm install @neondatabase/serverless drizzle-orm zod

# Dev
npm install -D drizzle-kit dotenv typescript @types/node

# Chart.js loaded from CDN in dashboard.html (no npm needed)
```

## Environment Variables

```bash
# Required in Vercel project settings:
DATABASE_URL=postgresql://...@...neon.tech/burnout_quiz

# Dashboard protection (simple approach):
DASHBOARD_TOKEN=<random-string>  # Query param ?token=xxx to access dashboard
```

## Consistency with glow-up

| Aspect | glow-up | burnout-quiz |
|--------|---------|--------------|
| Driver | @neondatabase/serverless ^1.0.2 | Same |
| ORM | drizzle-orm ^0.45.1 | ^0.45.2 |
| Adapter | drizzle-orm/neon-http | Same |
| Validation | zod ^4.x | Same |
| Connection | `neon(DATABASE_URL)` | Same |

Same patterns, same mental model, zero context-switching cost.

## Sources

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Node.js Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Vanilla Vercel Functions Example](https://github.com/yo-iwamoto/vanilla-vercel-functions)
- [Neon Serverless Driver Docs](https://neon.com/docs/serverless/serverless-driver)
- [@neondatabase/serverless on npm](https://www.npmjs.com/package/@neondatabase/serverless)
- [Drizzle ORM + Neon Guide](https://orm.drizzle.team/docs/connect-neon)
- [drizzle-orm on npm](https://www.npmjs.com/package/drizzle-orm)
- [Neon: Drizzle with Vercel](https://neon.com/guides/drizzle-local-vercel)
