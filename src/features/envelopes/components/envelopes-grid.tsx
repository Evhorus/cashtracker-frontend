import React from "react";
import { Envelope } from "@/features/envelopes/types";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { CreateEnvelopeDialog } from "./create-envelope-dialog";
import { EnvelopeCard } from "./envelope-card";

interface EnvelopesGridProps {
  envelopes: Envelope[];
}

export const EnvelopesGrid = ({ envelopes }: EnvelopesGridProps) => {
  return (
    <>
      {envelopes.length === 0 ? (
        <Card className="animate-fade-in p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="bg-primary-light mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No tienes sobres aún</h3>
            <p className="text-muted-foreground">
              Crea tu primer sobre para comenzar a controlar tus gastos
            </p>
            <CreateEnvelopeDialog />
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
