# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- Development: `pnpm run dev` (starts Next.js dev server with Turbopack)
- Build: `pnpm run build` (builds the application for production)
- Start: `pnpm run start` (starts the production server)
- Lint: `pnpm run lint` (runs ESLint)
- Typecheck: `pnpm run typecheck` (`tsc --noEmit`)
- Format: `pnpm run format` (write) / `pnpm run format:check` (verify)

## End-to-end tests

`pnpm test:e2e` (Playwright, `e2e/*.spec.ts`). **Local only — not part of the `verify` CI
job**, and that is deliberate: running them in CI needs a backend, a seeded database and
Clerk test credentials as repository secrets. Until that exists, a CI suite that cannot
pass is worse than one that lives locally.

Two projects, because they cost different things to run:

- **`signed-out`** (`pnpm test:e2e`) — no fixture, no credentials, nothing seeded. Runs
  anywhere the app runs, which is why it is the default.
- **`signed-in`** (`pnpm test:e2e:signed-in`) — needs `E2E_CLERK_USER_EMAIL` and a running
  backend. `e2e/global.setup.ts` signs in once via `@clerk/testing` (ticket strategy, so
  no password is stored anywhere) and saves the session for the suite to reuse.
  **These tests create and delete real rows** against whatever account that variable
  names, so point it at a dedicated test user — never at production.

Scoped to what only a browser can answer — that `auth.protect()` really redirects a
signed-out visitor, that the `NEXT_LOCALE` cookie survives a reload and a navigation, and
that an expense actually moves its envelope's spent amount. That last one is the only
thing that verifies the cache tags: `updateTag` on a name nothing is cached under is not
an error, so a wrong tag is invisible to typecheck, lint and Vitest alike and shows up
only as a number that failed to move.
Everything decidable without a browser stays in Vitest, which runs in two seconds.
`playwright.config.ts` reads `NEXT_PUBLIC_URL` from `.env` rather than hardcoding the
port, and `webServer.reuseExistingServer` means it uses a `pnpm dev` you already have up.

**All three suites were verified by mutation, and the results differ usefully**:

