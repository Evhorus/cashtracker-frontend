"use server";

import { auth } from "@clerk/nextjs/server";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";

export const getDashboardSummaryAction = async (
  year?: number,
  currency?: string,
) => {
  await auth.protect();
  return DashboardService.getSummary(year, currency);
};
