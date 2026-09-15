# CashTracker Frontend

Personal finance app built with [Next.js](https://nextjs.org) 16 (App Router), React 19 and
TypeScript. Users organise spending into **envelopes**, record **expenses** against them, and
classify them with **categories**.

Ships in Spanish and English.

## Requirements

- **Node.js 22.x** (`>=22 <25`)
- **pnpm 11.x** — the package manager is pinned in `package.json`, and the lockfile is
  `pnpm-lock.yaml`. Other package managers will resolve a different dependency tree, and CI
  installs with `--frozen-lockfile`.
- A running [cashtracker-backend](https://github.com/Evhorus/cashtracker-backend) on port 4000
- A [Clerk](https://clerk.com) development instance

## Setup

```bash
git clone https://github.com/Evhorus/cashtracker-frontend.git
cd cashtracker-frontend
pnpm install
cp .env.template .env      # then fill it in - see below
pnpm dev                   # http://localhost:4001
```

### Environment

`.env.template` lists every variable. They are validated at boot by
`src/shared/config/env.server.ts`, so an incomplete `.env` fails immediately with a message
naming the variable rather than erroring later on some request.

| Variable                                       | What it is                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `API_URL`                                      | Backend base URL, e.g. `http://localhost:4000/api`                                                       |
| `NEXT_PUBLIC_URL`                              | This app's own origin — what `sitemap.xml` and `robots.txt` advertise                                    |
| `CLERK_SECRET_KEY`                             | Clerk secret key (`sk_test_…`)                                                                           |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`            | Clerk publishable key (`pk_test_…`)                                                                      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`                | `/sign-in` — **not optional**: without it Clerk sends users to its own hosted page instead of this app's |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Where a user lands after signing in                                                                      |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Where a user lands after signing up                                                                      |
| `E2E_CLERK_USER_EMAIL`                         | Only for the signed-in e2e suite — point it at a dedicated test user                                     |

## Commands

| Command                             | What it does                                                    |
| ----------------------------------- | --------------------------------------------------------------- |
| `pnpm dev`                          | Dev server with Turbopack on **port 4001**                      |
| `pnpm build` / `pnpm start`         | Production build / serve                                        |
| `pnpm typecheck`                    | `tsc --noEmit`                                                  |
| `pnpm lint`                         | ESLint                                                          |
| `pnpm format` / `pnpm format:check` | Prettier write / verify                                         |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                          |
| `pnpm test:e2e`                     | Playwright, signed-out suite                                    |
| `pnpm test:e2e:signed-in`           | Playwright, signed-in suite (needs the backend and a test user) |

## Tests

**Vitest** covers logic that would be expensive to get wrong — money formatting, calendar
dates, pagination, status derivation, the price input's typing rules, and that the two
message catalogues agree. It runs in about two seconds and is part of CI.

**Playwright** covers what only a browser can answer, split by what each suite costs to run:

- **`e2e/signed-out/`** (`pnpm test:e2e`) — auth redirects, the locale cookie, page titles and
  the sign-in/sign-up forms. Needs Clerk keys and nothing else, so **this suite runs in CI on
  every pull request**.
- **`e2e/signed-in/`** (`pnpm test:e2e:signed-in`) — envelope, expense and category
  lifecycles, plus form validation. Signs in once via a Clerk ticket (no password stored
  anywhere) and reuses the session. **These tests create and delete real rows**, so point
  `E2E_CLERK_USER_EMAIL` at a dedicated test account, never at production.

Which folder a spec lives in decides which suite runs it — both projects match by glob, so a
spec is never silently left out.

## Project structure

Domain-driven. Rather than a literal tree that goes stale with every feature, this is the
pattern each business domain repeats — today `envelopes`, `expenses`, `categories`,
`dashboard`, `auth`, `account`, `home`, `locale`:

```
src/
├── app/                    # App Router: routes, layouts, route groups
│   ├── (auth)/             # Public authentication routes
│   ├── (home)/             # Public landing page
│   └── dashboard/          # Protected routes (auth.protect() per layout/page)
├── features/
│   └── <domain>/           # One module per business domain, same shape throughout:
│       ├── actions/        # Server Actions (orchestration)
│       ├── components/     # Domain-specific components
│       ├── data/           # server-only read functions for SSR
│       ├── schemas/        # Zod validation
│       ├── services/       # API calls and external logic
│       │                   #   (auth uses hooks/ instead: its provider exposes
│       │                   #   React hooks rather than plain async functions)
│       ├── mappers/        # API <-> domain model transformation
│       ├── messages/       # This domain's es.json / en.json
│       └── types/          # Domain TypeScript types
└── shared/                 # Everything belonging to no domain.
    ├── components/ui/      #   shadcn-style primitives, built on Base UI
    ├── components/common/  #   Composition primitives with no domain knowledge
    ├── config/             #   env.server.ts and i18n
    ├── hooks/  lib/  utils/  providers/
```

**No domain word is allowed under `src/shared/`** — no `Envelope` type, no import from
`@/features/*`. That single sentence is the rule, and it is checkable at a glance.

Full conventions — form patterns, error handling, cache invalidation, i18n rules — are in
[`CLAUDE.md`](./CLAUDE.md).

## How a change lands

`main` is protected and direct pushes are rejected, including for admins:

```bash
git checkout -b type/short-name
git push -u origin type/short-name
gh pr create --fill
gh pr merge --squash --delete-branch    # once `verify` is green
```

Husky runs typecheck, lint, format:check and Vitest before each commit, and commitlint checks
the message against Conventional Commits. CI runs the same set — a local hook is skippable
with `--no-verify`, so CI is the gate that counts.

Dependabot opens grouped minor/patch updates weekly and merges them itself once `verify`
passes; majors wait for a human.

## Tech

|               |                                                                           |
| ------------- | ------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19                                         |
| Auth          | Clerk (`@clerk/nextjs` v7), custom UI on Clerk's hooks                    |
| UI            | Base UI via shadcn/ui, Tailwind CSS 4                                     |
| Validation    | Zod 4 + React Hook Form 7                                                 |
| i18n          | next-intl 4 — locale is a cookie, so URLs are identical in both languages |
| Charts        | Recharts 3                                                                |
| Dates         | date-fns 4                                                                |
| Notifications | Sonner 2                                                                  |
| Tests         | Vitest, Playwright                                                        |

## Deployment

Deployed on [Vercel](https://vercel.com). Every push to a branch gets its own preview
deployment; every merge to `main` deploys to production.
