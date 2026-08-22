"use server";

import { auth } from "@clerk/nextjs/server";
import { Expense } from "@/features/expenses/types";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface GetExpensesFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  categoryId?: string;
  sort?: string;
}

export const getExpensesAction = async (
  envelopeId: string,
  filters: GetExpensesFilters,
): Promise<Expense[]> => {
  await auth.protect();

  try {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.search) params.append("search", filters.search);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.sort) params.append("sort", filters.sort);

    const queryString = params.toString();
    const url = `/envelopes/${envelopeId}/expenses${
      queryString ? `?${queryString}` : ""
    }`;

    await auth.protect();
    const req = await authenticatedFetch(url, {
      next: {
        tags: [`expenses-${envelopeId}`],
        revalidate: 0, // Always fresh for filters
      },
    });

    if (!req.ok) {
      console.error("Failed to fetch expenses");
      return [];
    }

    const expenses: Expense[] = await req.json();
    return expenses;
  } catch (error) {
    console.error("Error fetching filtered expenses:", error);
    return [];
  }
};
