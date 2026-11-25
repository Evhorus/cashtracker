import {
  CATEGORY_LABEL_MAX_LENGTH,
  CategoriesApiSchema,
  CategoryOptionsApiSchema,
  CategoryUsageApiSchema,
  type CategoriesResponseApi,
  type CategoryApi,
  type CategoryOptionsApi,
  type CategoryUsageApi,
} from "@cashtracker/shared";
import { z } from "zod";

import type { ValidationTranslator } from "@/shared/lib/validation";

export {
  CategoriesApiSchema as CategoriesAPIResponseSchema,
  CategoryOptionsApiSchema as CategoryOptionsAPIResponseSchema,
  CategoryUsageApiSchema as CategoryUsageAPIResponseSchema,
  type CategoriesResponseApi,
  type CategoryApi,
  type CategoryOptionsApi,
  type CategoryUsageApi,
};

export const buildCategoryFormSchema = (t: ValidationTranslator) =>
  z.object({
    label: z
      .string()
      .min(1, { message: t("categoryNameRequired") })
      .refine((val) => val.trim().length > 0, t("notOnlySpaces"))
      .refine((val) => val.trim().length <= CATEGORY_LABEL_MAX_LENGTH, {
        message: t("categoryNameTooLong"),
      })
      .transform((val) => val.trim()),
    color: z.string().min(1, { message: t("colorRequired") }),
    icon: z.string().min(1, { message: t("iconRequired") }),
  });

export type CategoryFormValues = z.infer<
  ReturnType<typeof buildCategoryFormSchema>
>;
