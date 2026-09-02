"use client";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/common/typography";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type CurrencyCode } from "@/lib/format-currency";

type MonthlySpendingChartData = {
  label: string;
  spent: number;
  available: number;
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

// Grouped by month (not by envelope) - envelopes in this app are always
// "one account for one month" (e.g. "Marzo Rappi"), so a per-envelope
// chart mixed accounts and months with no meaningful order. Per-month
// is both meaningful on its own and naturally sorts chronologically -
// the backend already returns entries oldest-to-newest.
//
// Two side-by-side bars per month (not stacked) - spent and available
// don't sum to a meaningful third quantity, so stacking them into one bar
// implied a relationship ("this is the budget") that isn't actually true
// once an envelope is exceeded (available goes negative, which a stack
// can't render at all). Grouped bars compare the two directly instead.
// The spent bar reuses the app's own primary accent (the color spent amounts
// already render in everywhere else - envelope cards, the detail page);
// The available bar is muted-foreground, a status-style "this is the backdrop,
// not a second category" pairing rather than a second competing hue.
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

  // A single bar can't show a trend - it's the same spent/available
  // split the stat cards above already spell out in text, just redrawn
  // as a ~320px-tall chart. That's not "no info", it's negative value
  // (a lot of scroll for nothing new), so the bar chart itself only
  // renders once there's an actual month-over-month comparison to show.
  // Every envelope created the same day (a fresh account, a bulk
  // import, or simply the first envelope ever) hits this exact case,
  // since the backend buckets by envelope creation month - the card
  // still renders, with an explanation instead of silently vanishing.
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
    available: {
      label: t("available"),
      color: "var(--color-muted-foreground)",
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
                two-bars-per-month reads as chart-template chrome, not this
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
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="spent"
                fill="var(--color-spent)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="available"
                fill="var(--color-available)"
                fillOpacity={0.6}
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
