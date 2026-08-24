"use server";

import { auth } from "@clerk/nextjs/server";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";

export const getRecentExpensesAction = async (limit?: number) => {
  await auth.protect();
  return DashboardService.getRecentExpenses(limit);
};
