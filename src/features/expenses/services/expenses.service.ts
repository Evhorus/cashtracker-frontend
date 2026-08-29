import { fetchApi } from "@/lib/api-client";
import { Expense } from "@/features/expenses/types";
import {
  appendPaginationParams,
  type PaginationMeta,
  type PaginationParams,
} from "@/lib/pagination";
import {
  ExpenseFormValues,
  ExpenseAPIResponseSchema,
  ExpensesAPIResponseSchema,
  ExpenseApi,
  ExpensesResponseApi,
} from "../schemas/expense.schema";
import { ExpenseMapper } from "../mappers/expense.mapper";

export interface GetExpensesParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  categoryId?: string;
  sort?: "ASC" | "DESC";
}

export interface ExpensesResponse {
  data: Expense[];
  meta: PaginationMeta;
}

export const ExpensesService = {
  getAll: async (
    envelopeId: string,
    params?: GetExpensesParams,
  ): Promise<ExpensesResponse> => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.search) query.set("search", params.search);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.sort) query.set("sort", params.sort);
    if (params) appendPaginationParams(query, params);
    const qs = query.toString();

    const response = await fetchApi<ExpensesResponseApi>(
      `/envelopes/${envelopeId}/expenses${qs ? `?${qs}` : ""}`,
      {
        // revalidate: 0 means this is never cached, which is why the tag
        // below has no effect - and indeed no action invalidates it. The
        // expense list is filtered/sorted/paginated per request, so not
        // caching it is the right call; the tag is vestigial.
        next: { tags: [`expenses-${envelopeId}`], revalidate: 0 },
      },
      ExpensesAPIResponseSchema,
    );

    return {
      data: response.data.map(ExpenseMapper.fromApi),
      meta: response.meta,
    };
  },

  getById: async (envelopeId: string, expenseId: string): Promise<Expense> => {
    const expense = await fetchApi<ExpenseApi>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        // NOTE: this tag is global, not per-id, so invalidating it on a
        // mutation drops every cached expense detail rather than just the
        // one that changed. Correct but wasteful - should become
        // `expense-${id}`. Left as-is for now; see the audit follow-ups.
        next: { tags: ["expense"], revalidate: 60 },
      },
      ExpenseAPIResponseSchema,
    );

    return ExpenseMapper.fromApi(expense);
  },

  create: (envelopeId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(`/envelopes/${envelopeId}/expenses`, {
      method: "POST",
      body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
    });
  },

  update: (envelopeId: string, expenseId: string, data: ExpenseFormValues) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        method: "PATCH",
        body: JSON.stringify(ExpenseMapper.toApiRequest(data)),
      },
    );
  },

  delete: (envelopeId: string, expenseId: string) => {
    return fetchApi<{ message: string }>(
      `/envelopes/${envelopeId}/expenses/${expenseId}`,
      {
        method: "DELETE",
      },
    );
  },
};
