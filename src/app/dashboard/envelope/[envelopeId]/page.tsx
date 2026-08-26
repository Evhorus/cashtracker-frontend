import { auth } from "@clerk/nextjs/server";
import { getEnvelopeByIdAction } from "@/features/envelopes/actions/get-envelope-by-id.action";
import { getExpensesAction } from "@/features/expenses/actions/get-expenses.action";
import { DeleteEnvelopeAlertDialog } from "@/features/envelopes/components/delete-envelope-alert-dialog";
import { UpdateEnvelopeDialog } from "@/features/envelopes/components/update-envelope-dialog";
import { CreateExpenseDialog } from "@/features/expenses/components/create-expense-dialog";
import { ExpensesFilter } from "@/features/expenses/components/expenses-filter";
import { ExpensesList } from "@/features/expenses/components/expenses-list";
import { EnvelopeActionsMenu } from "@/features/envelopes/components/envelope-actions-menu";
import { PageHeader } from "@/components/common/page-header";
import { PaginationControls } from "@/components/common/pagination-controls";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { formatMonthYear } from "@/lib/date-helpers";
import { cn } from "@/lib/utils";

import {
  DollarSign,
  Infinity as InfinityIcon,
  TriangleAlert,
} from "lucide-react";
import {
  CategoryIcon,
  CategoryLabel,
} from "@/features/categories/components/category-badge";
import nextDynamic from "next/dynamic";
import { EnvelopeChartSkeleton } from "@/features/envelopes/components/envelope-chart-skeleton";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";
import {
  EXPENSES_DEFAULT_PAGE_SIZE,
  EXPENSES_PAGE_SIZE_OPTIONS,
} from "@/features/expenses/lib/expense-helpers";

