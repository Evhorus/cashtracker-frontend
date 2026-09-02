import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBreakdown } from "@/features/categories/components/category-breakdown";
import { EnvelopeBreakdown } from "./envelope-breakdown";
import { ExpenseNameBreakdown } from "./expense-name-breakdown";
import { BreakdownTotal } from "./breakdown-total";
import type {
  DashboardCategoryBreakdownRow,
  DashboardEnvelopeBreakdownRow,
  DashboardNameBreakdownRow,
  DashboardBreakdownTotal as DashboardBreakdownTotalRow,
} from "@/features/dashboard/schemas/dashboard.schema";
import type { CurrencyCode } from "@/lib/format-currency";

interface BreakdownTabsProps {
  categoryRows: DashboardCategoryBreakdownRow[];
  envelopeRows: DashboardEnvelopeBreakdownRow[];
  nameRows: DashboardNameBreakdownRow[];
  total: DashboardBreakdownTotalRow;
  currency: CurrencyCode;
}

// One card, four views of the same underlying set of expenses - all
// four already fetched by the caller (BreakdownSection in
// statistics/page.tsx), so switching tabs is instant, client-side, and
// needs no extra fetch. Tabs/TabsList/etc. carry their own "use client"
// (components/ui/tabs.tsx), so this component itself doesn't need one.
export function BreakdownTabs({
  categoryRows,
  envelopeRows,
  nameRows,
  total,
  currency,
}: BreakdownTabsProps) {
  const t = useTranslations("statistics");

  return (
    <Tabs defaultValue="category">
      <TabsList>
        <TabsTrigger value="category">{t("byCategory")}</TabsTrigger>
        <TabsTrigger value="envelope">{t("byEnvelope")}</TabsTrigger>
        <TabsTrigger value="name">{t("byName")}</TabsTrigger>
        <TabsTrigger value="total">{t("byTotal")}</TabsTrigger>
      </TabsList>
      <TabsContent value="category">
        <CategoryBreakdown rows={categoryRows} currency={currency} />
      </TabsContent>
      <TabsContent value="envelope">
        <EnvelopeBreakdown rows={envelopeRows} currency={currency} />
      </TabsContent>
      <TabsContent value="name">
        <ExpenseNameBreakdown rows={nameRows} currency={currency} />
      </TabsContent>
      <TabsContent value="total">
        <BreakdownTotal total={total} currency={currency} />
      </TabsContent>
    </Tabs>
  );
}
