"use client";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Text } from "@/shared/components/common/typography";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type CurrencyCode } from "@/shared/utils/format-currency";

type MonthlySpendingChartData = {
  label: string;
  spent: number;
};

interface MonthlySpendingChartProps {
  totalEnvelopes: number;
  chartData: MonthlySpendingChartData[];
  /** Which currency chartData's amounts are in - the backend scopes
   * this chart to the user's most-used currency instead of summing
   * every currency onto the same bars (see dashboard.repository.ts's
   * getMonthlySpending doc comment on the backend). */
  currency: CurrencyCode;
  /** Only worth spelling out in the title when there's real ambiguity
   * to resolve - a single-currency account doesn't need reminding
   * which currency its own chart is in. */
  hasOtherCurrencies: boolean;
}

// Spending per calendar month of each expense's own date - the one view
// that reads right however envelopes are organised (one per month, or one
// long-lived envelope per purpose). The backend returns months oldest
// first. One series: without envelope periods a month has no meaningful
// remaining-budget figure to set beside it. The bar uses the primary
// accent spent amounts render in everywhere else.
export const MonthlySpendingChart = ({
  chartData,
  totalEnvelopes,
  currency,
  hasOtherCurrencies,
}: MonthlySpendingChartProps) => {
  const t = useTranslations("statistics");
  const tCurrency = useTranslations("currencies");
  // Nothing to chart at all (no envelopes) - unlike the single-month
  // case below, there's no card worth showing a placeholder in either.
  if (totalEnvelopes === 0) return null;

  // A single bar can't show a trend, so the chart only renders once there
  // are expenses in at least two different months; the card still
  // renders with an explanation instead of silently vanishing.
  const hasTrend = chartData.length >= 2;

  // Data keys are English identifiers, not display words - they're
  // also spliced into CSS custom property names (--color-spent), so a
  // translated key would break the fill. The words the reader sees are
  // `label`, resolved per-locale.
  const chartConfig = {
    spent: {
      label: t("spent"),
      color: "var(--color-primary)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="animate-fade-in [animation-delay:0.4s]">
      <CardHeader>
        <CardTitle>
          {t("chartTitle")}
          {hasOtherCurrencies && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({tCurrency(currency)})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasTrend ? (
          <Text className="py-6 text-center">{t("notEnoughTrendData")}</Text>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full sm:h-80"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              barGap={4}
              barCategoryGap="30%"
            >
              {/*
                Full labels ("Aug 2026") got shown-but-cramped: on narrow
                screens recharts starts skipping ticks to avoid overlap,
                leaving it ambiguous which bar was which month/year. A
                single letter turned out too ambiguous on its own ("O"
                could be almost anything) - the 3-letter month
                abbreviation (labels already start with one, e.g. "Aug")
                is still short enough to avoid skipping, but actually
                reads as a month. Full month/year (plus the year, when
                the range spans more than one) still shows in the
                tooltip on hover (desktop) or tap (touch, recharts
                already treats a touch as a hover for this).

                No CartesianGrid - a busy row of horizontal gridlines behind
                one bar per month reads as chart-template chrome, not this
                app's own visual language elsewhere (thin hairline borders,
                nothing else). The axis line itself (recessive, --border) is
                the only baseline the bars need.
              */}
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(value: string) => value.slice(0, 3)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="spent"
                fill="var(--color-spent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
