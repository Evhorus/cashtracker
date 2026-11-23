/** Trims each line and collapses horizontal whitespace while preserving casing and line breaks. */
export const normalizeString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;

  return value
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
};

/** Escapes SQL LIKE wildcards (`\`, `%`, `_`) for literal matching with `ESCAPE '\'`. */
export const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');
