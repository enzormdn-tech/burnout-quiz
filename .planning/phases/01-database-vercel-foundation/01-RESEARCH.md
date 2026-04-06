# Phase 1: Database & Vercel Foundation - Research

**Researched:** 2026-04-06
**Domain:** Vercel static deployment + Neon PostgreSQL + Drizzle ORM setup
**Confidence:** HIGH

## Summary

This phase sets up the foundational infrastructure: deploying the existing static burnout quiz to Vercel while adding a Neon PostgreSQL database with Drizzle ORM schema for future lead tracking. The project currently has zero build tooling (no package.json, no Node.js dependencies) and consists of pure HTML/CSS/JS files. We need to initialize npm, add Drizzle + Neon packages, create the database schema, configure Vercel for static + API route coexistence, and set environment variables.

The glow-up project (at `/Users/Enzo/glow-up/`) provides a proven reference implementation using the exact same stack: `@neondatabase/serverless` + `drizzle-orm/neon-http` + `drizzle-kit push`. The burnout-quiz setup will mirror these patterns with `quiz_`-prefixed tables to avoid collision.

**Critical finding:** Vercel's serverless function API has shifted to **Web Standard Request/Response** for non-framework projects. The old `VercelRequest/VercelResponse` pattern is deprecated. Functions use either named HTTP method exports (`export function GET/POST`) or the `export default { fetch }` pattern. [VERIFIED: vercel.com/docs/functions/functions-api-reference]

**Primary recommendation:** Mirror glow-up's Neon + Drizzle setup exactly, use Vercel's Web Standard function signatures, and configure `cleanUrls: true` in vercel.json for extensionless HTML paths.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
All implementation choices are at Claude's discretion -- pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from research:
- Use @neondatabase/serverless + drizzle-orm (same as glow-up project)
- HTTP mode (not WebSocket) for serverless functions
- Table names prefixed with `quiz_` to avoid collision with glow-up
- Vercel serves static HTML + /api serverless functions from same project
- TypeScript for API routes, vanilla JS for frontend

### Claude's Discretion
All implementation choices are at Claude's discretion -- pure infrastructure phase.

