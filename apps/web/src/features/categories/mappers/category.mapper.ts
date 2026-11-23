import type { CategoryApi } from "../schemas/category.schema";
import type { Category } from "../types";

export const CategoryMapper = {
  fromApi: (apiCategory: CategoryApi): Category => ({
    id: apiCategory.id,
    label: apiCategory.label,
    color: apiCategory.color,
    icon: apiCategory.icon,
    isDefault: apiCategory.isDefault,
    createdAt: new Date(apiCategory.createdAt),
  }),
};
