import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { ExpensesService } from "@/features/expenses/services/expenses.service";

/**
 * Read path for a single expense - see
 * envelopes/data/get-envelope-by-id.ts for why this is a plain
 * server-only function rather than a Server Action, and the same React
 * cache() wrapper so generateMetadata comes for free.
 *
 * A missing expense redirects to its parent envelope rather than
 * rendering the 404 page, which is the one place this app deliberately
 * differs from getEnvelopeById's notFound(). An expense only ever exists
 * inside an envelope, so "this expense is gone" has a genuinely useful
 * destination - and the common way to reach that state is deleting the
 * expense from its own detail page: completing a Server Action makes
 * Next re-render the current route, so the deleted expense's own page
 * re-renders as part of the delete. notFound() there showed the user a
 * 404 for an action that had just succeeded. Anything that isn't a 404
 * is still rethrown so dashboard/error.tsx can offer a retry.
 */
export const getExpenseById = cache(
  async (envelopeId: string, expenseId: string) => {
    try {
      return await ExpensesService.getById(envelopeId, expenseId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        redirect(`/dashboard/envelope/${envelopeId}`);
      }
      throw error;
    }
  },
);
