/** Appends an alpha channel to a bare `oklch(L C H)` string (assumes no existing alpha or trailing whitespace). */
export function withAlpha(oklchColor: string, alpha: number): string {
  return oklchColor.replace(/\)$/, ` / ${alpha})`);
}