### Deferred Ideas (OUT OF SCOPE)
None -- infrastructure phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Project deployed on Vercel with static files + API routes (no Next.js) | Vercel serves static HTML from root + `/api` directory as serverless functions. Web Standard handler signatures verified. `cleanUrls: true` for extensionless paths. |
| INFRA-02 | Neon PostgreSQL database with leads and events tables (prefixed `quiz_`) | Drizzle schema pattern from glow-up verified. `quiz_leads` and `quiz_events` table definitions with appropriate columns. Same Neon instance, separate table prefix. |
| INFRA-03 | Drizzle ORM schema with TypeScript types for all tables | `drizzle-orm/pg-core` pgTable exports provide TypeScript types via inference. `InferSelectModel` / `InferInsertModel` for type exports. |
| INFRA-04 | Database migrations runnable via `drizzle-kit push` | `drizzle-kit push` verified as schema push command. Requires `drizzle.config.ts` with schema path + DATABASE_URL. |
| INFRA-05 | Environment variables configured in Vercel (DATABASE_URL, DASHBOARD_TOKEN) | Set via Vercel dashboard or CLI. `.env.local` for local dev (gitignored). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @neondatabase/serverless | 1.0.2 | Neon PostgreSQL HTTP driver | Purpose-built for serverless cold starts; no persistent connections; same as glow-up [VERIFIED: npm registry] |
| drizzle-orm | 0.45.2 | Type-safe ORM | Lightweight, native neon-http adapter, no codegen; same as glow-up [VERIFIED: npm registry] |
| drizzle-kit | 0.31.10 | Schema push/migrations | `drizzle-kit push` for schema-to-DB sync from TypeScript [VERIFIED: npm registry] |
| typescript | 6.0.2 | API route language | Type safety for DB schemas and API payloads; Vercel compiles `.ts` in `/api` natively [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | ^16.x | Local env loading | Dev dependency only -- for `drizzle-kit push` command to read `.env.local` [ASSUMED] |
| @types/node | ^20.x | Node.js type definitions | Dev dependency -- types for serverless function environment [ASSUMED] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| drizzle-orm | Raw SQL via neon() | Works but loses type safety and schema management |
| drizzle-kit push | drizzle-kit generate + migrate | More formal migration history, but overkill for this project size |

**Installation:**
```bash
npm init -y
npm install @neondatabase/serverless drizzle-orm
npm install -D drizzle-kit dotenv typescript @types/node
```

**Version verification:**
- @neondatabase/serverless: 1.0.2 [VERIFIED: npm registry 2026-04-06]
- drizzle-orm: 0.45.2 [VERIFIED: npm registry 2026-04-06]
- drizzle-kit: 0.31.10 [VERIFIED: npm registry 2026-04-06]
- typescript: 6.0.2 [VERIFIED: npm registry 2026-04-06]

## Architecture Patterns

### Recommended Project Structure
```
burnout-quiz/
  index.html              # Quiz (existing, untouched)
  resultats.html          # Results (existing, untouched)
  appel.html              # Booking (existing, untouched)
  style.css               # Existing styles (untouched)
  script.js               # Existing quiz logic (untouched)
  api/
    _lib/
      db.ts               # Shared DB connection (NOT exposed as route)
      schema.ts           # Drizzle schema definitions
  drizzle.config.ts       # Drizzle Kit config (schema path + DB URL)
  package.json            # Dependencies
  tsconfig.json           # TypeScript config (include: api/**)
  vercel.json             # Vercel config (cleanUrls, regions)
  .env.local              # Local DATABASE_URL (gitignored)
  .gitignore              # node_modules, .env.local, .vercel
```

### Pattern 1: Underscore Prefix for Shared Code
**What:** Files/directories starting with `_` in `/api` are NOT deployed as serverless functions.
**When to use:** Database connections, schema definitions, validation helpers, shared utilities.
**Why:** Vercel convention. `api/_lib/db.ts` is importable by API routes but not exposed as `/api/_lib/db`.
[VERIFIED: vercel.com/docs and github.com/vercel/vercel/discussions/4983]

### Pattern 2: Neon HTTP Mode Connection
**What:** Use `neon()` HTTP driver (not WebSocket `Pool`) for stateless request-response.
**When to use:** All serverless functions -- each invocation is a single request.
**Example:**
```typescript
// api/_lib/db.ts
// Source: glow-up/src/db/index.ts (verified working pattern)
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}
const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })
```
[VERIFIED: glow-up codebase uses this exact pattern]

### Pattern 3: Web Standard Function Signatures (Vercel non-framework)
**What:** Vercel functions for non-framework projects use Web API Request/Response, NOT the old VercelRequest/VercelResponse.
**When to use:** All API routes in this project.
**Example:**
```typescript
// api/health.ts -- named export pattern
export function GET(request: Request) {
  return Response.json({ status: 'ok' })
}
```
Or for handling multiple methods in one file:
```typescript
// api/quiz.ts -- fetch handler pattern
export default {
  async fetch(request: Request) {
    if (request.method === 'POST') {
      const body = await request.json()
      // ... process
      return Response.json({ success: true })
    }
    return new Response('Method not allowed', { status: 405 })
  }
}
```
[VERIFIED: vercel.com/docs/functions/functions-api-reference]

### Pattern 4: Drizzle Schema with quiz_ Prefix
**What:** All table names prefixed with `quiz_` to avoid collision with glow-up tables in the same Neon instance.
**Example:**
```typescript
// api/_lib/schema.ts
import { pgTable, text, integer, real, timestamp, boolean, serial, jsonb } from 'drizzle-orm/pg-core'

export const quizLeads = pgTable('quiz_leads', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  prenom: text('prenom').notNull(),
  scoreTotal: integer('score_total').notNull(),
  scorePersonnel: integer('score_personnel').notNull(),
  scoreTravail: integer('score_travail').notNull(),
  scoreRetrait: integer('score_retrait').notNull(),
  stade: text('stade').notNull(),           // burnout level label
  answers: jsonb('answers'),                 // full Q&A array
  booked: boolean('booked').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const quizEvents = pgTable('quiz_events', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id'),            // UUID per quiz attempt
  eventType: text('event_type').notNull(),  // question_view, quiz_complete, email_submitted, etc.
  questionIndex: integer('question_index'), // 1-13 for question_view events
  metadata: jsonb('metadata'),              // flexible extra data
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```
[ASSUMED: schema design based on REQUIREMENTS.md and existing script.js payload structure]

### Anti-Patterns to Avoid
- **Using VercelRequest/VercelResponse types:** Deprecated for non-framework projects. Use Web Standard `Request` and `Response`. [VERIFIED: Vercel docs]
- **WebSocket mode for Neon:** Adds complexity (pooling, connection management) with zero benefit for stateless serverless functions. Use HTTP mode only. [VERIFIED: STACK.md research]
- **Putting shared code as regular files in /api:** Every `.ts` file in `/api` without underscore prefix becomes an endpoint. Use `_lib/` for shared modules. [VERIFIED: Vercel docs]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Database schema management | Manual SQL DDL files | drizzle-kit push | Type-safe schema sync, handles column types/defaults/constraints |
| DB connection pooling | Custom connection manager | @neondatabase/serverless HTTP mode | Purpose-built for serverless; handles cold starts automatically |
| TypeScript compilation for API | Custom build step | Vercel's built-in TS compilation | Vercel compiles `.ts` files in `/api` natively -- zero config needed |
| Environment variable management | Custom config loader | Vercel env vars + dotenv (local) | Vercel injects env vars at runtime; dotenv for local drizzle-kit commands |

**Key insight:** Vercel handles TypeScript compilation, routing, and deployment for `/api` directory functions automatically. The project needs zero build configuration for the serverless functions.

## Common Pitfalls

### Pitfall 1: Missing .gitignore for New Node.js Files
**What goes wrong:** `node_modules/`, `.env.local`, `.vercel/` directory committed to git.
**Why it happens:** Project has no `.gitignore` (currently no Node.js tooling).
**How to avoid:** Create `.gitignore` as first task before `npm init`.
**Warning signs:** Large git diff, secrets in repo.

### Pitfall 2: Static Files Not Served After Adding API Routes
**What goes wrong:** HTML files stop working or get 404 after Vercel deployment.
**Why it happens:** Vercel auto-detects framework. If it mistakenly picks a framework, it may not serve root static files.
**How to avoid:** Ensure vercel.json does NOT set `framework` to anything (or explicitly set to null). Vercel will serve static files from root and `/api` as functions.
**Warning signs:** HTML pages return 404 on Vercel but work locally.

### Pitfall 3: drizzle-kit push Fails Without DATABASE_URL
**What goes wrong:** `npx drizzle-kit push` errors with "missing DATABASE_URL".
**Why it happens:** drizzle-kit runs locally (not on Vercel), so it needs `.env.local` or explicit env var.
**How to avoid:** Use `dotenv` in drizzle.config.ts or set DATABASE_URL in shell before running.
**Warning signs:** Error during schema push step.

### Pitfall 4: TypeScript Config Conflict
**What goes wrong:** Vercel fails to compile API route TypeScript files.
**Why it happens:** tsconfig.json misconfigured (wrong target, missing module settings).
**How to avoid:** Keep tsconfig minimal -- Vercel handles compilation. Just need `strict: true`, `esModuleInterop: true`, `moduleResolution: "node"`.
**Warning signs:** Build errors on Vercel deploy.

### Pitfall 5: Neon Database Name Collision
**What goes wrong:** Quiz tables conflict with glow-up tables.
**Why it happens:** Both projects share the same Neon instance.
**How to avoid:** All quiz tables prefixed with `quiz_`. Alternatively, use a separate Neon database (not just schema) on the same project -- which Neon supports for free.
**Warning signs:** Table name errors during drizzle-kit push.

## Code Examples

### Verified: DB Connection (from glow-up)
```typescript
// api/_lib/db.ts
// Source: /Users/Enzo/glow-up/src/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}
const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })
```

### Verified: Drizzle Config (from glow-up)
```typescript
// drizzle.config.ts
// Source: /Users/Enzo/glow-up/drizzle.config.ts
import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
  schema: './api/_lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### Verified: Vercel Config for Static + API
```json
// vercel.json
// Source: vercel.com/docs/project-configuration/vercel-json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true
}
```

### Verified: Web Standard API Route (Vercel docs)
```typescript
// api/health.ts
// Source: vercel.com/docs/functions/functions-api-reference
export function GET(request: Request) {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}
```

### Minimal tsconfig.json for Vercel API Routes
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["api/**/*.ts", "drizzle.config.ts"],
  "exclude": ["node_modules"]
}
```
[ASSUMED: tsconfig based on standard Vercel + Drizzle patterns]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `VercelRequest/VercelResponse` handler signature | Web Standard `Request`/`Response` + named exports (GET/POST) or `export default { fetch }` | 2024-2025 | Must use new pattern for non-framework projects |
| `drizzle-kit generate` + `drizzle-kit migrate` | `drizzle-kit push` (for rapid development) | Available since drizzle-kit 0.20+ | Simpler for dev; push directly to DB without migration files |

