# Contrato de backend: límite opcional en presupuestos (envelopes)

Cambio pequeño y aditivo sobre el contrato ya existente — no se agregan rutas nuevas, no se rompe nada de lo actual.

## Qué cambia

`amount` pasa de obligatorio a opcional/nullable en el modelo de `Budget` (el frontend lo renombra internamente a `Envelope`, pero la URL de la API sigue siendo `/budgets`, ver más abajo):

```
POST  /budgets            -> el body ya no exige `amount`; acepta su ausencia o null
PATCH /budgets/:id        -> igual, `amount` pasa a ser opcional/nullable
GET   /budgets            -> cada budget en la respuesta puede traer amount: string | null
GET   /budgets/:id        -> igual
```

## Reglas de negocio

- `amount` nulo/ausente = "sin límite" (contador corriente, sin barra de progreso ni tope de gasto).
- No se requiere ninguna validación server-side nueva de moneda: la moneda siempre vive en `Budget.currency` y cada gasto siempre pertenece a un budget, así que no hay superficie donde pueda colarse una moneda distinta.
- El resto del contrato de expenses (`/budgets/:budgetId/expenses...`) no cambia en absoluto.

## Por qué las URLs no cambian

El frontend renombra el concepto internamente de "Budget" a "Envelope" (carpeta, tipos, componentes, rutas de Next.js) porque conceptualmente ya no es solo un presupuesto con límite - puede ser un agrupador de gastos sin límite. Pero renombrar las rutas de la API por una preferencia de naming interno del frontend sería un cambio de backend innecesario. Las URLs siguen siendo `/budgets/...` tal cual están hoy; solo cambia cómo se llama la variable en el código del frontend.

## Estado

Pendiente de implementar en el backend. El frontend ya está listo para consumir `amount: string | null` en cuanto este cambio exista.
