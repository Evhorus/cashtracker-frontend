import { CategoryFormValues, CategoryApi } from "../schemas/category.schema";
import { Category } from "../types";

export const CategoryMapper = {
  /**
   * UI -> API (Outbound)
   */
  toApiRequest: (data: CategoryFormValues) => ({
    label: data.label,
    color: data.color,
    icon: data.icon,
  }),

  /**
   * API -> UI (Inbound)
   * Transforms raw API response into the domain model (Category)
   */
  fromApi: (apiCategory: CategoryApi): Category => ({
    id: apiCategory.id,
    label: apiCategory.label,
    color: apiCategory.color,
    icon: apiCategory.icon,
    isDefault: apiCategory.isDefault,
    createdAt: new Date(apiCategory.createdAt),
  }),
};
