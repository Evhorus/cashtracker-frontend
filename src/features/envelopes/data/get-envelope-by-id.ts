import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";

/**
 * Read path for a single envelope - see get-envelopes.ts for why this
 * is a plain server-only function rather than a Server Action.
 *
 * Wrapped in React's cache() so the route's generateMetadata and the
 * page body itself can both call it and still only hit the backend
 * once per request.
 *
 * A missing envelope redirects to the envelopes list rather than
 * rendering the 404 page. That's deliberate, and it is *not* just
 * inherited from the code this replaced: completing a Server Action
 * makes Next re-render the current route, so deleting an envelope from
 * its own detail page re-renders that page as part of the delete.
 * notFound() there showed a 404 for an action that had just succeeded -
 * and the delete dialog's own router.replace() can't win that race,
 * since the re-render is part of the action's response. Redirecting to
 * the parent list is both the right destination for that flow and a
 * reasonable landing spot for a stale or mistyped URL.
 *
 * Only a 404 is treated this way. Anything else is rethrown so
 * dashboard/error.tsx can report it and offer a retry, instead of the
 * blanket `redirect("/dashboard")` on *any* error this used to do -
 * which made a backend outage look like a navigation that silently
 * didn't work.
 */
export const getEnvelopeById = cache(async (id: string) => {
  try {
    return await EnvelopesService.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      redirect("/dashboard/envelopes");
    }
    throw error;
  }
});
