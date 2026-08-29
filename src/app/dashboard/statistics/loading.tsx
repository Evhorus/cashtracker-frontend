import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsLoadingSkeleton() {
  const t = useTranslations("statistics");
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <Skeleton className="mb-2 h-9 w-full max-w-48" />
          <Skeleton className="h-5 w-full max-w-64" />
        </div>
        {/* Breadcrumb + the year/currency filters, matching this page's
            own header row (it doesn't use PageHeader - see
            statistics/page.tsx for why). */}
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <Skeleton className="hidden h-4 w-40 md:block" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("monthlySpending")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full sm:h-80" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("byCategory")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-1.5 h-1.5 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