**Deprecated/outdated:**
- `@vercel/node` package with `VercelRequest/VercelResponse`: Still works but superseded by Web Standard API for new projects [VERIFIED: Vercel docs show Web Standard as primary pattern for "other" framework]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `dotenv/config` import works in drizzle.config.ts for loading `.env.local` | Code Examples | drizzle-kit push fails locally -- fix: use shell `export DATABASE_URL=...` |
| A2 | Schema design (quiz_leads columns, quiz_events columns) matches future API needs | Architecture Patterns | Schema migration needed in Phase 2 -- low risk since drizzle-kit push handles changes |
| A3 | tsconfig.json settings are compatible with Vercel's TS compilation | Code Examples | Build failure on deploy -- fix: adjust based on Vercel error messages |
| A4 | Same Neon database instance as glow-up with table prefix is sufficient (vs separate database) | Common Pitfalls | Table name collision or shared connection issues -- low risk with prefix |

## Open Questions

1. **Neon database: same DB or separate DB?**
   - What we know: Neon free tier allows multiple databases per project. glow-up uses one DB.
   - What's unclear: Whether Enzo wants quiz data in the same database or a separate one.
   - Recommendation: Use same Neon project, separate database name (e.g., `burnout_quiz`). This keeps the DATABASE_URL distinct and avoids any prefix collision concerns entirely. If already using a shared DB, `quiz_` prefix is the fallback.

