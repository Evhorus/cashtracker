import { describe, it, expect } from 'vitest';

import { escapeLikePattern, normalizeString } from './string-utils';

describe('normalizeString', () => {
  it('trims and collapses repeated spaces', () => {
    expect(normalizeString('  Mercaldas   Store  ')).toBe('Mercaldas Store');
  });

  it('keeps the casing the user typed', () => {
    expect(normalizeString('MERCALDAS')).toBe('MERCALDAS');
    expect(normalizeString('Wee hoo')).toBe('Wee hoo');
  });

  it('keeps line breaks, trimming the spaces around them', () => {
    expect(normalizeString('Compra semanal:  \n  verduras\t y carnes\n')).toBe(
      'Compra semanal:\nverduras y carnes',
    );
  });

  it('passes non-strings through unchanged', () => {
    expect(normalizeString(undefined)).toBeUndefined();
    expect(normalizeString(42)).toBe(42);
  });
});

describe('escapeLikePattern', () => {
  it('escapes backslash, percent, and underscore characters', () => {
    expect(escapeLikePattern('100%_off\\deal')).toBe('100\\%\\_off\\\\deal');
  });

  it('leaves plain text untouched', () => {
    expect(escapeLikePattern('supermercado')).toBe('supermercado');
  });
});
