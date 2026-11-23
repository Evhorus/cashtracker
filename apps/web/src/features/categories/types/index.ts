export interface Category {
  id: string;
  label: string;
  /** oklch() color string - one of CategoryOptions.colors. */
  color: string;
  /** Icon key from CategoryOptions.icons, resolved via resolveIcon(). */
  icon: string;
  /** True for starter categories; users own their copy and can edit/delete them. */
  isDefault: boolean;
  createdAt: Date;
}

/** Backend icon/color whitelist from GET /categories/options (see category.schema.ts). */
export interface CategoryOptions {
  icons: string[];
  colors: string[];
}
