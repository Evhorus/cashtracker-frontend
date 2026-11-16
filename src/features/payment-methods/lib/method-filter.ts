/**
 * The payment method filter as it lives in the URL: `?methods=a,b,none`,
 * where `none` stands for "expenses without a payment method". Nothing
 * selected means no filter at all.
 */

export const UNASSIGNED_METHOD = "none";

export interface MethodFilter {
  /** Everything selected, `none` included - what the control shows. */
  selected: string[];
  /** What the API takes. */
  paymentMethodIds: string[];
  includeUnassigned: boolean;
}

export function parseMethodFilter(param: string | undefined): MethodFilter {
  const selected = (param ?? "").split(",").filter(Boolean);
  return {
    selected,
    paymentMethodIds: selected.filter((id) => id !== UNASSIGNED_METHOD),
    includeUnassigned: selected.includes(UNASSIGNED_METHOD),
  };
}

export function toggleMethod(selected: string[], id: string): string[] {
  return selected.includes(id)
    ? selected.filter((current) => current !== id)
    : [...selected, id];
}

/** The slice of an expense this needs. */
interface ExpenseWithMethod {
  paymentMethod: { id: string; name: string; color: string } | null;
}

export interface MethodOption {
  /** A payment method id, or UNASSIGNED_METHOD. */
  id: string;
  /** Null for UNASSIGNED_METHOD: its label is translated where shown. */
  name: string | null;
  color: string | null;
}

/**
 * What the filter can offer for a set of expenses: only the payment
 * methods actually used in them (in order of first appearance), plus
 * "no payment method" when some have none. Fewer than two options means
 * there is nothing to tell apart, so the filter is not worth showing -
 * the caller gets an empty list.
 */
export function methodOptionsFor(
  expenses: ExpenseWithMethod[],
): MethodOption[] {
  const options = new Map<string, MethodOption>();
  for (const { paymentMethod } of expenses) {
    if (paymentMethod) {
      options.set(paymentMethod.id, {
        id: paymentMethod.id,
        name: paymentMethod.name,
        color: paymentMethod.color,
      });
    }
  }
  if (expenses.some((expense) => expense.paymentMethod === null)) {
    options.set(UNASSIGNED_METHOD, {
      id: UNASSIGNED_METHOD,
      name: null,
      color: null,
    });
  }
  return options.size >= 2 ? [...options.values()] : [];
}
