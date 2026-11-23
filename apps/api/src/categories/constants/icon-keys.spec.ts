import { ICON_KEYS } from './icon-keys';

describe('ICON_KEYS', () => {
  it('has no duplicates', () => {
    expect(new Set(ICON_KEYS).size).toBe(ICON_KEYS.length);
  });

  it('keeps the original 15 first, in order, since they are part of the API', () => {
    expect(ICON_KEYS.slice(0, 15)).toEqual([
      'house',
      'car',
      'piggy-bank',
      'briefcase',
      'user',
      'paw-print',
      'plane',
      'ticket',
      'heart',
      'shopping-bag',
      'utensils',
      'graduation-cap',
      'gift',
      'zap',
      'tag',
    ]);
  });
});
