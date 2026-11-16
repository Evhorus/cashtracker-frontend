import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import { getEnvelopeById } from "@/features/envelopes/data/get-envelope-by-id";
import { getExpenses } from "@/features/expenses/data/get-expenses";
import { DeleteEnvelopeAlertDialog } from "@/features/envelopes/components/delete-envelope-alert-dialog";
import { UpdateEnvelopeDialog } from "@/features/envelopes/components/update-envelope-dialog";
import { CreateExpenseDialog } from "@/features/expenses/components/create-expense-dialog";
import { ExpensesFilter } from "@/features/expenses/components/expenses-filter";
import {
  expenseOrderParams,
  parseExpenseOrder,
} from "@/features/expenses/lib/expense-order";
import {
  methodOptionsFor,
  parseMethodFilter,
  type MethodOption,
} from "@/features/payment-methods/lib/method-filter";
import { FilteredExpensesBanner } from "@/features/expenses/components/filtered-expenses-banner";
import { ExpensesList } from "@/features/expenses/components/expenses-list";
import { ExpensesListSkeleton } from "@/features/expenses/components/expenses-list-skeleton";
import { EnvelopeActionsMenu } from "@/features/envelopes/components/envelope-actions-menu";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { BackLinkButton } from "@/shared/components/common/back-link-button";
import { Heading } from "@/shared/components/common/typography";
import { PaginationControls } from "@/shared/components/common/pagination-controls";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  CURRENCY_MAP,
  formatCurrency,
  type CurrencyCode,
} from "@/shared/utils/format-currency";
import { cn } from "@/shared/lib/utils";

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

// The envelope's own name in the tab title - getEnvelopeById is wrapped
// in React's cache(), so this shares the page body's fetch rather than
// making a second one.
export async function generateMetadata({
  params,
}: Pick<EnvelopePageProps, "params">): Promise<Metadata> {
  const { envelopeId } = await params;
  const envelope = await getEnvelopeById(envelopeId);
  return { title: envelope.name };
}

interface EnvelopePageProps {
  params: Promise<{ envelopeId: string }>;
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    /** Payment method filter, `a,b,none` - see method-filter.ts. */
    methods?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function EnvelopePage({
  params,
  searchParams,
}: EnvelopePageProps) {
  await auth.protect();
  const locale = await getLocale();
  const t = await getTranslations("common");
  const tEnvelope = await getTranslations("envelopes");
  const { envelopeId } = await params;
  const {
    startDate,
    endDate,
    search,
    sort,
    sortBy,
    methods,
    page: pageParam,
    limit: limitParam,
  } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  const order = expenseOrderParams(parseExpenseOrder(sort, sortBy));
  // 10 / 20 / all (100, the backend's own hard cap) - see
  // ExpensesFilter's page-size Select and expense-helpers.ts. Anything
  // else in the URL (hand-edited, stale) falls back to the default
  // rather than passing an arbitrary number through to the backend.
  const limit = EXPENSES_PAGE_SIZE_OPTIONS.some(
    (option) => String(option) === limitParam,
  )
    ? Number(limitParam)
    : EXPENSES_DEFAULT_PAGE_SIZE;

  // Only the envelope is on the critical path - it's what the header,
  // the summary sidebar and the chart are built from. The expense list
  // streams in behind its own Suspense boundary below, so changing a
  // filter re-fetches just the list instead of blanking the whole page.
  const envelope = await getEnvelopeById(envelopeId);

  const isUnlimited = envelope.amount === null;
  const remaining = EnvelopeHelpers.getRemaining(envelope);
  const percentage = EnvelopeHelpers.getPercentage(envelope);
  const status = envelope.status;
  const currencyConfig = CURRENCY_MAP[envelope.currency];
  const spentColorClass = EnvelopeHelpers.getStatusTextColorClass(status);
  const hasActiveFilter = Boolean(search || startDate || endDate || methods);
  const methodOptions = methodOptionsFor(envelope.expenses);
  // Shared by both Suspense boundaries below so they remount and
  // re-stream together on every filter change.
  const filterKey = `${page}-${limit}-${search ?? ""}-${order.sortBy}-${order.sort}-${startDate ?? ""}-${endDate ?? ""}-${methods ?? ""}`;

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
          // The period its expenses span - see EnvelopeHelpers.formatPeriod
          // and the envelope card.
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            {EnvelopeHelpers.formatPeriod(envelope, locale)}
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
            <BackLinkButton href="/dashboard/envelopes" label={t("back")} />
            <UpdateEnvelopeDialog
              envelope={envelope}
              label={t("edit")}
              showLabelOnDesktop
            />
            <DeleteEnvelopeAlertDialog
              id={envelopeId}
              name={envelope.name}
              label={t("delete")}
              showLabelOnDesktop
            />
          </>
        }
        mobileActions={<EnvelopeActionsMenu envelope={envelope} />}
      />

