import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORIES } from "../lib/category-palette";
import { withAlpha } from "../lib/with-alpha";

// Read-only for now: categories are a fixed, predefined set (see
// category-palette.ts) - there's no Category entity/CRUD on the backend
// yet, so "create your own" is shown, explained, and disabled rather than
// silently absent.
export function CategoriesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>
          Categorías disponibles para tus sobres
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="divide-y divide-border/60">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: withAlpha(category.color, 0.14),
                  color: category.color,
                }}
              >
                <category.Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium">
                {category.label}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                Predeterminada
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            disabled
            title="Próximamente"
            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground opacity-60"
          >
            <Plus className="h-4 w-4" />
            Crear categoría propia
          </button>
          <p className="text-xs text-muted-foreground">
            Por ahora las categorías son fijas para que las estadísticas
            sean consistentes. Crear las tuyas llega más adelante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