2. **Vercel project: new project or subdirectory of existing?**
   - What we know: burnout-quiz is a standalone repo at `/Users/Enzo/burnout-quiz/`.
   - What's unclear: Whether Enzo already has a Vercel project linked to this repo.
   - Recommendation: Create a new Vercel project for this repo. Link via `vercel` CLI or dashboard.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm, drizzle-kit, TypeScript | Yes | v24.13.1 | -- |
| npm | Package management | Yes | 11.8.0 | -- |
| Vercel CLI | Local dev, deployment | No | -- | Deploy via git push + Vercel dashboard |
| PostgreSQL (Neon) | Database | Remote only | -- | -- |

**Missing dependencies with no fallback:**
- None -- all critical tools available locally.

**Missing dependencies with fallback:**
- Vercel CLI not installed locally. Fallback: deploy via Vercel dashboard (connect GitHub repo) or install with `npm i -g vercel`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently -- no test framework in project |
| Config file | None |
| Quick run command | `npx drizzle-kit push --dry-run` (schema validation) |
| Full suite command | N/A for this phase |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Static files served on Vercel URL | smoke | `curl -s https://{vercel-url}/ \| grep -q '<html'` | N/A -- manual after deploy |
| INFRA-02 | quiz_leads and quiz_events tables exist in Neon | smoke | `npx drizzle-kit push` (creates tables if missing) | N/A -- Wave 0 |
| INFRA-03 | TypeScript types generated from schema | static | `npx tsc --noEmit` (type-checks API code) | N/A -- Wave 0 |
| INFRA-04 | drizzle-kit push succeeds | smoke | `npx drizzle-kit push` | N/A -- Wave 0 |
| INFRA-05 | Env vars configured | manual-only | Check Vercel dashboard | N/A |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type-check)
- **Per wave merge:** `npx drizzle-kit push --dry-run` (schema validation without DB write)
- **Phase gate:** Successful `drizzle-kit push` to Neon + Vercel deployment serves static files

