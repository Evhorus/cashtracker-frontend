import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryTileProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  /**
   * "primary" (the default) is the standard tile look. "alert" tints the
   * icon amber for a non-zero count that wants attention, and "muted" is
   * the resting look for a count of zero. The "En alerta" tile switches
   * between alert and muted on its own count, which is why this is a
   * prop rather than baked into a variant per tile.
   */
  tone?: "primary" | "alert" | "muted";
}

/**
 * One of Resumen's small count tiles ("Sobres activos", "En alerta").
 * Extracted from dashboard/page.tsx, where the two were near-identical
 * JSX blocks assigned to local variables so they could be rendered in
 * either of the page's two layouts.
 */
export function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
}: SummaryTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          tone === "alert" && "bg-amber-500/10 text-amber-500",
          tone === "muted" && "bg-muted text-muted-foreground",
          tone === "primary" && "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono text-lg font-semibold">{value}</span>
    </div>
  );
}
