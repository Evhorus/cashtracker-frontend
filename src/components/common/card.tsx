import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import {
  Card as UiCard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

/**
 * App-wide Card. Wraps the stock shadcn Card (components/ui/card.tsx)
 * instead of modifying it directly, so `ui/` stays regenerable via
 * `shadcn add card --overwrite`.
 *
 * Adds a translucent background (`bg-card/50`) that turns solid on hover
 * (paired with `hover:bg-card` at each call site) - a deliberate design
 * pattern used across StatsCards, BudgetCard/EnvelopeCard, ExpenseCard and
 * the envelope detail page.
 */
function Card({ className, ...props }: ComponentProps<typeof UiCard>) {
  return <UiCard className={cn('bg-card/50', className)} {...props} />;
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