      {/* Expense history (main, left on desktop) + summary (sidebar,
          sticky on desktop) - a single grid instead of a full-width stats
          row followed by a lopsided main/sidebar split, so the summary
          isn't a short block floating above a lot of empty space next to
          a much taller expense list. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <Heading icon={DollarSign}>{tEnvelope("detail.history")}</Heading>
            <CreateExpenseDialog
              envelopeId={envelope.id}
              currency={envelope.currency}
              envelopeName={envelope.name}
              envelopePeriod={EnvelopeHelpers.formatPeriod(envelope, locale)}
              envelopeCategory={envelope.category}
            />
          </div>

          {/* Outside the boundary on purpose: ExpensesFilter is pure
              client UI reading the URL, so it stays interactive (and
              visible) while the list behind it reloads. */}
          <ExpensesFilter methodOptions={methodOptions} />
          {/* key remounts the boundary on every filter change, so the
              fallback re-appears instead of the old list sitting there
              looking unchanged - same pattern as the envelopes list. */}
          <Suspense key={filterKey} fallback={<ExpensesListSkeleton />}>
            <ExpensesResults
              envelopeId={envelopeId}
              currency={envelope.currency}
              startDate={startDate}
              endDate={endDate}
              search={search}
              methods={methods}
              order={order}
              page={page}
              limit={limit}
              filterBanner={
                hasActiveFilter
                  ? {
                      envelopeExpenseCount: envelope.expenses.length,
                      methodOptions,
                    }
                  : undefined
              }
            />
          </Suspense>
        </div>

