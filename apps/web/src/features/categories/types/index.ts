export interface Category {
  id: string;
  label: string;
  /** oklch() color string - one of CategoryOptions.colors. */
  color: string;
  /** Icon key - one of CategoryOptions.icons, resolved to a LucideIcon
   * component via resolveIcon (lib/icon-registry.ts) for rendering. */
  icon: string;
  /** True for the ones every account starts with. Informational only:
   * each user has their own copy, so they edit and delete like any other. */
  isDefault: boolean;
  createdAt: Date;
}

/**
 * The icon/color whitelist the backend accepts (GET /categories/options,
 * fetched rather than hardcoded here - see category.schema.ts's
 * CategoryOptionsAPIResponseSchema for why).
 */
export interface CategoryOptions {
  icons: string[];
  colors: string[];
}
