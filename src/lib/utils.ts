import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes just the first character, leaving the rest untouched -
 * not per-word title case, which would wrongly capitalize Spanish
 * articles/prepositions ("del", "y", "la"...) in a name like "Mercado y
 * despensa del mes". The backend now stores envelope/expense names
 * lowercase on save (its own matching/grouping needs the normalized
 * form) - this is purely the presentation form for a person, applied
 * once in each API->domain mapper rather than at every render site.
 */
export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
