# Phase 1: Database & Vercel Foundation - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — discuss skipped)

<domain>
## Phase Boundary

A working Vercel deployment with Neon PostgreSQL tables ready to receive quiz data. Project deployed on Vercel with static files + API routes. Neon database with quiz_leads and quiz_events tables. Drizzle ORM schema with TypeScript types. Environment variables configured.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Use ROADMAP phase goal, success criteria, and codebase conventions to guide decisions.

Key constraints from research:
- Use @neondatabase/serverless + drizzle-orm (same as glow-up project)
- HTTP mode (not WebSocket) for serverless functions
- Table names prefixed with `quiz_` to avoid collision with glow-up
- Vercel serves static HTML + /api serverless functions from same project
- TypeScript for API routes, vanilla JS for frontend

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing `index.html`, `resultats.html`, `appel.html`, `script.js`, `style.css` — must continue working as-is after deployment
- glow-up project has proven Neon + Drizzle pattern to reference

### Established Patterns
- No package.json currently — needs initialization
- No build step — static files served directly
- CSS custom properties for theming (dark theme)

### Integration Points
- Current webhook URLs in script.js (`WEBHOOK_URL`, `PING_URL`) will be migrated in Phase 3-4
- Vercel deployment must serve existing static files at same paths

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Refer to ROADMAP phase description and success criteria.

</specifics>

<deferred>
## Deferred Ideas

None — infrastructure phase.

</deferred>
