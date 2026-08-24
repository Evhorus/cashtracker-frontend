import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-muted bg-size-[250%_100%] bg-linear-to-r from-muted from-35% via-[color-mix(in_oklch,var(--color-muted),var(--color-foreground)_8%)] via-50% to-muted to-65%",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
