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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";

import {
  CreditCard,
  DollarSign,
  Infinity as InfinityIcon,
  PiggyBank,
  Wallet,
} from "lucide-react";
import nextDynamic from "next/dynamic";
import { EnvelopeChartSkeleton } from "@/features/envelopes/components/envelope-chart-skeleton";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";

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
  }>;
}

export default async function EnvelopePage({
  params,
  searchParams,
}: EnvelopePageProps) {
  await auth.protect();
  const { envelopeId } = await params;
  const { startDate, endDate, search, sort } = await searchParams;

  const [envelope, expenses] = await Promise.all([
    getEnvelopeByIdAction(envelopeId),
    getExpensesAction(envelopeId, {
      startDate,
      endDate,
      search,
      sort,
    }),
  ]);

  const isUnlimited = envelope.amount === null;
  const remaining = EnvelopeHelpers.getRemaining(envelope);
  const percentage = EnvelopeHelpers.getPercentage(envelope);

  return (
    <div className="space-y-8 pb-24">
      {/* Header Section */}
      <PageHeader
        title={envelope.name}
        backUrl="/dashboard/envelopes"
        description={
          envelope.category && (
            <p className="truncate text-sm text-muted-foreground">
              {envelope.category}
            </p>
          )
        }
        actions={
          <>
            <UpdateEnvelopeDialog envelope={envelope} />
            <DeleteEnvelopeAlertDialog id={envelopeId} name={envelope.name} />
          </>
        }
        mobileActions={<EnvelopeActionsMenu envelope={envelope} />}
      />

      {/* Stats Grid - Top on all devices */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          className={
            isUnlimited
              ? "border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card"
              : remaining !== null && remaining < 0
                ? "border-destructive/50 bg-destructive/5"
                : remaining !== null &&
                    remaining < (envelope.amount ? +envelope.amount * 0.2 : 0)
                  ? "border-warning/50 bg-warning/5"
                  : "border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponible
            </CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                remaining !== null && remaining < 0
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              }`}
            >
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isUnlimited ? (
              <div className="flex items-center gap-1.5 text-2xl font-bold text-muted-foreground">
                <InfinityIcon className="h-5 w-5" />
                Sin límite
              </div>
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    remaining !== null && remaining < 0
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {formatCurrency(remaining ?? 0)}
                </div>
                {remaining !== null && remaining < 0 && (
                  <p className="mt-1 text-xs text-destructive">
                    Presupuesto excedido
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(+envelope.spent)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isUnlimited
                ? "Sin límite de presupuesto"
                : `${(percentage ?? 0).toFixed(1)}% del presupuesto`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 shadow-sm transition-colors duration-300 hover:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presupuesto Total
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <PiggyBank className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isUnlimited ? "Sin límite" : formatCurrency(+envelope.amount!)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {envelope.expenses.length} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Expenses List (Larger) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-row items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <DollarSign className="h-5 w-5 text-primary" />
              Historial de Gastos
            </h2>
            <CreateExpenseDialog
              envelopeId={envelope.id}
              currency={envelope.currency}
            />
          </div>

          <ExpensesFilter />
          <ExpensesList expenses={expenses} currency={envelope.currency} />
        </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
          <div className="h-[300px] w-full">
            {isUnlimited ? (
              <Card className="flex h-full flex-col items-center justify-center gap-2 border-0 text-center shadow-sm">
                <InfinityIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Este presupuesto no tiene límite de gasto
                </p>
                <p className="text-lg font-bold">
                  {formatCurrency(+envelope.spent)} gastado
                </p>
              </Card>
            ) : (
              <EnvelopeChart
                spent={+envelope.spent}
                total={+envelope.amount!}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
