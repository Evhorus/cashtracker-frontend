import { useTranslations } from "next-intl";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const MonthlySpendingChartSkeleton = () => {
  const t = useTranslations("statistics");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("chartTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  );
};
