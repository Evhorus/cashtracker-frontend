import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/common/typography";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /**
   * "filtered" (the default) is the "nothing matches this search/filter"
   * case: compact, no call to action, because the fix is to change the
   * filter and a CTA would only distract. "first-run" is the "you have
   * none of these yet" case: taller, serif heading, and the place an
   * `action` belongs.
   */
  variant?: "filtered" | "first-run";
  /** Small all-caps line above the title. first-run only. */
  eyebrow?: string;
  /** A CTA - meaningful for "first-run", not for "no results". */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The shared shape for every empty list/section in the app. The card,
 * the tinted icon circle, the heading and the copy were copy-pasted at
 * five call sites (the envelopes grid's two states, the expenses list,
 * the categories table, Resumen's first run), which is how they drifted:
 * some had a CTA and some didn't, the headings were hand-styled
 * `text-xl font-semibold` rather than going through Heading, and only
 * the envelopes grid distinguished "no results" from "none yet" at all.
 *
 * Keeps the distinction that actually matters and was easy to forget: a
 * filtered-to-nothing list must not read as an empty account, and must
 * not offer a "create your first one" CTA that wouldn't help someone
 * whose search simply didn't match.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  variant = "filtered",
  eyebrow,
  action,
  className,
}: EmptyStateProps) {
  const isFirstRun = variant === "first-run";

  return (
    <Card
      className={cn(
        "animate-fade-in border-0 bg-card/50 text-center shadow-sm",
        isFirstRun ? "px-6 py-16" : "p-12",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto space-y-4",
          isFirstRun ? "max-w-sm space-y-5" : "max-w-md",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-center rounded-full bg-primary/10",
            isFirstRun ? "h-20 w-20" : "h-16 w-16",
          )}
        >
          <Icon
            className={cn("text-primary", isFirstRun ? "h-9 w-9" : "h-8 w-8")}
          />
        </div>

        <div className="space-y-2">
          {isFirstRun && eyebrow && (
            <p className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              {eyebrow}
            </p>
          )}
          <Heading as="h3" size={isFirstRun ? "display" : "empty"}>
            {title}
          </Heading>
          <Text>{description}</Text>
        </div>

        {action && <div className="flex justify-center pt-1">{action}</div>}
      </div>
    </Card>
  );
}
