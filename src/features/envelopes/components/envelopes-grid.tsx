import React from "react";
import { Envelope } from "@/features/envelopes/types";
import { Card } from "@/components/ui/card";
import { SearchX, Wallet } from "lucide-react";
import { CreateEnvelopeDialog } from "./create-envelope-dialog";
import { EnvelopeCard } from "./envelope-card";

interface EnvelopesGridProps {
  envelopes: Envelope[];
  /** Active search term, if any - swaps the empty state so a "no
   * results for this search" doesn't read as "you have no envelopes at
   * all" (and doesn't offer a "create your first envelope" CTA that
   * wouldn't help find what was searched for). */
  searchQuery?: string;
}

export const EnvelopesGrid = ({
  envelopes,
  searchQuery,
}: EnvelopesGridProps) => {
  return (
    <>
      {envelopes.length === 0 ? (
        <Card className="animate-fade-in p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="bg-primary-light mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              {searchQuery ? (
                <SearchX className="h-8 w-8 text-primary" />
              ) : (
                <Wallet className="h-8 w-8 text-primary" />
              )}
            </div>
            {searchQuery ? (
              <>
                <h3 className="text-xl font-semibold">
                  Sin resultados para &quot;{searchQuery}&quot;
                </h3>
                <p className="text-muted-foreground">
                  Prueba con otro nombre o categoría.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold">No tienes sobres aún</h3>
                <p className="text-muted-foreground">
                  Crea tu primer sobre para comenzar a controlar tus gastos
                </p>
                <CreateEnvelopeDialog />
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {envelopes.map((envelope, index) => (
            <div
              key={envelope.id}
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <EnvelopeCard envelope={envelope} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
