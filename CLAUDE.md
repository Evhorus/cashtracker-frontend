# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- Development: `pnpm run dev` (starts Next.js dev server with Turbopack)
- Build: `pnpm run build` (builds the application for production)
- Start: `pnpm run start` (starts the production server)
- Lint: `pnpm run lint` (runs ESLint)

## Architecture Overview

This is a Next.js 16 project using the App Router and TypeScript.

### Project Structure

- `src/app/`: Next.js App Router. Contains route segments and layouts.
    - `(auth)/`: Authentication routes (Clerk).
    - `(home)/`: Public landing page routes.
    - `dashboard/`: Protected routes for the main application.
- `src/features/`: Domain-driven modules. Each feature folder (e.g., `budgets`, `expenses`) contains:
    - `actions/`: Server Actions for data fetching and mutations.
    - `components/`: Domain-specific React components.
    - `schemas/`: Zod validation schemas for inputs and API responses.
    - `services/`: API client wrappers and external service logic.
    - `types/`: TypeScript type definitions for the domain.
    - `mappers/`: Data transformation logic between API and UI.
- `src/shared/`: Cross-cutting concerns and reusable code.
    - `components/ui/`: Base UI components (shadcn/ui).
    - `hooks/`: Custom shared React hooks.
    - `lib/`: General utilities (API clients, formatting, etc.).
    - `providers/`: Application-level context providers.
- `src/proxy.ts`: Proxy configuration for authentication and routing.

### Key Patterns

#### Forms & Validation
- **Presentational UI**: Forms are decoupled from submission logic. Components receive `onSubmit`, `isLoading`, and `defaultValues` as props.
- **Schema-Driven**: Use `react-hook-form` with `zod` resolvers. Wrap custom inputs in the `Controller` component.
- **Submission Flow**: Parent components (e.g., Dialogs) use `useActionState` and `startTransition` to dispatch data to Server Actions.

### Key Patterns

#### Forms & Validation
- **Presentational UI**: Forms are decoupled from submission logic. Components receive `onSubmit`, `isLoading`, and `defaultValues` as props.
- **Schema-Driven**: Use `react-hook-form` with `zod` resolvers. Wrap custom inputs in the `Controller` component.
- **Submission Flow**: Parent components (e.g., Dialogs) use `useActionState` and `startTransition` to dispatch data to Server Actions.

#### API & Data Flow
- **Boundary Validation**: All API responses are validated at the network boundary using Zod schemas within `fetchApi` (`src/shared/lib/api-client.ts`) to prevent corrupt data from reaching the UI.
- **Bidirectional Mapping**: 
    - `toApiRequest` (Outbound): Transforms UI models to API formats, including locale-specific formatting (e.g., removing Colombian currency dots).
    - `fromApi` (Inbound): Transforms raw API responses (e.g., ISO date strings) into rich domain models (e.g., JavaScript `Date` objects).
- **Type Separation**: Maintain a strict distinction between API types (raw server response) and Domain types (UI-optimized models).
- **Transport vs. Contract**: Communication is split between `authenticated-fetch.ts` (Transport/Auth) and `api-client.ts` (Validation/Contract).

#### Server Actions & State
- **Safe Actions**: Wrap all actions with `createSafeAction` (`src/shared/lib/safe-action`) for standardized error handling.
- **Service Layer**: Actions must delegate business logic to a Service class (e.g., `BudgetsService`) rather than implementing it directly.
- **Cache Invalidation**: Use `revalidatePath` or `revalidateTag` in actions to ensure the UI remains current.
- **UI Feedback**: Use `useActionWithToast` (`src/shared/hooks/useActionWithToast.tsx`) to handle success/error notifications and trigger `router.refresh()`.

#### Domain Organization
- Features in `src/features/` strictly separate orchestration (`actions`), business logic (`services`), data transformation (`mappers`), and validation (`schemas`).

### Key Technical Choices

- **Authentication**: Clerk 6 is used for user management and session control.
- **Styling**: Tailwind 4 CSS with Radix UI primitives (via shadcn/ui).
- **Validation**: Zod 4 is used for all schema validations and is integrated with React Hook Form 7.
- **State Management**: Primarily relies on Next.js Server Components and Server Actions for data flow.
- **Date Handling**: `date-fns` 4 for date manipulation and formatting (utilizing `@date-fns/utc` for consistent UTC handling).
- **Charts**: `recharts` 2 for data visualization.
- **UI Feedback**: `sonner` 2 for toast notifications.
- **UI Components**: `vaul` 1 for drawer components.
