import { cn } from "@/lib/utils";
import {
  EnvelopeHelpers,
  type EnvelopeProgressStatus,
} from "@/features/envelopes/lib/envelope-helpers";

interface EnvelopeStatusBadgeProps {
  status: EnvelopeProgressStatus;
  /**
   * "badge": a tinted pill (envelopes-table.tsx's desktop "Estado"
   * column). "text": plain colored text, no pill (the expense detail
   * page's "Estado del Sobre" line). Same label and color either way -
   * only the container changes. Defaults to "badge".
   */
  variant?: "badge" | "text";
  className?: string;
}

/**
 * The one place an envelope's status word gets rendered - label and
 * color both come from EnvelopeHelpers, so every screen shows the same
 * word for the same status. Before this, the envelopes table's own
 * "Activo"/"Alerta" badge and the expense detail page's "Controlado"/
 * "En riesgo" text were two independently hand-rolled labels for the
 * exact same two statuses.
 */
export function EnvelopeStatusBadge({
  status,
  variant = "badge",
  className,
}: EnvelopeStatusBadgeProps) {
  const label = EnvelopeHelpers.getStatusLabel(status);

  if (variant === "text") {
    return (
      <span
        className={cn(
          "text-sm font-semibold",
          EnvelopeHelpers.getStatusTextColorClass(status),
          className,
        )}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        EnvelopeHelpers.getStatusBadgeClass(status),
        className,
      )}
    >
      {label}
    </span>
  );
}
