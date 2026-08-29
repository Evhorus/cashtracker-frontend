"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/common/typography";

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
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">{t("genericTitle")}</h2>
        <Text className="max-w-sm">{t("genericBody")}</Text>
      </div>
      <Button onClick={() => reset()}>
        <RotateCw className="h-4 w-4" />
        {tCommon("retry")}
      </Button>
    </div>
  );
}
