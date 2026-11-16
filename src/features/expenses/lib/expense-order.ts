/**
 * The orders an envelope's expense list offers, and how each one maps to
 * the URL (`?sort=ASC&sortBy=amount`) and to the API, which takes the
 * same two params. Newest first is the default, so it leaves no param.
 */

export const EXPENSE_ORDERS = [
  "newest",
  "oldest",
  "highest",
  "lowest",
] as const;
export type ExpenseOrder = (typeof EXPENSE_ORDERS)[number];

interface OrderParams {
  sort: "ASC" | "DESC";
  sortBy: "date" | "amount";
}

const PARAMS: Record<ExpenseOrder, OrderParams> = {
  newest: { sort: "DESC", sortBy: "date" },
  oldest: { sort: "ASC", sortBy: "date" },
  highest: { sort: "DESC", sortBy: "amount" },
  lowest: { sort: "ASC", sortBy: "amount" },
};

export function parseExpenseOrder(
  sort: string | null | undefined,
  sortBy: string | null | undefined,
): ExpenseOrder {
  const byAmount = sortBy === "amount";
  if (sort === "ASC") return byAmount ? "lowest" : "oldest";
  return byAmount ? "highest" : "newest";
}

export function expenseOrderParams(order: ExpenseOrder): OrderParams {
  return PARAMS[order];
}

/** Writes the order to URL params, leaving out what is the default. */
export function writeExpenseOrder(
  params: URLSearchParams,
  order: ExpenseOrder,
): void {
  const { sort, sortBy } = PARAMS[order];
  if (sort === "DESC") params.delete("sort");
  else params.set("sort", sort);
  if (sortBy === "date") params.delete("sortBy");
  else params.set("sortBy", sortBy);
}
