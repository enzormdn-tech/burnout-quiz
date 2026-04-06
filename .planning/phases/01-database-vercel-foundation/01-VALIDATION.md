---
phase: 01
slug: database-vercel-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-06
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework for this infrastructure phase |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx tsc --noEmit` |
| **Full suite command** | `npx tsc --noEmit && npx drizzle-kit push --dry-run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npx drizzle-kit push --dry-run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | — | N/A | integration | `curl -s $VERCEL_URL \| grep quiz` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-03 | — | N/A | type-check | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | INFRA-02 | — | N/A | integration | `npx drizzle-kit push --dry-run` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | INFRA-04 | — | N/A | cli | `npx drizzle-kit push` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | INFRA-05 | — | N/A | manual | `vercel env ls` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — initialize with dependencies
- [ ] `tsconfig.json` — TypeScript configuration
- [ ] `api/_lib/db.ts` — database connection module
- [ ] `api/_lib/schema.ts` — Drizzle schema definitions

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vercel deployment serves quiz HTML | INFRA-01 | Requires live deployment | Visit Vercel URL, verify quiz loads |
| Env vars configured in Vercel | INFRA-05 | Vercel dashboard setting | Run `vercel env ls`, verify DATABASE_URL and DASHBOARD_TOKEN present |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
