import { describe, expect, it } from "vitest";
import {
  monthBounds,
  parseReportFilters,
  shiftMonth,
  toApiQuery,
  toSearchParams,
  type ReportFilters,
} from "./report-filters";

const TODAY_MONTH = "2026-11";

const defaults: ReportFilters = {
  methodIds: [],
  includeUnassigned: false,
  period: "month",
  month: TODAY_MONTH,
  view: "single",
};

describe("parseReportFilters", () => {
  it("defaults to everything in the current calendar month, as one list", () => {
    expect(parseReportFilters({}, TODAY_MONTH)).toEqual(defaults);
  });

  it("reads the selected methods, with `none` meaning no payment method", () => {
    expect(
      parseReportFilters(
        {
          methods: "a,none,b",
          period: "cycle",
          month: "2026-10",
          view: "split",
        },
        TODAY_MONTH,
      ),
    ).toEqual({
      methodIds: ["a", "b"],
      includeUnassigned: true,
      period: "cycle",
      month: "2026-10",
      view: "split",
    });
  });

  it("keeps a complete custom range", () => {
    expect(
      parseReportFilters(
        { period: "custom", from: "2026-01-10", to: "2026-03-05" },
        TODAY_MONTH,
      ),
    ).toEqual({
      ...defaults,
      period: "custom",
      startDate: "2026-01-10",
      endDate: "2026-03-05",
    });
  });

  it("falls back to the calendar month for an incomplete or reversed range", () => {
    expect(
      parseReportFilters({ period: "custom", from: "2026-01-10" }, TODAY_MONTH),
    ).toEqual(defaults);
    expect(
      parseReportFilters(
        { period: "custom", from: "2026-03-05", to: "2026-01-10" },
        TODAY_MONTH,
      ),
    ).toEqual(defaults);
  });

  it("ignores values it does not know", () => {
    expect(
      parseReportFilters(
        { period: "week", month: "2026-13", view: "grid", from: "nope" },
        TODAY_MONTH,
      ),
    ).toEqual(defaults);
  });
});

describe("toSearchParams", () => {
  it("leaves the defaults out of the URL", () => {
    expect(toSearchParams(defaults, TODAY_MONTH).toString()).toBe("");
  });

  it("round-trips through parseReportFilters", () => {
    const filters: ReportFilters = {
      methodIds: ["a", "b"],
      includeUnassigned: true,
      period: "custom",
      month: TODAY_MONTH,
      startDate: "2026-01-10",
      endDate: "2026-03-05",
      view: "split",
    };
    const params = Object.fromEntries(toSearchParams(filters, TODAY_MONTH));
    expect(parseReportFilters(params, TODAY_MONTH)).toEqual(filters);
  });
});

describe("toApiQuery", () => {
  it("sends the month for month and cycle periods", () => {
    expect(
      toApiQuery({
        ...defaults,
        period: "cycle",
        methodIds: ["a", "b"],
      }).toString(),
    ).toBe("period=cycle&month=2026-11&paymentMethodIds=a%2Cb");
  });

  it("sends the range for a custom period, and the unassigned flag", () => {
    expect(
      toApiQuery({
        ...defaults,
        period: "custom",
        startDate: "2026-01-10",
        endDate: "2026-03-05",
        includeUnassigned: true,
      }).toString(),
    ).toBe(
      "period=custom&startDate=2026-01-10&endDate=2026-03-05&includeUnassigned=true",
    );
  });
});

describe("shiftMonth", () => {
  it("moves across year boundaries", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});

describe("monthBounds", () => {
  it("knows the last day of the month", () => {
    expect(monthBounds("2028-02")).toEqual({
      startDate: "2028-02-01",
      endDate: "2028-02-29",
    });
  });
});
