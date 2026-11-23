import "server-only";

import { cache } from "react";

import { CategoriesService } from "@/features/categories/services/categories.service";

/** Request-scoped (React.cache) fetch of backend icon/color options (see get-categories.ts). */
export const getCategoryOptions = cache(() => CategoriesService.getOptions());
