# postgres-deploy

Feature document created 2026-10-02. Branch: `experiment/kaiten-hero-moderno`.
Follows `admin-demo-hardening.md`, `demo-polish.md`, `admin-menu-search.md`, `admin-menu-forms.md`.

## Goal

Make the client demo survive on Vercel. The blocker is the database: the schema uses SQLite
(`file:./dev.db`), and serverless functions have a read-only filesystem, isolated instances and no
file tracing for the database file, so runtime reads/writes cannot be trusted. Moving to a hosted
Postgres (Neon/Supabase free tier) makes the admin actually persist and removes the last risk that
can kill the demo.

## Authorized scope

User instruction: "procede con el orden sugerido", where the suggested order was
(1) verify the Vercel preview, (2) the database decision — recommended: free hosted Postgres,
(3) credentials hint in the login, (4) optional tabs.

In scope:
- T1 — Do not fall back to the public repository secret in production (security, see below).
- T2 — Document the real environment variables the deploy needs, including the missing ones.
- T3 — Development-only credentials hint under the admin login form.
- T4 — Switch the datasource to Postgres, push the schema, seed and smoke test (BLOCKED on the user pasting the connection string).

## Why T1 is in this feature

`src/lib/auth.ts` did `process.env.NEXTAUTH_SECRET || "sushi-dev-secret-change-in-production-1234567890"`.
That fallback string is public in the repository, and the admin session cookie is just an
HMAC-SHA256 of a payload that carries `role: "ADMIN"`. On a public URL, anyone could forge an admin
cookie if the variable is missing. A deployed demo must fail closed instead.

## Non-goals (documented follow-ups)

- Prisma migration history (`prisma migrate`): the project uses `prisma db push` + seed on every build, and the seed is idempotent (verified), so `db push` stays.
- Read-only demo mode with SQLite (the fallback path if the user prefers not to host a database).
- Paid databases, connection pooling tuning, CI pipelines.
- Dead code removal: `src/lib/auth.config.ts` is a NextAuth v5 leftover that nothing imports (the real auth is the custom cookie auth in `src/lib/auth.ts`).

## TDD mode

`disabled`. No runnable unit runner; Playwright e2e cannot run (no chromium build). No local Postgres
either (no Docker, no psql), so the runtime verification of T4 happens against the user's hosted
database: `prisma db push`, `pnpm seed`, then the app + admin login + a create/edit/delete cycle.
T1 is verified with a `ts-node` script that simulates production without the variable.

## Tasks

- [x] T1 — `NEXTAUTH_SECRET` must fail closed in production (public fallback removed).
- [ ] T2 — `.env.example` documents the Postgres URL, `NEXT_PUBLIC_SITE_URL` and the secret. BLOCKED: the harness safety policy denies writing to `D:/sushi/.env.example`; needs an explicit decision from the user.
- [x] T3 — Development-only credentials hint under the admin login form.
- [ ] T4 — Provider switch + `db push` + seed + smoke test against the hosted Postgres (blocked on the connection string).

## Acceptance criteria

- In production with `NEXTAUTH_SECRET` missing or shorter than 16 chars, signing and verifying a session throws a descriptive error instead of using a public default; the login route answers with a clear message and the public site keeps working.
- `.env.example` lists every variable the deploy needs: `DATABASE_URL` (Postgres URL), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`.
- The login form shows the seed credentials only when `NODE_ENV !== "production"`.
- After T4: the schema is pushed to Postgres, the seed runs idempotently (33 products, 7 categories, 1 admin), the app reads and writes, and `/admin` login works on the deployed URL.

## Delivery

- `ask-on-risk`. Commit granularity requested again before committing (standing user rule).

## Progress

- 2026-10-02: feature doc created; T1 and T3 implemented and verified. T2 blocked by the harness safety policy. T4 blocked on the user's connection string.

## Verification evidence

- T1 (behavioural test with `ts-node`, flipping the environment inside one process): production without `NEXTAUTH_SECRET` → `encodeSession` throws; production with a 5-character secret → throws; production with a 32-character secret → signs a 156-char cookie; development without the secret → signs with the local fallback and `decodeSession` round-trips the payload. `isAuthSecretConfigured()` returns false in the first case. Also removed the dead `export { SECRET }` (nothing imported it) and the login route now logs the error and answers with an explicit message when the secret is missing.
- T3 (browser): `/admin/login` in development shows `Entorno de desarrollo — credenciales del seed: admin@sushi.local admin123`; the form still works (browser login lands on `/admin/dashboard`, `POST /api/auth/login` returns 200). In production the block is a compile-time `NODE_ENV` branch of a client component, so it disappears from the bundle; proving that needs a production build, which is pending because the user's dev server holds `.next`.
- `tsc --noEmit` exit 0; `eslint` exit 0 with one pre-existing warning (`signed` unused in the login route, present before this change).

## Commit evidence

- Pending explicit commit authorization from the user.
