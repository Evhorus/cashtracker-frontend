import { describe, expect, it } from "vitest";

import { getPeriodInstances } from "./period-ranges";

describe("getPeriodInstances", () => {
  it("returns one entry per month, newest first, for a single year", () => {
    const instances = getPeriodInstances("month", [2026]);

    expect(instances).toHaveLength(12);
    expect(instances[0]).toEqual({
      value: "2026-12",
      startMonthKey: "2026-12",
      endMonthKey: "2026-12",
      startDate: "2026-12-01",
      endDate: "2026-12-31",
    });
    expect(instances[11]).toEqual({
      value: "2026-01",
      startMonthKey: "2026-01",
      endMonthKey: "2026-01",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
  });

  it("ends a February month on the 29th in a leap year", () => {
    const instances = getPeriodInstances("month", [2028]);
    const february = instances.find((i) => i.value === "2028-02");

    expect(february?.endDate).toBe("2028-02-29");
  });

  it("ends a February month on the 28th in a non-leap year", () => {
    const instances = getPeriodInstances("month", [2026]);
    const february = instances.find((i) => i.value === "2026-02");

    expect(february?.endDate).toBe("2026-02-28");
  });

  it("splits a year into 4 calendar quarters", () => {
    const instances = getPeriodInstances("quarter", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-Q4",
        startMonthKey: "2026-10",
        endMonthKey: "2026-12",
        startDate: "2026-10-01",
        endDate: "2026-12-31",
      },
      {
        value: "2026-Q3",
        startMonthKey: "2026-07",
        endMonthKey: "2026-09",
        startDate: "2026-07-01",
        endDate: "2026-09-30",
      },
      {
        value: "2026-Q2",
        startMonthKey: "2026-04",
        endMonthKey: "2026-06",
        startDate: "2026-04-01",
        endDate: "2026-06-30",
      },
      {
        value: "2026-Q1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-03",
        startDate: "2026-01-01",
        endDate: "2026-03-31",
      },
    ]);
  });

  it("splits a year into 3 four-month periods", () => {
    const instances = getPeriodInstances("fourMonth", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-F3",
        startMonthKey: "2026-09",
        endMonthKey: "2026-12",
        startDate: "2026-09-01",
        endDate: "2026-12-31",
      },
      {
        value: "2026-F2",
        startMonthKey: "2026-05",
        endMonthKey: "2026-08",
        startDate: "2026-05-01",
        endDate: "2026-08-31",
      },
      {
        value: "2026-F1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-04",
        startDate: "2026-01-01",
        endDate: "2026-04-30",
      },
    ]);
  });

  it("splits a year into 2 semesters", () => {
    const instances = getPeriodInstances("semester", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-S2",
        startMonthKey: "2026-07",
        endMonthKey: "2026-12",
        startDate: "2026-07-01",
        endDate: "2026-12-31",
      },
      {
        value: "2026-S1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-06",
        startDate: "2026-01-01",
        endDate: "2026-06-30",
      },
    ]);
  });

  it("orders multiple years newest-year-first, each still newest-period-first", () => {
    const instances = getPeriodInstances("semester", [2025, 2026]);

    expect(instances.map((i) => i.value)).toEqual([
      "2026-S2",
      "2026-S1",
      "2025-S2",
      "2025-S1",
    ]);
  });

  it("returns an empty list for no years", () => {
    expect(getPeriodInstances("quarter", [])).toEqual([]);
  });
});
