import { describe, expect, it } from "vitest";

import {
  formatCalendarDate,
  formatCalendarDateForApi,
  formatCalendarDateShort,
  formatMonthYear,
  getToday,
  parseCalendarDate,
  toFormCalendarDate,
} from "./date-helpers";

// These tests run under TZ=America/Bogota (UTC-5) - see vitest.config.ts
// for why a non-UTC zone is the whole point.
describe("timezone setup", () => {
  it("runs west of UTC, so calendar-vs-instant handling is observable", () => {
    const offsetMinutes = new Date("2026-09-22T00:00:00Z").getTimezoneOffset();
    expect(offsetMinutes).toBeGreaterThan(0);
  });
});

describe("parseCalendarDate", () => {
  it("anchors a date-only string at UTC midnight", () => {
    const date = parseCalendarDate("2026-09-22");

    expect(date.toISOString()).toBe("2026-09-22T00:00:00.000Z");
  });

  it("reads only the date part when the API echoes a full timestamp", () => {
    // The API does this: a Postgres `date` column comes back as a full
    // UTC timestamp. Treating it as an instant is what used to shift the
    // day for timezones behind UTC.
    const date = parseCalendarDate("2026-09-22T00:00:00.000Z");

    expect(date.toISOString()).toBe("2026-09-22T00:00:00.000Z");
  });

  it("does not shift the day in a timezone behind UTC", () => {
    const date = parseCalendarDate("2026-09-22");

    // Local getters WOULD show the 21st here (UTC-5). Reading via UTC
    // getters is what keeps the day stable, which is the contract every
    // display helper below relies on.
    expect(date.getUTCDate()).toBe(22);
    expect(date.getUTCMonth()).toBe(8);
    expect(date.getUTCFullYear()).toBe(2026);
  });
});

describe("formatCalendarDate", () => {
  it("renders the stored day, not the device-local one", () => {
    const date = parseCalendarDate("2026-09-22");

    expect(formatCalendarDate(date)).toBe("martes, 22 de septiembre de 2026");
  });

  it("holds at a month boundary, where an off-by-one would show", () => {
    const date = parseCalendarDate("2026-03-01");

    expect(formatCalendarDate(date)).toBe("domingo, 1 de marzo de 2026");
    expect(formatCalendarDateShort(date)).toBe("1 mar");
  });

  it("holds at a year boundary", () => {
    const date = parseCalendarDate("2027-01-01");

    expect(formatCalendarDate(date)).toBe("viernes, 1 de enero de 2027");
  });
});

describe("form round trip", () => {
  it("survives API -> display -> form -> API unchanged", () => {
    const fromApi = parseCalendarDate("2026-09-22");
    const inForm = toFormCalendarDate(fromApi);
    const backToApi = formatCalendarDateForApi(inForm);

    expect(backToApi).toBe("2026-09-22");
  });

  it("hands the calendar widget a locally-anchored date", () => {
    // react-day-picker reads LOCAL getters to decide what's selected, so
    // the form's copy has to be local-anchored even though the canonical
    // value is UTC-anchored.
    const inForm = toFormCalendarDate(parseCalendarDate("2026-09-22"));

    expect(inForm.getDate()).toBe(22);
    expect(inForm.getMonth()).toBe(8);
    expect(inForm.getFullYear()).toBe(2026);
  });

  it("never converts through UTC when sending a form date", () => {
    // toISOString() here would yield the 23rd for a zone ahead of UTC,
    // and the 21st for one behind it. Local components must be used.
    const localMidnight = new Date(2026, 8, 22);

    expect(formatCalendarDateForApi(localMidnight)).toBe("2026-09-22");
  });

  it("round trips every day of a month without drifting", () => {
    for (let day = 1; day <= 28; day++) {
      const iso = `2026-02-${String(day).padStart(2, "0")}`;
      const roundTripped = formatCalendarDateForApi(
        toFormCalendarDate(parseCalendarDate(iso)),
      );

      expect(roundTripped).toBe(iso);
    }
  });
});

describe("getToday", () => {
  it("is local midnight, matching what the calendar widget expects", () => {
    const today = getToday();

    expect(today.getHours()).toBe(0);
    expect(today.getMinutes()).toBe(0);
    expect(today.getSeconds()).toBe(0);
    expect(today.getMilliseconds()).toBe(0);
  });
});

describe("formatMonthYear", () => {
  it("converts a real instant into the device timezone", () => {
    // Unlike a calendar date, an instant SHOULD be localized: 03:00 UTC
    // on 1 September is still 31 August in Bogotá.
    expect(formatMonthYear("2026-09-01T03:00:00.000Z")).toBe("ago 2026");
  });
});
