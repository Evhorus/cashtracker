import "server-only";

import { cache } from "react";

import { CategoriesService } from "@/features/categories/services/categories.service";

/**
 * Request-deduped (`React.cache`) server read returning serializable `Category[]` (icon keys, not live components)
 * so it can also seed `CategoriesProvider` across the Server -> Client boundary.
 */
export const getCategories = cache(() => CategoriesService.getAll());
