"use server";

import { auth } from "@clerk/nextjs/server";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";

export const getDashboardSummaryAction = async (year?: number) => {
  await auth.protect();
  return DashboardService.getSummary(year);
};
