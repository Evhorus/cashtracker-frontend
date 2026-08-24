/**
 * Appends an alpha channel to one of category-palette.ts's `oklch(L C H)`
 * color strings, e.g. `withAlpha("oklch(0.7 0.13 211)", 0.16)` ->
 * `"oklch(0.7 0.13 211 / 0.16)"`. Relies on every CategoryDef.color being
 * exactly that shape (no existing alpha, no extra whitespace) - which
 * category-palette.ts's own entries are.
 */
export function withAlpha(oklchColor: string, alpha: number): string {
  return oklchColor.replace(/\)$/, ` / ${alpha})`);
}