        <div className="order-1 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          <Card className="border-0 bg-card/50 shadow-sm">
            <CardHeader>
              <CardTitle>{tEnvelope("detail.summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {status === "unlimited" ? (
                <div className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary/40 px-4 py-6 text-center">
                  <InfinityIcon className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {tEnvelope("detail.noSpendingLimit")}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(+envelope.spent, currencyConfig)}
                  </p>
                </div>
              ) : (
                <EnvelopeChart
                  spent={+envelope.spent}
                  total={+envelope.amount!}
                  status={status}
                />
              )}

              {status === "exceeded" && (
                <div className="flex items-center gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5">
                  <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    {tEnvelope("detail.exceededBy", {
                      amount: formatCurrency(
                        Math.abs(remaining ?? 0),
                        currencyConfig,
                      ),
                    })}
                  </p>
                </div>
              )}

              <dl className="divide-y divide-border/60">
                {!isUnlimited && (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">
                      {tEnvelope("detail.available")}
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
                    <dt className="text-sm text-muted-foreground">
                      {tEnvelope("detail.spent")}
                    </dt>
                    <dd className="text-right">
                      <p className={cn("text-base font-bold", spentColorClass)}>
                        {formatCurrency(+envelope.spent, currencyConfig)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tEnvelope("detail.percentOfLimit", {
                          percent: (percentage ?? 0).toFixed(1),
                        })}
                      </p>
                    </dd>
                  </div>
                )}

                {/* The transaction count gets its own row rather than
                    riding as a caption under the limit - it has nothing
                    to do with the limit itself, and reading them stacked
                    together read as if they were related. */}
                {!isUnlimited && (
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <dt className="text-sm text-muted-foreground">
                      {tEnvelope("detail.totalLimit")}
                    </dt>
                    <dd className="text-base font-bold">
                      {formatCurrency(+envelope.amount!, currencyConfig)}
                    </dd>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm text-muted-foreground">
                    {tEnvelope("detail.transactions")}
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

interface ExpensesResultsProps {
  envelopeId: string;
  currency: CurrencyCode;
  startDate?: string;
  endDate?: string;
  search?: string;
  methods?: string;
  order: { sort: "ASC" | "DESC"; sortBy: "date" | "amount" };
  page: number;
  limit: number;
  /** Set while a filter is active: what the banner above the list
   * needs beyond this component's own fetch. */
  filterBanner?: {
    envelopeExpenseCount: number;
    methodOptions: MethodOption[];
  };
}

/**
 * The expense list plus its pagination. Split out of the page body so
 * the envelope header/summary render without waiting on it, and so a
 * filter change only reloads this part.
 */
async function ExpensesResults({
  envelopeId,
  currency,
  startDate,
  endDate,
  search,
  methods,
  order,
  page,
  limit,
  filterBanner,
}: ExpensesResultsProps) {
  const { paymentMethodIds, includeUnassigned } = parseMethodFilter(methods);
  const expensesResult = await getExpenses(envelopeId, {
    startDate,
    endDate,
    search,
    paymentMethodIds,
    includeUnassigned,
    sort: order.sort,
    sortBy: order.sortBy,
    page,
    limit,
  });

  const banner = filterBanner
    ? await buildFilterBanner({
        envelopeId,
        methodOptions: filterBanner.methodOptions,
        params: {
          startDate,
          endDate,
          search,
          methods,
          sort: order.sort === "DESC" ? undefined : order.sort,
          sortBy: order.sortBy === "date" ? undefined : order.sortBy,
          limit:
            limit === EXPENSES_DEFAULT_PAGE_SIZE ? undefined : String(limit),
        },
      })
    : null;

  return (
    <>
      {filterBanner && (
        <FilteredExpensesBanner
          shown={expensesResult.meta.total}
          total={filterBanner.envelopeExpenseCount}
          totalAmount={expensesResult.meta.totalAmount}
          currency={currency}
          chips={banner?.chips ?? []}
          clearHref={banner?.clearHref ?? `/dashboard/envelope/${envelopeId}`}
        />
      )}
      <ExpensesList expenses={expensesResult.data} currency={currency} />
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
          methods,
          sort: order.sort === "DESC" ? undefined : order.sort,
          sortBy: order.sortBy === "date" ? undefined : order.sortBy,
          limit:
            limit === EXPENSES_DEFAULT_PAGE_SIZE ? undefined : String(limit),
        }}
      />
    </>
  );
}

type ExpensesListParams = Record<
  "startDate" | "endDate" | "search" | "methods" | "sort" | "sortBy" | "limit",
  string | undefined
>;

/**
 * The banner's removable chips (one per selected payment method, one
 * for the search) and the "clear all" link. Each link is this same page
 * with that one filter dropped; order and page size are view
 * preferences, not filters, so they survive both.
 */
async function buildFilterBanner({
  envelopeId,
  methodOptions,
  params,
}: {
  envelopeId: string;
  methodOptions: MethodOption[];
  params: ExpensesListParams;
}) {
  const t = await getTranslations("expenses.filteredBanner");
  const tMethods = await getTranslations("paymentMethods.filter");

  const href = (changes: Partial<ExpensesListParams>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...changes })) {
      if (value) query.set(key, value);
    }
    const qs = query.toString();
    return `/dashboard/envelope/${envelopeId}${qs ? `?${qs}` : ""}`;
  };

  const selected = parseMethodFilter(params.methods).selected;
  const methodChips = methodOptions
    .filter((option) => selected.includes(option.id))
    .map((option) => ({
      key: option.id,
      label: option.name ?? tMethods("none"),
      color: option.color,
      removeHref: href({
        methods:
          selected.filter((id) => id !== option.id).join(",") || undefined,
      }),
    }));
  const searchChip = params.search
    ? [
        {
          key: "search",
          label: t("search", { term: params.search }),
          removeHref: href({ search: undefined }),
        },
      ]
    : [];

  return {
    chips: [...methodChips, ...searchChip],
    clearHref: href({
      methods: undefined,
      search: undefined,
      startDate: undefined,
      endDate: undefined,
    }),
  };
}
