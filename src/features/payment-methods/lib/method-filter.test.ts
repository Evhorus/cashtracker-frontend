import { describe, expect, it } from "vitest";
import {
  methodOptionsFor,
  parseMethodFilter,
  toggleMethod,
  UNASSIGNED_METHOD,
} from "./method-filter";

describe("parseMethodFilter", () => {
  it("is empty (everything) without the param", () => {
    expect(parseMethodFilter(undefined)).toEqual({
      selected: [],
      paymentMethodIds: [],
      includeUnassigned: false,
    });
  });

  it("splits the ids from `none`", () => {
    expect(parseMethodFilter(`a,${UNASSIGNED_METHOD},b`)).toEqual({
      selected: ["a", UNASSIGNED_METHOD, "b"],
      paymentMethodIds: ["a", "b"],
      includeUnassigned: true,
    });
  });

  it("ignores empty pieces", () => {
    expect(parseMethodFilter(",a,,").selected).toEqual(["a"]);
  });
});

describe("toggleMethod", () => {
  it("adds and removes", () => {
    expect(toggleMethod(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleMethod(["a", "b"], "a")).toEqual(["b"]);
  });
});

describe("methodOptionsFor", () => {
  const davivienda = { id: "d", name: "Davivienda", color: "red" };
  const davibank = { id: "b", name: "Davibank", color: "blue" };

  it("offers only the methods used, once each, plus `none` when needed", () => {
    expect(
      methodOptionsFor([
        { paymentMethod: davivienda },
        { paymentMethod: null },
        { paymentMethod: davivienda },
        { paymentMethod: davibank },
      ]).map((option) => option.id),
    ).toEqual(["d", "b", UNASSIGNED_METHOD]);
  });

  it("offers nothing when there is nothing to tell apart", () => {
    expect(methodOptionsFor([{ paymentMethod: davivienda }])).toEqual([]);
    expect(methodOptionsFor([{ paymentMethod: null }])).toEqual([]);
    expect(methodOptionsFor([])).toEqual([]);
  });
});
