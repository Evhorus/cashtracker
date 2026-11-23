/** Whitelisted `oklch()` swatches sharing the app's accent lightness/chroma so only hue varies. */
export const PRESET_COLORS = [
  'oklch(0.72 0.14 153)', // hogar / primary
  'oklch(0.7 0.13 211)', // transporte
  'oklch(0.7 0.13 182)', // ahorros
  'oklch(0.7 0.13 240)', // trabajo
  'oklch(0.7 0.13 269)', // personal
  'oklch(0.7 0.13 327)', // mascotas
  'oklch(0.7 0.13 124)', // viajes
  'oklch(0.7 0.13 298)', // entretenimiento
  'oklch(0.7 0.13 95)', // salud
  'oklch(0.7 0.13 30)',
  'oklch(0.7 0.13 60)',
  'oklch(0.7 0.13 350)',
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];