| Mutation                                                 | Caught?                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cookie read removed in `i18n/request.ts`                 | yes, immediately                                                                                                                                                   |
| `revalidatePath` removed from `create-expense.action.ts` | yes — the money path fails on the derived percentage                                                                                                               |
| `auth.protect()` commented out in `dashboard/layout.tsx` | **no** — the app guards in three layers (that layout, each page's own call, and `authenticatedFetch`), so that suite catches a total regression, not a partial one |
| A cache tag renamed consistently inside its registry     | **no, and correctly** — producer and consumer both read the registry, so a consistent rename is harmless by construction. That is what the registry is for         |

Assert on **derived** values where you can (`25.0% del límite`) rather than raw amounts: a
derived figure can only be right if the value was both re-read and recalculated, and raw
amounts are rendered several times over, some in responsive duplicates that are present
but hidden.

When you add a spec, mutate the thing it covers and watch it fail before trusting it.

## Gates

The five commands above are the gate set, and they run in two places:

- **`.husky/commit-msg`** — `commitlint`, Conventional Commits. Milliseconds, and it is
  the one check guarding something the others cannot reach: a malformed message is in
  the history the instant it lands, and removing it means rewriting history.
- **`.husky/pre-commit`** — typecheck, lint, format:check, test (~5s).
- **`.github/workflows/ci.yml`** — all five, on every PR and every push to `main`.

CI is the gate that counts: a Husky hook is skippable with `--no-verify`, so it catches
the distracted mistake but guarantees nothing. Keep both lists in step — if you add a
command to one, add it to the other.

**There is no `pre-push` hook, deliberately.** There was one, and branch protection made
it redundant: every push now goes to a feature branch that CI checks anyway, and nothing
can merge without `verify` green. All it bought was learning about a failure ~80 seconds
sooner, at the cost of ~9 seconds on every push — including pushes of half-finished work
you only want backed up. Re-adding it would need a reason that isn't "belt and braces".

## Dependency updates

`.github/dependabot.yml`, weekly on Monday. Two ecosystems: `npm` (which is what covers
pnpm — there is no separate `pnpm` value, and it reads `pnpm-lock.yaml` at lockfileVersion
9.0) and `github-actions`, so the workflow's own pinned actions do not go stale silently.

**Minor and patch updates arrive as one grouped PR; majors are deliberately not grouped.**
Ungrouped, a quiet week still opens a dozen PRs, and a dozen PRs nobody reads is how
Dependabot ends up switched off. A major, by contrast, is a migration that deserves its
own PR and its own decision — Next, React and Clerk especially.

This is only worth having because `verify` runs on every PR: a bump either passes the same
five gates a human change does or it does not, so the grouped PR is usually a merge without
reading the diff. `commit-message.prefix` is set because Dependabot's default ("Bump x from
y to z") has no Conventional Commits type, and squash-merging takes the PR title — so
without it, `commitlint` would reject the merge.

**Minor and patch bumps merge themselves; majors wait for a human.**
`.github/workflows/dependabot-auto-merge.yml` reads the semver jump with
`dependabot/fetch-metadata` and, for anything below a major, runs `gh pr merge --squash
--auto`. That is the weekly decision written down, not a bypass: auto-merge queues the PR
behind the same branch protection a human PR goes through, so a red `verify` just leaves it
open. Two details make it work — `allow_auto_merge` on the repo (off by default; without it
the `gh` call fails), and the explicit `permissions:` block, because a workflow Dependabot
triggers gets a read-only `GITHUB_TOKEN` and can read no repository secret. On a **grouped**
PR `update-type` is the highest jump in the group, which is what covers the `github-actions`
group: unlike `npm` it is not restricted to minor and patch, so one major there holds the
whole PR back.

The `dependencies` and `github-actions` labels have to exist in the repo; Dependabot
silently skips labels it cannot find.

## Branch protection

`main` is protected, and **direct pushes to it are rejected — including for admins**
(`enforce_admins`). Every change goes through a pull request:

```
git checkout -b type/short-name     # work, commit (hooks run)
git push -u origin type/short-name
gh pr create --fill                 # CI runs
gh pr merge --squash --delete-branch # merges once `verify` is green
```

The required check is named **`verify`** — that is `jobs.verify` in `ci.yml`, not the
workflow's `name: CI`. Renaming that job breaks the rule silently: GitHub waits forever
for a check that never arrives and every PR blocks. If you rename it, update the
protection rule in the same change.

Other settings and why: `strict` (the branch must be up to date with `main` before
merging, so the check ran against what actually lands), `required_linear_history` (squash
or rebase, no merge commits), `required_conversation_resolution`, and no force-push or
deletion of `main`. Approvals are set to **0** on purpose — GitHub does not let you
approve your own PR, so requiring one would leave a solo maintainer unable to merge
anything. The PR is the gate; the approval is not.

Read it back with `gh api repos/Evhorus/cashtracker-frontend/branches/main/protection`.

No `lint-staged`, deliberately: the whole set runs in under ten seconds on this repo,
which is cheaper than maintaining the machinery to run it on only the staged files.
Revisit when a Playwright suite exists — `pre-push` is where that goes, never
`pre-commit`. Note that speed is the argument against `lint-staged` only; it was never
the argument against `commitlint`, which gates the message rather than the tree.

`commitlint` runs stock `config-conventional` with no overrides — the history already
matched it before it was added. Expect occasional **warnings** (`footer-leading-blank`,
`body-leading-blank`) on commits whose prose contains a line starting with `word:`; the
conventional-commits parser reads that as the start of a footer. Warnings exit 0 and
never block. Errors — a missing or unknown type, an empty subject — exit 1 and do.

CI's `build` step passes **placeholder** env values, not repository secrets. `env.server.ts`
validates the environment at boot and `next build` boots the app to prerender `robots.txt`
and `sitemap.xml`, so values of the right _shape_ are needed — but not real ones, since
every route that talks to the API or to Clerk is dynamic. That also lets CI run on forks.
Locally it is different: `pre-push` runs the same build against your real `.env`, so an
incomplete one fails the push naming the missing variable.

- Test: `pnpm test` (Vitest, single run) / `pnpm run test:watch`
  - Mostly unit tests of pure logic in a `node` environment:
    `date-helpers`, `format-currency`, `pagination`, `EnvelopeHelpers`,
    `ExpenseHelpers`, `dashboard-summary`, and the expense mapper.
  - Component tests opt into a DOM per file with a
    `@vitest-environment jsdom` docblock, so the rest don't pay for one.
    Only `price-input.test.tsx` does today - it is the one piece of
    intricate logic living inside a component rather than a function.
  - Config is `vitest.config.mts`, which pins `TZ=America/Bogota`. That is
    deliberate: half of `date-helpers.ts` exists to keep a calendar date from
    being timezone-converted while a real instant is, and under `TZ=UTC` those
    two behaviours are indistinguishable, so the tests would pass even if the
    distinction were broken.
  - Coverage is deliberate, not exhaustive: logic that would be
    expensive to get wrong (money formatting, calendar dates, status
    derivation, the price input's typing rules). Presentational
    components are not tested.

## Architecture Overview

This is a Next.js 16 project using the App Router and TypeScript.

### Project Structure

- `src/app/`: Next.js App Router. Contains route segments and layouts.
  - `(auth)/`: Authentication routes (custom UI on top of Clerk, see `src/features/auth/`).
  - `(home)/`: Public landing page routes.
  - `dashboard/`: Protected routes for the main application.
- `src/features/`: Domain-driven modules (e.g. `envelopes`, `expenses`, `dashboard`, `auth`). Each feature folder generally contains:
  - `actions/`: Server Actions for data fetching and mutations.
  - `components/`: Domain-specific React components.
  - `schemas/`: Zod validation schemas for inputs and API responses.
  - `services/`: API client wrappers and external service logic.
  - `types/`: TypeScript type definitions for the domain.
  - `mappers/`: Data transformation logic between API and UI.
  - `data/`: `server-only` read functions for SSR (caching + auth check), delegating to
    `services/`. Deliberately not Server Actions: a `"use server"` read compiles to a
    public POST endpoint, which is attack surface given away for nothing.
  - `constants/`, `providers/`, `lib/`: where a feature needs them (e.g.
    `features/dashboard/constants/nav-items.ts`, `features/categories/providers/`).
  - Not every feature has every folder — `auth` deliberately has no `services/`; it uses
    `hooks/` instead, because its underlying provider (Clerk) exposes React hooks
    (`useSignIn`/`useSignUp`/`useUser`/...) rather than plain async functions callable from
    Server Actions. Those hooks are the _only_ files in the feature allowed to import the
    provider SDK directly — components only ever consume what the hook returns
    (`fieldErrors`, `globalErrors`, action functions), so swapping providers later means
    rewriting `features/auth/hooks/*`, not chasing imports across every component.
- `src/shared/`: everything that belongs to no domain. **No domain word is allowed under
  `src/shared/` — no `Envelope` type, no import from `@/features/*`.** That sentence is
  the whole rule, and it is checkable at a glance; the previous layout (five cross-cutting
  folders sitting as siblings of `app/` and `features/`) was not.
  - `src/shared/components/ui/`: base primitives (shadcn-style, built on Base UI — see
    Key Technical Choices). Regenerable via `shadcn add --overwrite`; `components.json`
    points its aliases here.
  - `src/shared/components/common/`: composition primitives with no domain knowledge
    (`FormInput`, `SubmitButton`, `PriceInput`, `EmptyState`, `SearchInput`, `Typography`…).
    The test for admission is a dependency, not a vibe: **if only one feature uses it, it
    belongs to that feature — even if it is "reusable in theory"**, and if it names a
    business concept (`CurrencySelector`, `HeroBalanceCard`) it belongs to the feature even
    when two features use it. That is why the dashboard shell (`dashboard-sidebar`,
    `custom-header`, `mobile-nav`, `nav-items`, `breadcrumb`, `page-header`,
    `monthly-spending-chart`) lives in `features/dashboard/`, not here: `page-header`
    renders `Breadcrumb`, which reads `DASHBOARD_NAV_ITEMS`, so putting it in `shared/`
    would point a shared module at a feature.
  - `src/shared/hooks/`: shared custom React hooks.
  - `src/shared/utils/`: **pure** functions only — `format-currency`, `date-helpers`,
    `pagination`. No side effects, no `server-only`, no SDK. Their tests sit next to them
    and run in the `node` environment.
  - `src/shared/lib/`: runtime helpers, which is the opposite — `api-client`,
    `authenticated-fetch` (`server-only` + Clerk), `safe-action`, `validation`, and
    shadcn's `utils.ts` (`cn`). The split exists so that importing from a folder tells you
    whether you are dragging in `server-only` or Clerk.
  - `src/shared/config/`: `env.server.ts` (see Environment below) and `i18n/`.
  - `src/shared/providers/`: only `theme-provider.tsx`. `categories-provider` is domain and
    lives in `features/categories/providers/`.
- `src/proxy.ts`: Proxy configuration for routing. Auth gating is **not** done here — see below.
- `src/instrumentation.ts`: boot hook; its only job is importing `env.server.ts` — see Environment.
- **One path alias, `@/*` → `./src/*`.** The five folder-specific aliases that used to
  exist (`@/lib/*`, `@/hooks/*`, …) were removed deliberately: they would have let stale
  imports keep resolving through a move like this one instead of failing.

#### Environment

- `process.env` is read in **exactly one place**: `src/shared/config/env.server.ts`, a
  Zod-validated `server-only` module. `src/instrumentation.ts` imports it, so an incomplete
  `.env` fails **at boot** with a message naming the variable, not on the first request.
- `server-only` is what makes it safe to validate `CLERK_SECRET_KEY` there — importing the
  module from a Client Component is a build error.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is validated in the **server** schema on purpose: a
  missing key should break the server render with a legible message rather than blank the
  screen after the bundle has already shipped. There is no `env.client.ts`, because no
  Client Component in this app reads `process.env` — add one only when that stops being true.

### Key Patterns

#### Auth Gating

- Per Clerk's current guidance, session/route protection is done at the resource level
  (`auth()` + `redirect()`, or `auth.protect()`) inside layouts/pages — e.g.
  `src/app/dashboard/layout.tsx`, `src/app/(auth)/layout.tsx` — **not** in middleware.
  `src/proxy.ts` stays a bare `clerkMiddleware()`.

#### Forms & Validation

- **Presentational UI**: Forms are decoupled from submission logic. Components receive `onSubmit`, `isLoading`, and `defaultValues` as props.
- **Schema-Driven**: Use `react-hook-form` with `zod` resolvers. Wrap custom inputs in the `Controller` component; for a plain text/email/password field, prefer the reusable `FormInput` (`src/shared/components/common/form-input.tsx`) over writing a `Controller` by hand.
- **Submission Flow**: Parent components (e.g., Dialogs) use `useActionState` and `startTransition` to dispatch data to Server Actions.
- **Error styling**: Fields flip to a red border via `aria-invalid` (already baked into the Tailwind classes of `Input`/`Textarea`/`CurrencySelector`/`Button`) whenever `fieldState.invalid` is true or a server-side error applies to that field. Per-field messages use the lightweight `FieldError` (`src/shared/components/ui/field.tsx`), not `ErrorMessage`; `ErrorMessage` (`src/shared/components/common/error-message.tsx`) is reserved for global/account-level errors that aren't tied to one field.

#### Internationalisation

- The app ships in Spanish and English (`next-intl` 4).
- **Messages live with the feature that renders them**: each feature has its own
  `messages/es.json` + `messages/en.json` holding just its namespace(s) — same
  reasoning that co-locates its actions, schemas and components. What belongs to
  no feature (`common`, `validation`, `nav`, `pagination`, `errors`, `theme`,
  `currencies`) is in `src/shared/config/i18n/messages/`; the landing page's copy is in
  `src/features/home/messages/`.
- `src/shared/config/i18n/messages.ts` assembles them into one catalogue per locale. It spreads
  whole top-level namespaces, so **no two files may claim the same namespace** —
  the merge would silently keep one and drop the other. `messages.test.ts`
  asserts that, plus that nothing is lost in the merge and that both languages
  split into the same files.
- Spanish is the reference language. `src/shared/config/i18n/messages.test.ts` fails the build
  if the two drift: missing keys, mismatched ICU placeholders, empty strings,
  untranslated copy-paste.
- `src/global.d.ts` augments next-intl's `AppConfig` with the merged Spanish
  shape, so every `t("...")` key is checked by `tsc`. A typo is a build error,
  not a runtime `MISSING_MESSAGE`.
- **No user-facing string belongs in a `lib/`, `schemas/` or `constants/` module.**
  Those are shared by every locale. Where a module used to hold labels it now
  holds keys or plain values, translated at the point of render:
  `ENVELOPE_STATUS_FILTER_VALUES`, `EXPENSES_PAGE_SIZE_OPTIONS`,
  `CATEGORY_TYPE_FILTERS`, `DASHBOARD_NAV_ITEMS`, `features.ts`.
- Form schemas are **factories** taking the `validation` translator
  (`buildEnvelopeFormSchema(t)`, `buildExpenseSchema(currency, t)`, ...) — see
  `src/shared/lib/validation.ts`. Only Client Components use them, as react-hook-form
  resolvers, so a `useTranslations("validation")` in the form is enough.
- Date formatters in `src/shared/utils/date-helpers.ts` take the locale explicitly.
  Server Components get it from `getLocale()`, Client Components from
  `useLocale()`.
- Server Actions write their own success toasts via `getTranslations` rather
  than echoing the backend's `{ message }`, which is Spanish only. Same reason
  the dashboard summary endpoint now reports `month: "2026-08"` instead of a
  formatted `label: "Ago 2026"` — a month name is presentation, and the API has
  more than one kind of reader.
- The locale is a **cookie** (`NEXT_LOCALE`), not a route segment — URLs are the
  same in both languages. `src/shared/config/i18n/config.ts` explains the trade-off.
- The catalogues are imported **statically** in `src/shared/config/i18n/messages.ts`. A
  template-literal `await import()` left the bundler no static edge to the JSON,
  so edits during `next dev` never invalidated and every newly added key logged
  MISSING_MESSAGE until a server restart. It is also what keeps the merged shape
  statically known, which the type augmentation above needs.
- Clerk's own strings follow the locale too, via `src/shared/config/i18n/clerk-localization.ts`.
- Page titles use `generateMetadata`, never a module-level `metadata` object: a
  constant is evaluated once with no request, and so no locale, in scope.

#### API & Data Flow

- **Boundary Validation**: All API responses are validated at the network boundary using Zod schemas within `fetchApi` (`src/shared/lib/api-client.ts`) to prevent corrupt data from reaching the UI.
- **Bidirectional Mapping**:
  - `toApiRequest` (Outbound): Transforms UI models to API formats, including locale-specific formatting (e.g., removing Colombian currency dots).
  - `fromApi` (Inbound): Transforms raw API responses (e.g., ISO date strings) into rich domain models (e.g., JavaScript `Date` objects).
- **Type Separation**: Maintain a strict distinction between API types (raw server response) and Domain types (UI-optimized models).
- **Transport vs. Contract**: Communication is split between `authenticated-fetch.ts` (Transport/Auth) and `api-client.ts` (Validation/Contract), both under `src/shared/lib/`.

#### Server Actions & State

- **Safe Actions**: Wrap all actions with `createSafeAction` (`src/shared/lib/safe-action.ts`) for standardized error handling.
- **Service Layer**: Actions must delegate business logic to a Service class (e.g., `EnvelopesService`) rather than implementing it directly. (Exception: `auth`, see Domain Organization below.)
- **Cache Invalidation**: `revalidatePath` for a route, `updateTag` for a tagged read.
  `updateTag`, not `revalidateTag`: these are all Server Actions, and the user has to see
  their own write on the very next render — see `categories/actions/delete-category.action.ts`.
- **Tag names are never written twice.** Every tag lives in its feature's
  `lib/cache-tags.ts` (`ENVELOPE_TAGS`, `EXPENSE_TAGS`, `CATEGORY_TAGS`, `DASHBOARD_TAGS`),
  and other features import from there. A tag name that doesn't match its producer is not
  an error — `updateTag` on a name nothing is cached under silently invalidates nothing,
  and shows up much later as a stale number nobody can trace to a typo. Detail endpoints
  are tagged **per id** (`ENVELOPE_TAGS.detail(id)`), never with one global tag for the
  whole collection. Where several tags are always invalidated together, the bundle is
  exported too (`DASHBOARD_ENVELOPE_WRITE_TAGS` / `DASHBOARD_EXPENSE_WRITE_TAGS`) rather
  than re-listed in each action.
- **UI Feedback**: Use `useActionWithToast` (`src/shared/hooks/useActionWithToast.tsx`) to handle success/error notifications and trigger `router.refresh()`.

#### Domain Organization

- Features in `src/features/` strictly separate orchestration (`actions`), business logic (`services`), data transformation (`mappers`), and validation (`schemas`) — except `auth`, which swaps `services/` for `hooks/` for the reason noted in Project Structure above.

### Key Technical Choices

- **Authentication**: Clerk (`@clerk/nextjs` v7, Core 3) for user management and session control. Custom UI built with Clerk's `useSignIn`/`useSignUp`/`useUser` hooks, not `@clerk/elements` (deprecated) or Clerk's prebuilt components — see `src/features/auth/`.
- **Styling**: Tailwind 4 CSS with Base UI (`@base-ui/react`) primitives (via shadcn/ui) — not Radix.
- **Validation**: Zod 4 is used for all schema validations and is integrated with React Hook Form 7.
- **State Management**: Primarily relies on Next.js Server Components and Server Actions for data flow.
- **Date Handling**: `date-fns` 4 for date manipulation and formatting (utilizing `@date-fns/utc` for consistent UTC handling).
- **Charts**: `recharts` 3 for data visualization.
- **UI Feedback**: `sonner` 2 for toast notifications.
- **UI Components**: Drawers (`src/shared/components/ui/drawer.tsx`) use Base UI's own `Drawer` primitive, not `vaul`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
