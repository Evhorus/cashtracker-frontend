"use client";

import { Download, Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { buildReportCsv } from "../lib/report-csv";
import type { ReportExpense } from "../types";

interface ReportActionsProps {
  expenses: ReportExpense[];
  /** Describes the period, for the file name ("2026-10", "cycle-2026-10"). */
  periodSlug: string;
}

/** Byte-order mark: without it Excel reads the UTF-8 file as Latin-1
 * and "Categorías" comes out as "CategorÃ­as". */
const UTF8_BOM = "﻿";

function download(fileName: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([UTF8_BOM, content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export: a CSV for a spreadsheet, or the browser's print dialog, where
 * "Save as PDF" covers the PDF case without a PDF library. The page's
 * print styles hide the app's chrome and the filters.
 */
export function ReportActions({ expenses, periodSlug }: ReportActionsProps) {
  const t = useTranslations("expensesReport");
  const locale = useLocale();

  const downloadCsv = () => {
    const csv = buildReportCsv(
      expenses,
      {
        date: t("csv.date"),
        name: t("csv.name"),
        envelope: t("csv.envelope"),
        paymentMethod: t("csv.paymentMethod"),
        amount: t("csv.amount"),
        currency: t("csv.currency"),
        description: t("csv.description"),
        noPaymentMethod: t("filters.noPaymentMethod"),
      },
      locale,
    );
    download(`${t("actions.fileName")}-${periodSlug}.csv`, csv);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button
        variant="outline"
        onClick={downloadCsv}
        disabled={expenses.length === 0}
      >
        <Download />
        {t("actions.csv")}
      </Button>
      <Button
        variant="outline"
        onClick={() => window.print()}
        disabled={expenses.length === 0}
      >
        <Printer />
        {t("actions.print")}
      </Button>
    </div>
  );
}
