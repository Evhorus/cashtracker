import { z } from "zod";

export const CATEGORY_LABEL_MAX_LENGTH = 50;

/** Whitelisted Lucide icon keys; the first 15 keep their order as part of the API contract. */
export const ICON_KEYS = [
  "house",
  "car",
  "piggy-bank",
  "briefcase",
  "user",
  "paw-print",
  "plane",
  "ticket",
  "heart",
  "shopping-bag",
  "utensils",
  "graduation-cap",
  "gift",
  "zap",
  "tag",
  "building-2",
  "bed",
  "sofa",
  "lamp",
  "bath",
  "key",
  "hammer",
  "wrench",
  "paint-roller",
  "plug",
  "lightbulb",
  "droplets",
  "flame",
  "wifi",
  "tv",
  "washing-machine",
  "refrigerator",
  "trash-2",
  "bus",
  "train-front",
  "bike",
  "fuel",
  "circle-parking",
  "ship",
  "truck",
  "car-taxi-front",
  "coffee",
  "pizza",
  "beer",
  "wine",
  "apple",
  "carrot",
  "cake",
  "ice-cream-cone",
  "sandwich",
  "soup",
  "cookie",
  "shopping-cart",
  "shopping-basket",
  "store",
  "croissant",
  "beef",
  "fish",
  "egg",
  "stethoscope",
  "pill",
  "activity",
  "dumbbell",
  "syringe",
  "hospital",
  "baby",
  "smile",
  "glasses",
  "brain",
  "music",
  "film",
  "gamepad-2",
  "clapperboard",
  "popcorn",
  "tent",
  "camera",
  "palette",
  "book-open",
  "book",
  "headphones",
  "party-popper",
  "guitar",
  "drama",
  "trophy",
  "dice-5",
  "mountain",
  "umbrella",
  "sun",
  "tree-palm",
  "luggage",
  "map",
  "map-pin",
  "compass",
  "globe",
  "wallet",
  "credit-card",
  "banknote",
  "coins",
  "landmark",
  "receipt",
  "trending-up",
  "trending-down",
  "chart-line",
  "percent",
  "calculator",
  "hand-coins",
  "circle-dollar-sign",
  "bitcoin",
  "laptop",
  "monitor",
  "smartphone",
  "printer",
  "file-text",
  "mail",
  "phone",
  "handshake",
  "building",
  "scale",
  "shirt",
  "scissors",
  "sparkles",
  "gem",
  "watch",
  "backpack",
  "heart-handshake",
  "church",
  "users",
  "user-round",
  "dog",
  "cat",
  "bird",
  "bone",
  "rabbit",
  "turtle",
  "star",
  "flag",
  "bell",
  "calendar",
  "clock",
  "hourglass",
  "shield",
  "shield-check",
  "lock",
  "repeat",
  "siren",
  "recycle",
  "leaf",
  "flower-2",
  "tree-pine",
  "sprout",
  "cloud",
  "rocket",
  "package",
  "cigarette",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];
export const IconKeySchema = z.enum(ICON_KEYS);

/** Whitelisted `oklch()` swatches sharing accent lightness/chroma so only hue varies. */
export const PRESET_COLORS = [
  "oklch(0.72 0.14 153)", // hogar / primary
  "oklch(0.7 0.13 211)", // transporte
  "oklch(0.7 0.13 182)", // ahorros
  "oklch(0.7 0.13 240)", // trabajo
  "oklch(0.7 0.13 269)", // personal
  "oklch(0.7 0.13 327)", // mascotas
  "oklch(0.7 0.13 124)", // viajes
  "oklch(0.7 0.13 298)", // entretenimiento
  "oklch(0.7 0.13 95)", // salud
  "oklch(0.7 0.13 30)",
  "oklch(0.7 0.13 60)",
  "oklch(0.7 0.13 350)",
] as const;

export type PresetColor = (typeof PRESET_COLORS)[number];
export const PresetColorSchema = z.enum(PRESET_COLORS);

export const EnvelopeCategoryApiSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  icon: z.string(),
});
export type EnvelopeCategoryApi = z.infer<typeof EnvelopeCategoryApiSchema>;

export const CategoryApiSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoryApi = z.infer<typeof CategoryApiSchema>;

export const CategoriesApiSchema = z.array(CategoryApiSchema);
export type CategoriesResponseApi = z.infer<typeof CategoriesApiSchema>;

export const CategoryOptionsApiSchema = z.object({
  icons: z.array(z.string()),
  colors: z.array(z.string()),
});
export type CategoryOptionsApi = z.infer<typeof CategoryOptionsApiSchema>;

/** Envelope counts per category; zero-count categories are omitted by the API. */
export const CategoryUsageItemApiSchema = z.object({
  categoryId: z.string(),
  envelopeCount: z.number(),
});
export type CategoryUsageItemApi = z.infer<typeof CategoryUsageItemApiSchema>;

export const CategoryUsageApiSchema = z.array(CategoryUsageItemApiSchema);
export type CategoryUsageApi = z.infer<typeof CategoryUsageApiSchema>;
