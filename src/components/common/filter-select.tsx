"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
  /**
   * Draws a divider above this option. Used to set a saved view apart
   * from the plain values above it - the envelopes list's "Necesitan
   * atención" is a union of two statuses rather than a status, and the
   * line says so without needing a word to explain it.
   */
  separatorBefore?: boolean;
}

interface FilterSelectProps {
  /** The dimension being filtered ("Estado", "Tipo") - shown in the
   * trigger before the value, so the control reads as a sentence
   * rather than a bare word whose meaning depends on position. */
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * One filter dimension, as a labelled select.
 *
 * Replaces the row of tabs both list pages used. Six status tabs read as
 * scattered on a wide screen and needed horizontal scrolling on a phone;
 * one control is the same size at every breakpoint and leaves room for
 * more dimensions (currency, category) beside it later.
 *
 * Presentational on purpose: it takes value/onValueChange rather than
 * touching the URL, because its two callers drive different things - the
 * envelopes list writes a search param (server-filtered, so the URL has
 * to carry it) while the categories list sets client context (its full
 * list is already in memory).
 */
export function FilterSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(String(next))}>
      <SelectTrigger className={className} aria-label={label}>
        <SelectValue>
          {(current: string) => (
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-medium">
                {options.find((option) => option.value === current)?.label ??
                  current}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <div key={option.value}>
            {option.separatorBefore && <SelectSeparator />}
            <SelectItem value={option.value}>{option.label}</SelectItem>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
