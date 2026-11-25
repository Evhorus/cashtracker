import { Category } from '@/categories/entities/category.entity';

export class CategoryResponseDto {
  id: string;
  label: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      label: category.label,
      color: category.color,
      icon: category.icon,
      isDefault: category.isDefault,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static fromEntities(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => this.fromEntity(category));
  }
}
