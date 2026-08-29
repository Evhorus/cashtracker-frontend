import React from "react";
import { Envelope } from "@/features/envelopes/types";
import { SearchX, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { CreateEnvelopeDialog } from "./create-envelope-dialog";
import { EnvelopeCard } from "./envelope-card";
import { EnvelopesTable } from "./envelopes-table";
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";

interface EnvelopesGridProps {
  envelopes: Envelope[];
  /** Active search term, if any - swaps the empty state so a "no
   * results for this search" doesn't read as "you have no envelopes at
   * all" (and doesn't offer a "create your first envelope" CTA that
   * wouldn't help find what was searched for). */
  searchQuery?: string;
  /** Active status tab, if not "all" - same reasoning as searchQuery:
   * an empty "Excedidos" tab means "nothing matches this filter", not
   * "you have no envelopes". */
  statusFilter?: EnvelopeStatusFilter;
}

export const EnvelopesGrid = ({
  envelopes,
  searchQuery,
  statusFilter = "all",
}: EnvelopesGridProps) => {
  const hasActiveFilter = Boolean(searchQuery) || statusFilter !== "all";

  return (
    <>
      {envelopes.length === 0 ? (
        hasActiveFilter ? (
          <EmptyState
            icon={SearchX}
            title={
              searchQuery
                ? `Sin resultados para "${searchQuery}"`
                : `Sin sobres en "${
                    ENVELOPE_STATUS_FILTERS.find(
                      (filter) => filter.value === statusFilter,
                    )?.label ?? statusFilter
                  }"`
            }
            description={
              searchQuery
                ? "Prueba con otro nombre o categoría."
                : "Prueba con otro filtro."
            }
          />
        ) : (
          // First-run state - bigger and more editorial than the "no
          // search results" case above, since this is most people's
          // actual first screen in the app.
          <EmptyState
            variant="first-run"
            icon={Wallet}
            eyebrow="CashTracker"
            title="Organiza tus gastos por sobres"
            description="Crea un sobre para cada categoría — mercado, transporte, ocio — y CashTracker te avisa antes de que te excedas."
            action={<CreateEnvelopeDialog />}
          />
        )
      ) : (
        <>
          {/* Mobile: same card grid as before. Desktop: a dense table
              instead of the same cards stretched wider - see
              envelopes-table.tsx. */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {envelopes.map((envelope, index) => (
              <div
                key={envelope.id}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <EnvelopeCard envelope={envelope} />
              </div>
            ))}
          </div>
          <EnvelopesTable envelopes={envelopes} />
        </>
      )}
    </>
  );
};
