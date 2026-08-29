import { fetchApi } from "@/lib/api-client";
import {
  CategoryFormValues,
  CategoriesAPIResponseSchema,
  CategoriesResponseApi,
  CategoryOptionsAPIResponseSchema,
  CategoryOptionsApi,
} from "../schemas/category.schema";
import { Category, CategoryOptions } from "../types";
import { CategoryMapper } from "../mappers/category.mapper";

export const CategoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await fetchApi<CategoriesResponseApi>(
      "/categories",
      {
        next: { tags: ["all-categories"], revalidate: 60 },
      },
      CategoriesAPIResponseSchema,
    );

    return response.map(CategoryMapper.fromApi);
  },

  getOptions: async (): Promise<CategoryOptions> => {
    // Long revalidate - this whitelist only ever changes on a backend
    // deploy (a code change to ICON_KEYS/PRESET_COLORS there), never per
    // request/user, unlike the categories list above.
    return fetchApi<CategoryOptionsApi>(
      "/categories/options",
      {
        next: { tags: ["category-options"], revalidate: 3600 },
      },
      CategoryOptionsAPIResponseSchema,
    );
  },

  create: (data: CategoryFormValues) => {
    return fetchApi<{ message: string }>("/categories", {
      method: "POST",
      body: JSON.stringify(CategoryMapper.toApiRequest(data)),
    });
  },

  update: (id: string, data: CategoryFormValues) => {
    return fetchApi<{ message: string }>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(CategoryMapper.toApiRequest(data)),
    });
  },

  // Returns the removed entity, not a `{ message }` envelope - same as
  // the envelope delete, see EnvelopesService.delete for the details.
  delete: (id: string) => {
    return fetchApi<unknown>(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};
