import { describe, expect, it } from "vitest";
import { buildReportCsv, type CsvLabels } from "./report-csv";
import type { ReportExpense } from "../types";

const labels: CsvLabels = {
  date: "Fecha",
  name: "Gasto",
  envelope: "Sobre",
  paymentMethod: "Medio de pago",
  amount: "Monto",
  currency: "Moneda",
  description: "Descripción",
  noPaymentMethod: "Sin medio de pago",
};

const expense = (over: Partial<ReportExpense> = {}): ReportExpense => ({
  id: "1",
  name: "Mercado",
  amount: "125000.50",
  currency: "COP",
  date: new Date(Date.UTC(2026, 9, 5)),
  envelope: { id: "e", name: "Octubre" },
  paymentMethod: { id: "p", name: "Davivienda", color: "x" },
  ...over,
});

describe("buildReportCsv", () => {
  it("uses semicolons and a decimal comma in Spanish, for Excel", () => {
    expect(buildReportCsv([expense()], labels, "es")).toBe(
      [
        "Fecha;Gasto;Sobre;Medio de pago;Monto;Moneda;Descripción",
        "2026-10-05;Mercado;Octubre;Davivienda;125000,50;COP;",
      ].join("\r\n"),
    );
  });

  it("uses commas and a decimal point in English", () => {
    expect(buildReportCsv([expense()], labels, "en").split("\r\n")[1]).toBe(
      "2026-10-05,Mercado,Octubre,Davivienda,125000.50,COP,",
    );
  });

  it("names a missing payment method and quotes what needs quoting", () => {
    const row = buildReportCsv(
      [
        expense({
          name: 'Cena; "especial"',
          paymentMethod: null,
          description: "línea 1\nlínea 2",
        }),
      ],
      labels,
      "es",
    ).split("\r\n")[1];

    expect(row).toBe(
      '2026-10-05;"Cena; ""especial""";Octubre;Sin medio de pago;125000,50;COP;"línea 1\nlínea 2"',
    );
  });

  it("neutralises cells a spreadsheet would run as a formula", () => {
    const row = buildReportCsv(
      [expense({ name: "=HYPERLINK(1)" })],
      labels,
      "es",
    ).split("\r\n")[1];

    expect(row.split(";")[1]).toBe("'=HYPERLINK(1)");
  });
});
