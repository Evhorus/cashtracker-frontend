import { describe, expect, it } from "vitest";

import {
  filterInstancesInRange,
  getPeriodInstances,
  typeFitsWithinRange,
  yearFitsWithinRange,
} from "./period-ranges";

describe("getPeriodInstances", () => {
  it("returns one entry per month, in calendar order, for a single year", () => {
    const instances = getPeriodInstances("month", [2026]);

    expect(instances).toHaveLength(12);
    expect(instances[0]).toEqual({
      value: "2026-01",
      startMonthKey: "2026-01",
      endMonthKey: "2026-01",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });
    expect(instances[11]).toEqual({
      value: "2026-12",
      startMonthKey: "2026-12",
      endMonthKey: "2026-12",
      startDate: "2026-12-01",
      endDate: "2026-12-31",
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

  it("splits a year into 4 calendar quarters, earliest first", () => {
    const instances = getPeriodInstances("quarter", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-Q1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-03",
        startDate: "2026-01-01",
        endDate: "2026-03-31",
      },
      {
        value: "2026-Q2",
        startMonthKey: "2026-04",
        endMonthKey: "2026-06",
        startDate: "2026-04-01",
        endDate: "2026-06-30",
      },
      {
        value: "2026-Q3",
        startMonthKey: "2026-07",
        endMonthKey: "2026-09",
        startDate: "2026-07-01",
        endDate: "2026-09-30",
      },
      {
        value: "2026-Q4",
        startMonthKey: "2026-10",
        endMonthKey: "2026-12",
        startDate: "2026-10-01",
        endDate: "2026-12-31",
      },
    ]);
  });

  it("splits a year into 3 four-month periods, earliest first", () => {
    const instances = getPeriodInstances("fourMonth", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-F1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-04",
        startDate: "2026-01-01",
        endDate: "2026-04-30",
      },
      {
        value: "2026-F2",
        startMonthKey: "2026-05",
        endMonthKey: "2026-08",
        startDate: "2026-05-01",
        endDate: "2026-08-31",
      },
      {
        value: "2026-F3",
        startMonthKey: "2026-09",
        endMonthKey: "2026-12",
        startDate: "2026-09-01",
        endDate: "2026-12-31",
      },
    ]);
  });

  it("splits a year into 2 semesters, earliest first", () => {
    const instances = getPeriodInstances("semester", [2026]);

    expect(instances).toEqual([
      {
        value: "2026-S1",
        startMonthKey: "2026-01",
        endMonthKey: "2026-06",
        startDate: "2026-01-01",
        endDate: "2026-06-30",
      },
      {
        value: "2026-S2",
        startMonthKey: "2026-07",
        endMonthKey: "2026-12",
        startDate: "2026-07-01",
        endDate: "2026-12-31",
      },
    ]);
  });

  it("orders multiple years oldest-year-first, each still earliest-period-first", () => {
    const instances = getPeriodInstances("semester", [2026, 2025]);

    expect(instances.map((i) => i.value)).toEqual([
      "2025-S1",
      "2025-S2",
      "2026-S1",
      "2026-S2",
    ]);
  });

  it("returns an empty list for no years", () => {
    expect(getPeriodInstances("quarter", [])).toEqual([]);
  });
});

describe("filterInstancesInRange", () => {
  it("drops a semester entirely before the range's start", () => {
    // A range starting mid-year (1 Jul 2025) shouldn't offer "ene - jun
    // 2025" as a semester option - that half-year never happened as far
    // as the range the user actually marked is concerned.
    const instances = getPeriodInstances("semester", [2025, 2026]);

    const filtered = filterInstancesInRange(
      instances,
      "2025-07-01",
      "2026-07-01",
    );

    expect(filtered.map((i) => i.value)).toEqual([
      "2025-S2",
      "2026-S1",
      "2026-S2",
    ]);
  });

  it("keeps a period the range only partially overlaps", () => {
    // The range ends 1 Jul 2026, one day into "2026-S2" (Jul - Dec) -
    // that semester still overlaps the marked range, so it stays.
    const instances = getPeriodInstances("semester", [2026]);

    const filtered = filterInstancesInRange(
      instances,
      "2026-01-01",
      "2026-07-01",
    );

    expect(filtered.map((i) => i.value)).toEqual(["2026-S1", "2026-S2"]);
  });

  it("keeps a period the range falls entirely inside", () => {
    const instances = getPeriodInstances("quarter", [2026]);

    const filtered = filterInstancesInRange(
      instances,
      "2026-08-01",
      "2026-08-15",
    );

    expect(filtered.map((i) => i.value)).toEqual(["2026-Q3"]);
  });
});

describe("typeFitsWithinRange", () => {
  it("rejects a type whose every instance overflows a short marked range", () => {
    // 1 Jul - 1 Sep 2025 is 2 months - no calendar quarter (3 months)
    // fits entirely inside it, so offering "Trimestre" here would only
    // ever apply something wider than what was actually marked.
    expect(
      typeFitsWithinRange("quarter", [2025], "2025-07-01", "2025-09-01"),
    ).toBe(false);
  });

  it("accepts a type with at least one instance fully inside the range", () => {
    // August 2025 fits entirely inside 1 Jul - 1 Sep 2025.
    expect(
      typeFitsWithinRange("month", [2025], "2025-07-01", "2025-09-01"),
    ).toBe(true);
  });

  it("accepts a semester that fits inside a full-year-plus-a-day range", () => {
    // 1 Jul 2025 - 1 Jul 2026 fully contains "2025-S2" (Jul - Dec 2025).
    expect(
      typeFitsWithinRange(
        "semester",
        [2025, 2026],
        "2025-07-01",
        "2026-07-01",
      ),
    ).toBe(true);
  });
});

describe("yearFitsWithinRange", () => {
  it("rejects a year when the range starts mid-year", () => {
    // Neither calendar year 2025 nor 2026 fits entirely inside a range
    // that starts 1 Jul 2025 and ends 1 Jul 2026 - both spill outside it.
    expect(yearFitsWithinRange(2025, "2025-07-01", "2026-07-01")).toBe(false);
    expect(yearFitsWithinRange(2026, "2025-07-01", "2026-07-01")).toBe(false);
  });

  it("accepts a year the range fully contains", () => {
    expect(yearFitsWithinRange(2026, "2025-06-01", "2027-01-01")).toBe(true);
  });
});