### Wave 0 Gaps
- [ ] `package.json` -- needs initialization (`npm init -y`)
- [ ] `tsconfig.json` -- TypeScript configuration for API routes
- [ ] `.gitignore` -- must cover node_modules, .env.local, .vercel
- [ ] `drizzle.config.ts` -- drizzle-kit configuration

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 1 is infrastructure only -- no auth endpoints yet |
| V3 Session Management | No | No sessions in this phase |
| V4 Access Control | No | No protected endpoints in this phase (dashboard auth is Phase 5+) |
| V5 Input Validation | No | No user input handling in this phase |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| DATABASE_URL exposure in git | Information Disclosure | `.gitignore` for `.env.local`; Vercel env vars for production |
| DASHBOARD_TOKEN in source | Information Disclosure | Environment variable only, never hardcoded |

**Note:** This phase is infrastructure-only. Security becomes critical in Phase 2 (API routes with input validation) and Phase 5 (dashboard token auth).

## Project Constraints (from CLAUDE.md)

Actionable directives from CLAUDE.md that constrain this phase:
- **Code language:** All code in English (variable names, function names, file names, comments)
- **UI language:** All visible content in French (not applicable for this phase -- no UI changes)
- **Stack:** Vercel (static + serverless API routes) + Neon PostgreSQL -- no new services
- **Simplicity:** Keep HTML/CSS/JS static approach -- do NOT migrate to Next.js
- **No build step for frontend:** Static files served as-is
- **Naming:** camelCase for JS/TS variables, kebab-case for file names
- **GSD workflow:** All edits through GSD commands

## Sources

### Primary (HIGH confidence)
- [Vercel Functions API Reference](https://vercel.com/docs/functions/functions-api-reference) -- Web Standard handler signatures, named exports
- [Vercel Functions Quickstart](https://vercel.com/docs/functions/quickstart) -- `export default { fetch }` pattern for non-framework
- [glow-up/src/db/index.ts](/Users/Enzo/glow-up/src/db/index.ts) -- Proven Neon + Drizzle connection pattern
- [glow-up/src/db/schema.ts](/Users/Enzo/glow-up/src/db/schema.ts) -- Proven Drizzle schema pattern
- [glow-up/drizzle.config.ts](/Users/Enzo/glow-up/drizzle.config.ts) -- Proven drizzle-kit configuration
- npm registry -- Version verification for all packages

### Secondary (MEDIUM confidence)
- [Vercel community discussion on _lib convention](https://github.com/vercel/vercel/discussions/4983) -- underscore prefix excludes from routing
- [vanilla-vercel-functions example](https://github.com/yo-iwamoto/vanilla-vercel-functions) -- Static + API coexistence pattern
- [Vercel cleanUrls documentation](https://vercel.com/docs/project-configuration/vercel-json) -- Extensionless HTML paths

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- exact versions verified on npm, proven in glow-up project
- Architecture: HIGH -- Vercel docs confirm static + `/api` coexistence, `_lib` convention verified
- Pitfalls: MEDIUM -- based on experience patterns, some assumptions about tsconfig

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable infrastructure, unlikely to change)
