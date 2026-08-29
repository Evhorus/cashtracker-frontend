import React from "react";
import { Envelope } from "@/features/envelopes/types";
import { Card } from "@/components/ui/card";
import { SearchX, Wallet } from "lucide-react";
import { CreateEnvelopeDialog } from "./create-envelope-dialog";
import { EnvelopeCard } from "./envelope-card";
import { EnvelopesTable } from "./envelopes-table";
import {
  ENVELOPE_STATUS_FILTERS,
  type EnvelopeStatusFilter,
} from "@/features/envelopes/lib/envelope-helpers";
import { Text } from "@/components/common/typography";

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
          <Card className="animate-fade-in border-0 bg-card/50 p-12 text-center shadow-sm">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <SearchX className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">
                {searchQuery
                  ? `Sin resultados para "${searchQuery}"`
                  : `Sin sobres en "${
                      ENVELOPE_STATUS_FILTERS.find(
                        (filter) => filter.value === statusFilter,
                      )?.label ?? statusFilter
                    }"`}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Prueba con otro nombre o categoría."
                  : "Prueba con otro filtro."}
              </p>
            </div>
          </Card>
        ) : (
          // First-run state - bigger and more editorial than the "no
          // search results" case above, since this is most people's
          // actual first screen in the app.
          <Card className="animate-fade-in border-0 bg-card/50 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto max-w-sm space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-9 w-9 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  CashTracker
                </p>
                <h3 className="font-serif text-2xl font-semibold text-balance">
                  Organiza tus gastos por sobres
                </h3>
                <Text>
                  Crea un sobre para cada categoría — mercado, transporte,
                  ocio — y CashTracker te avisa antes de que te excedas.
                </Text>
              </div>
              <div className="flex justify-center pt-1">
                <CreateEnvelopeDialog />
              </div>
            </div>
          </Card>
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