// recharts is a heavy dependency - code-split it into its own chunk,
// only needed once this section of the envelope detail page renders.
// Aliased to `nextDynamic`: this file also exports the route segment
// config `dynamic = "force-dynamic"` below, which would otherwise
// collide with next/dynamic's default export name.
const EnvelopeChart = nextDynamic(
  () =>
    import("@/features/envelopes/components/envelope-chart").then(
      (mod) => mod.EnvelopeChart,
    ),
  { loading: () => <EnvelopeChartSkeleton /> },
);

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface EnvelopePageProps {
  params: Promise<{ envelopeId: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function EnvelopePage({
  params,
  searchParams,
}: EnvelopePageProps) {
  await auth.protect();
  const { envelopeId } = await params;
  const {
    startDate,
    endDate,
    search,
    sort,
    page: pageParam,
    limit: limitParam,
  } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const sortOrder =
    sort === "DESC" ? "DESC" : sort === "ASC" ? "ASC" : undefined;
  // 10 / 20 / "Todo" (100, the backend's own hard cap) - see
  // ExpensesFilter's page-size Select and expense-helpers.ts. Anything
  // else in the URL (hand-edited, stale) falls back to the default
  // rather than passing an arbitrary number through to the backend.
  const limit = EXPENSES_PAGE_SIZE_OPTIONS.some(
    (option) => String(option.value) === limitParam,
  )
    ? Number(limitParam)
    : EXPENSES_DEFAULT_PAGE_SIZE;

  const [envelope, expensesResult] = await Promise.all([
    getEnvelopeByIdAction(envelopeId),
    getExpensesAction(envelopeId, {
      startDate,
      endDate,
      search,
      sort: sortOrder,
      page,
      limit,
    }),
  ]);

  const isUnlimited = envelope.amount === null;
  const remaining = EnvelopeHelpers.getRemaining(envelope);
  const percentage = EnvelopeHelpers.getPercentage(envelope);
  const status = EnvelopeHelpers.getProgressStatus(envelope);
  const currencyConfig = CURRENCY_MAP[envelope.currency];
  const spentColorClass =
    status === "exceeded"
      ? "text-destructive"
      : status === "warning"
        ? "text-amber-500"
        : "text-primary";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <PageHeader
        title={envelope.name}
        backUrl="/dashboard/envelopes"
        icon={
          <CategoryIcon
            category={envelope.category}
            className="h-11 w-11 rounded-xl"
          />
        }
        description={
          // Always shows the creation month/year, not just when a
          // category is set - same reasoning as the envelope card: names
          // are free text and commonly reused across years, so this is
          // the one place that disambiguates which year's envelope this is.
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            {formatMonthYear(envelope.createdAt)}
            {envelope.category && (
              <>
                <span aria-hidden="true">·</span>
                <CategoryLabel category={envelope.category} />
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-xs text-secondary-foreground">
              {envelope.currency}
            </span>
          </p>
        }
        actions={
          <>
            <UpdateEnvelopeDialog envelope={envelope} />
            <DeleteEnvelopeAlertDialog id={envelopeId} name={envelope.name} />
          </>
        }
        mobileActions={<EnvelopeActionsMenu envelope={envelope} />}
      />

      {/* Historial de Gastos (main, left on desktop) + Resumen (sidebar,
          sticky on desktop) - a single grid instead of a full-width stats
          row followed by a lopsided main/sidebar split, so the summary
          isn't a short block floating above a lot of empty space next to
          a much taller expense list. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <DollarSign className="h-5 w-5 text-primary" />
              Historial de Gastos
            </h2>
            <CreateExpenseDialog
              envelopeId={envelope.id}
              currency={envelope.currency}
              envelopeName={envelope.name}
              envelopeCategory={envelope.category}
            />
          </div>

          <ExpensesFilter />
          <ExpensesList
            expenses={expensesResult.data}
            currency={envelope.currency}
          />
          <PaginationControls
            page={expensesResult.meta.page}
            totalPages={expensesResult.meta.totalPages}
            hasNextPage={expensesResult.meta.hasNextPage}
            hasPreviousPage={expensesResult.meta.hasPreviousPage}
            basePath={`/dashboard/envelope/${envelopeId}`}
            searchParams={{
              startDate,
              endDate,
              search,
              sort,
              limit:
                limit === EXPENSES_DEFAULT_PAGE_SIZE
                  ? undefined
                  : String(limit),
            }}
          />
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
          <Card className="border-0 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isUnlimited ? (
                <div className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary/40 px-4 py-6 text-center">
                  <InfinityIcon className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Sin límite de gasto
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(+envelope.spent, currencyConfig)}
                  </p>
                </div>
              ) : (
                <EnvelopeChart
                  spent={+envelope.spent}
                  total={+envelope.amount!}
                />
              )}

              {status === "exceeded" && (
                <div className="flex items-center gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5">
                  <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    Te excediste por{" "}
                    {formatCurrency(Math.abs(remaining ?? 0), currencyConfig)}{" "}
                    este mes
                  </p>
                </div>
              )}

              <dl className="divide-y divide-border/60">
                {!isUnlimited && (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">
                      Disponible
                    </dt>
                    <dd
                      className={cn(
                        "text-base font-bold",
                        (remaining ?? 0) < 0
                          ? "text-destructive"
                          : "text-success",
                      )}
                    >
                      {formatCurrency(remaining ?? 0, currencyConfig)}
                    </dd>
                  </div>
                )}

                {/* For unlimited envelopes the block above already states
                    the spent amount - repeating it here would be the same
                    duplication problem fixed on the envelope card, so this
                    row only applies to capped envelopes. */}
                {!isUnlimited && (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">Gastado</dt>
                    <dd className="text-right">
                      <p
                        className={cn("text-base font-bold", spentColorClass)}
                      >
                        {formatCurrency(+envelope.spent, currencyConfig)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(percentage ?? 0).toFixed(1)}% del límite
                      </p>
                    </dd>
                  </div>
                )}

                {/* "Transacciones" gets its own row rather than riding as
                    a caption under "Límite total" - the count has nothing
                    to do with the limit itself, and reading them stacked
                    together read as if they were related. */}
                {!isUnlimited && (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">
                      Límite total
                    </dt>
                    <dd className="text-base font-bold">
                      {formatCurrency(+envelope.amount!, currencyConfig)}
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm text-muted-foreground">
                    Transacciones
                  </dt>
                  <dd className="text-base font-bold">
                    {envelope.expenses.length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
