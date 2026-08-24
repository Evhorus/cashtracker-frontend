"use client";

import { useEffect } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Catches any render/data error anywhere under /dashboard that doesn't
// handle it itself - none of these routes had an error boundary before
// (a thrown error surfaced Next.js's own generic page). Client Component
// per the App Router's error.tsx contract.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Algo salió mal</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          No pudimos cargar esta página. Tus datos están a salvo - inténtalo
          de nuevo.
        </p>
      </div>
      <Button onClick={() => reset()}>
        <RotateCw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}
