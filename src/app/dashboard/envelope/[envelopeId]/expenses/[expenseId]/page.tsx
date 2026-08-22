import { auth } from "@clerk/nextjs/server";
import { getEnvelopeByIdAction } from "@/features/envelopes/actions/get-envelope-by-id.action";
import { getExpenseByIdAction } from "@/features/expenses/actions/get-expense-by-id.action";
import { DeleteExpenseAlertDialog } from "@/features/expenses/components/delete-expense-alert-dialog";
import { UpdateExpenseDialog } from "@/features/expenses/components/update-expense-dialog";
import { ExpenseActionsMenu } from "@/features/expenses/components/expense-actions-menu";
import { PageHeader } from "@/components/common/page-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CURRENCY_MAP, formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/date-helpers";
import {
  Calendar,
  FileText,
  Infinity as InfinityIcon,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { EnvelopeHelpers } from "@/features/envelopes/lib/envelope-helpers";

// Force dynamic rendering because this page uses Clerk auth
export const dynamic = "force-dynamic";

interface ExpensePageProps {
  params: Promise<{ envelopeId: string; expenseId: string }>;
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  await auth.protect();
  const { envelopeId, expenseId } = await params;
  const expense = await getExpenseByIdAction(envelopeId, expenseId);
  const envelope = await getEnvelopeByIdAction(envelopeId);

  const isUnlimited = envelope.amount === null;
  const envelopeAmount = envelope.amount === null ? null : +envelope.amount;
  const envelopeSpent = +envelope.spent;
  const expenseAmount = +expense.amount;
  const currencyConfig = CURRENCY_MAP[envelope.currency];
  const impactPercentage =
    envelopeAmount === null ? null : (expenseAmount / envelopeAmount) * 100;

  // Determine envelope health color (soft limit - never blocks, just informs)
  const progressStatus = EnvelopeHelpers.getProgressStatus(envelope);
  const isOverLimit = progressStatus === "exceeded";
  const isHealthy = progressStatus === "normal";
  const healthColor = isUnlimited
    ? "text-muted-foreground"
    : isOverLimit
      ? "text-destructive"
      : isHealthy
        ? "text-emerald-500"
        : "text-amber-500";

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header Section */}
      <PageHeader
        title="Detalle del Gasto"
        backUrl={`/dashboard/envelope/${envelopeId}`}
        description={
          <>
            <span className="text-sm">En el sobre:</span>
            <Link
              href={`/dashboard/envelope/${envelopeId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {envelope.name}
            </Link>
          </>
        }
        actions={
          <>
            <UpdateExpenseDialog
              envelopeId={envelopeId}
              currency={envelope.currency}
              expense={expense}
            />
            <DeleteExpenseAlertDialog
              envelopeId={envelopeId}
              expenseId={expenseId}
            />
          </>
        }
        mobileActions={
          <ExpenseActionsMenu
            envelopeId={envelopeId}
            currency={envelope.currency}
            expense={expense}
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Expense Highlight Card */}
          <Card className="overflow-hidden border-0 bg-linear-to-br from-card to-secondary/10 shadow-md">
            <CardContent className="p-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {expense.name}
                    </h2>
                    <div className="flex w-fit items-center gap-2 rounded-full bg-background/50 px-2.5 py-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium sm:text-sm">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pl-18 text-left sm:pl-0 md:text-right">
                  <p className="mb-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                    Monto Total
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                    {formatCurrency(expenseAmount, currencyConfig)}
                  </p>
                </div>
              </div>

              {expense.description && (
                <div className="mt-8 border-t border-border/50 pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Descripción
                  </h3>
                  <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
                    {expense.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Meta Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información de Sistema</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground">Creado el</p>
                <p className="font-medium">{formatDate(expense.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Última actualización</p>
                <p className="font-medium">{formatDate(expense.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width) - Impact & Context */}
        <div className="space-y-6">
          {/* Impact Analysis */}
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="pt-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                Impacto en el Sobre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {isUnlimited ? (
                <div className="flex flex-col items-center gap-2 py-2 text-center">
                  <InfinityIcon className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Este sobre no tiene límite de gasto
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <span className="w-full text-sm font-medium text-muted-foreground">
                      Representa el
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {(impactPercentage ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min(impactPercentage ?? 0, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-right text-xs text-muted-foreground">
                    del total asignado (
                    {formatCurrency(envelopeAmount ?? 0, currencyConfig)})
                  </p>
                </div>
              )}

              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado del Sobre</span>
                  <span
                    className={`rounded-md border bg-muted/50 px-3 py-1 text-xs font-bold ${healthColor}`}
                  >
                    {isUnlimited
                      ? "SIN LÍMITE"
                      : isOverLimit
                        ? "EXCEDIDO"
                        : isHealthy
                          ? "SALUDABLE"
                          : "EN RIESGO"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gastado Total</span>
                    <span className="font-semibold">
                      {formatCurrency(envelopeSpent, currencyConfig)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
