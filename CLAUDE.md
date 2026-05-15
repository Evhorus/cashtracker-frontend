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

### Key Technical Choices

- **Authentication**: Clerk 6 is used for user management and session control.
- **Styling**: Tailwind 4 CSS with Radix UI primitives (via shadcn/ui).
- **Validation**: Zod 4 is used for all schema validations and is integrated with React Hook Form 7.
- **State Management**: Primarily relies on Next.js Server Components and Server Actions for data flow.
- **Date Handling**: `date-fns` 4 for date manipulation and formatting (utilizing `@date-fns/utc` for consistent UTC handling).
- **Charts**: `recharts` 2 for data visualization.
- **UI Feedback**: `sonner` 2 for toast notifications.
- **UI Components**: `vaul` 1 for drawer components.
