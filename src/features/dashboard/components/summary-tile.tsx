import Link from "next/link";
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
  /**
   * Where the tile goes. Both of Resumen's tiles have one: a count of
   * envelopes that a reader cannot open is a dead end, and this one
   * looked clickable enough that it was reported as broken navigation.
   */
  href: string;
}

/**
 * One of the summary page's small count tiles. Extracted from
 * dashboard/page.tsx, where the two were near-identical JSX blocks
 * assigned to local variables so they could be rendered in either of the
 * page's two layouts.
 */
export function SummaryTile({
  icon: Icon,
  label,
  value,
  tone = "primary",
  href,
}: SummaryTileProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3.5 transition-colors hover:border-border hover:bg-card"
    >
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
    </Link>
  );
}
