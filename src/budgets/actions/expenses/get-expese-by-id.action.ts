'use server';
import {
  BudgetResponse,
  ExpenseResponse,
} from '@/budgets/types/budget-response';
import { getTokenFromCookies } from '@/shared/lib/get-token-from-cookies';

export const getExpenseByIdAction = async (
  budgetId: string,
  expenseId: string
) => {
  const URL = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;

  const TOKEN = await getTokenFromCookies();
  try {
    const req = await fetch(URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        tags: ['expense'],
      },
    });

    const json = await req.json();

    if (!req.ok) {
      throw new Error('Failed to fetch budgets');
    }

    const expense: ExpenseResponse = json;

    return expense;
  } catch (error) {
    console.error('Error fetching budget by id:', error);
    throw error;
  }
};
