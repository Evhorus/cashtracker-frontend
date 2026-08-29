import { EnvelopeFormValues } from "../schemas/envelope.schema";
import { Envelope } from "../types";
import { EnvelopeApi } from "../schemas/envelope.schema";
import { ExpenseMapper } from "@/features/expenses/mappers/expense.mapper";
import type { CurrencyCode } from "@/lib/format-currency";

export const EnvelopeMapper = {
  /**
   * UI -> API (Outbound)
   * Handles Colombian currency formatting (removing dots) before converting to number
   */
  toApiRequest: (data: EnvelopeFormValues) => ({
    name: data.name,
    amount: data.hasLimit ? Number(data.amount) : null,
    currency: data.currency,
    category: data.category,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Envelope)
   */
  fromApi: (apiEnvelope: EnvelopeApi): Envelope => {
    return {
      id: apiEnvelope.id,
      name: apiEnvelope.name,
      amount: apiEnvelope.amount,
      // The API schema types this as a loose string (z.string().default);
      // the domain model narrows it to the known currency codes, since
      // it's the app's own form that ever writes this value.
      currency: apiEnvelope.currency as CurrencyCode,
      spent: apiEnvelope.spent,
      status: apiEnvelope.status,
      category: apiEnvelope.category ?? undefined,
      description: apiEnvelope.description ?? undefined,
      createdAt: new Date(apiEnvelope.createdAt),
      updatedAt: new Date(apiEnvelope.updatedAt),
      // Absent on the paginated list endpoint - only the detail endpoint
      // embeds expenses.
      expenses: apiEnvelope.expenses?.map(ExpenseMapper.fromApi) ?? [],
    };
  },
};
