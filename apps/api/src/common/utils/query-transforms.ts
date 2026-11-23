/** Normalizes `?ids=a,b` and `?ids=a&ids=b` into trimmed string arrays. */
export function toStringList(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry: unknown) =>
        typeof entry === 'string' ? entry.split(',') : [entry],
      )
      .map((entry: unknown) =>
        typeof entry === 'string' ? entry.trim() : entry,
      )
      .filter((entry: unknown) => entry !== '');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return value;
}

/** Parses strict query booleans; invalid values pass through so `@IsBoolean()` returns 400. */
export function toBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
}
