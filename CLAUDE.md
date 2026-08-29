# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- Development: `pnpm run dev` (starts Next.js dev server with Turbopack)
- Build: `pnpm run build` (builds the application for production)
- Start: `pnpm run start` (starts the production server)
- Lint: `pnpm run lint` (runs ESLint)
- Test: `pnpm test` (Vitest, single run) / `pnpm run test:watch`
  - Unit tests only, `node` environment, no DOM. They cover the pure logic:
    `date-helpers`, `format-currency`, `pagination`, `EnvelopeHelpers`,
    `ExpenseHelpers`, `dashboard-summary`, and the expense mapper.
  - Config is `vitest.config.mts`, which pins `TZ=America/Bogota`. That is
    deliberate: half of `date-helpers.ts` exists to keep a calendar date from
    being timezone-converted while a real instant is, and under `TZ=UTC` those
    two behaviours are indistinguishable, so the tests would pass even if the
    distinction were broken.
  - Component logic is not covered - that would need `jsdom` plus
    `@testing-library/react`. The notable gap is `price-input.tsx`.

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
  - Not every feature has every folder — `auth` deliberately has no `services/`; it uses
    `hooks/` instead, because its underlying provider (Clerk) exposes React hooks
    (`useSignIn`/`useSignUp`/`useUser`/...) rather than plain async functions callable from
    Server Actions. Those hooks are the *only* files in the feature allowed to import the
    provider SDK directly — components only ever consume what the hook returns
    (`fieldErrors`, `globalErrors`, action functions), so swapping providers later means
    rewriting `features/auth/hooks/*`, not chasing imports across every component.
- Cross-cutting, non-domain code lives directly under `src/`, not nested in a `shared/` folder:
  - `src/components/ui/`: base primitives (shadcn-style, built on Base UI — see Key Technical Choices).
  - `src/components/common/`: reusable composed components shared across features (e.g. `FormInput`, `ErrorMessage`, `SubmitButton`).
  - `src/hooks/`: shared custom React hooks.
  - `src/lib/`: general utilities (API client, auth fetch, formatting, pagination, `safe-action`).
  - `src/providers/`: application-level context providers.
- `src/proxy.ts`: Proxy configuration for routing. Auth gating is **not** done here — see below.

### Key Patterns

#### Auth Gating

- Per Clerk's current guidance, session/route protection is done at the resource level
  (`auth()` + `redirect()`, or `auth.protect()`) inside layouts/pages — e.g.
  `src/app/dashboard/layout.tsx`, `src/app/(auth)/layout.tsx` — **not** in middleware.
  `src/proxy.ts` stays a bare `clerkMiddleware()`.

#### Forms & Validation

- **Presentational UI**: Forms are decoupled from submission logic. Components receive `onSubmit`, `isLoading`, and `defaultValues` as props.
- **Schema-Driven**: Use `react-hook-form` with `zod` resolvers. Wrap custom inputs in the `Controller` component; for a plain text/email/password field, prefer the reusable `FormInput` (`src/components/common/form-input.tsx`) over writing a `Controller` by hand.
- **Submission Flow**: Parent components (e.g., Dialogs) use `useActionState` and `startTransition` to dispatch data to Server Actions.
- **Error styling**: Fields flip to a red border via `aria-invalid` (already baked into the Tailwind classes of `Input`/`Textarea`/`CurrencySelector`/`Button`) whenever `fieldState.invalid` is true or a server-side error applies to that field. Per-field messages use the lightweight `FieldError` (`src/components/ui/field.tsx`), not `ErrorMessage`; `ErrorMessage` (`src/components/common/error-message.tsx`) is reserved for global/account-level errors that aren't tied to one field.

#### API & Data Flow

- **Boundary Validation**: All API responses are validated at the network boundary using Zod schemas within `fetchApi` (`src/lib/api-client.ts`) to prevent corrupt data from reaching the UI.
- **Bidirectional Mapping**:
  - `toApiRequest` (Outbound): Transforms UI models to API formats, including locale-specific formatting (e.g., removing Colombian currency dots).
  - `fromApi` (Inbound): Transforms raw API responses (e.g., ISO date strings) into rich domain models (e.g., JavaScript `Date` objects).
- **Type Separation**: Maintain a strict distinction between API types (raw server response) and Domain types (UI-optimized models).
- **Transport vs. Contract**: Communication is split between `authenticated-fetch.ts` (Transport/Auth) and `api-client.ts` (Validation/Contract), both under `src/lib/`.

#### Server Actions & State

- **Safe Actions**: Wrap all actions with `createSafeAction` (`src/lib/safe-action.ts`) for standardized error handling.
- **Service Layer**: Actions must delegate business logic to a Service class (e.g., `EnvelopesService`) rather than implementing it directly. (Exception: `auth`, see Domain Organization below.)
- **Cache Invalidation**: Use `revalidatePath` or `revalidateTag` in actions to ensure the UI remains current.
- **UI Feedback**: Use `useActionWithToast` (`src/hooks/useActionWithToast.tsx`) to handle success/error notifications and trigger `router.refresh()`.

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
- **UI Components**: Drawers (`src/components/ui/drawer.tsx`) use Base UI's own `Drawer` primitive, not `vaul`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
