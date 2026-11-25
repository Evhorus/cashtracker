import { Category } from '@/categories/entities/category.entity';

/** Embedded in envelope responses so clients can render category chips without a second lookup. */
export class EnvelopeCategoryDto {
  id: string;
  label: string;
  color: string;
  icon: string;

  static fromEntity(category?: Category | null): EnvelopeCategoryDto | null {
    if (!category) return null;

    return {
      id: category.id,
      label: category.label,
      color: category.color,
      icon: category.icon,
    };
  }
}
