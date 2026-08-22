# Pendientes de la pasada de UI/UX (para retomar en una sesión nueva)

Contexto: se hizo una pasada grande de responsive/inputs/envelopes/gráficos/nav/hover states
en varios commits sobre `main` (ver `git log --oneline` desde `a95785d` hasta `73bcd62` para el
detalle completo — cada commit trae una descripción larga de qué y por qué). Lo que sigue es lo
que quedó señalado pero sin resolver.

## 1. Auditoría visual final

El pedido original terminaba en "una última revisión visual y funcional de toda la aplicación,
tanto en mobile como en desktop y en ambos modos de color, para detectar inconsistencias que hayan
quedado después de los cambios". Con tantos cambios encadenados (tokens de tema, navegación, cards
de sobres, filtros, etc.) vale la pena una pasada completa con Playwright por:
- Dashboard, `/dashboard/envelopes`, detalle de sobre, detalle de gasto.
- Mobile (~375px) y desktop (~1280px).
- Claro y oscuro (oscuro es el default ahora, `src/app/layout.tsx`).

Buscar específicamente: espacios/clases Tailwind inconsistentes, contraste, y que el hover/cursor
fix de `src/components/ui/button.tsx` y los tokens de `src/app/globals.css` no hayan dejado algún
rincón sin corregir.

## 2. Unificar los dos patrones de menú de acciones en mobile

Hoy conviven dos componentes distintos para "acciones de una card en mobile", cada uno en su
feature:
- `src/features/envelopes/components/envelope-actions-menu.tsx` — dropdown menu.
- `src/components/common/actions-drawer.tsx` (usado desde `expense-card.tsx`) — drawer (vaul).

Ambos resuelven lo mismo (editar/eliminar desde mobile) con dos UI patterns diferentes. Vale la
pena decidir uno solo y unificar, siguiendo el mismo espíritu con el que se extrajeron
`CardHoverActions`/`CardActionButton` (`src/components/common/card-hover-actions.tsx` y
`card-action-button.tsx`) para el hover de desktop.

## 3. Stats del dashboard no distinguen moneda

`src/components/common/stats-cards.tsx` sigue sumando `totalAssigned`/`totalSpent`/`totalAvailable`
sin campo de moneda propio — `DashboardSummary` (backend) no expone una moneda para el agregado. Si
en algún momento hay sobres en varias monedas simultáneamente, esos totales van a sumar peras con
manzanas. No es bloqueante hoy (el uso real es mayormente COP), pero si se vuelve un problema real,
requiere tocar el backend (agregar moneda al agregado, o desglosar por moneda) — no es solo un
cambio de frontend.
