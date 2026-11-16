import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { TZDate } from "@date-fns/tz";
import { ReceiptText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/features/dashboard/components/breadcrumb";
import { getPaymentMethods } from "@/features/payment-methods/data/get-payment-methods";
import { getExpensesReport } from "@/features/expenses-report/data/get-expenses-report";
import {
  parseReportFilters,
  type ReportFilters,
  type ReportSearchParams,
} from "@/features/expenses-report/lib/report-filters";
import { ReportActions } from "@/features/expenses-report/components/report-actions";
import { ReportExpenseTable } from "@/features/expenses-report/components/report-expense-table";
import { ReportFiltersBar } from "@/features/expenses-report/components/report-filters-bar";
import { ReportSplitView } from "@/features/expenses-report/components/report-split-view";
import { ReportSummary } from "@/features/expenses-report/components/report-summary";
import { EmptyState } from "@/shared/components/common/empty-state";
import { Heading } from "@/shared/components/common/typography";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("expensesReport");
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

/**
 * "This month" on the server. Bogotá, the app's home timezone: the
 * server runs in UTC, which would flip to the next month five hours
 * early for every user here.
 */
function currentMonthKey(): string {
  return new TZDate(Date.now(), "America/Bogota").toISOString().slice(0, 7);
}

function periodSlug(filters: ReportFilters): string {
  if (filters.period === "custom") {
    return `${filters.startDate}_${filters.endDate}`;
  }
  return filters.period === "cycle" ? `corte-${filters.month}` : filters.month;
}

interface ExpensesPageProps {
  searchParams: Promise<ReportSearchParams>;
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  await auth.protect();
  const t = await getTranslations("expensesReport");
  const currentMonth = currentMonthKey();
  const filters = parseReportFilters(await searchParams, currentMonth);
  const [report, paymentMethods] = await Promise.all([
    getExpensesReport(filters),
    getPaymentMethods(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Heading as="h1" size="lg">
            {t("title")}
          </Heading>
          <p className="mt-1 text-muted-foreground print:hidden">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <Breadcrumb current={t("title")} className="hidden md:block" />
          <ReportActions
            expenses={report.expenses}
            periodSlug={periodSlug(filters)}
          />
        </div>
      </div>

      <ReportFiltersBar filters={filters} currentMonth={currentMonth} />

      <ReportSummary
        report={report}
        filters={filters}
        paymentMethods={paymentMethods}
      />

      {report.expenses.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={t("empty.title")}
          description={t("empty.description")}
          variant="filtered"
        />
      ) : filters.view === "split" ? (
        <ReportSplitView report={report} paymentMethods={paymentMethods} />
      ) : (
        <ReportExpenseTable expenses={report.expenses} showPaymentMethod />
      )}
    </div>
  );
}
