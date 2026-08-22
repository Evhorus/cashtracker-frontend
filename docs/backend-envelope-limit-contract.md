# Contrato de backend: límite opcional en envelopes — implementado

Este documento describía un cambio pendiente de backend. **Ya está implementado** (repo `cashtracker-backend`, branch `feat/rename-budget-to-envelope`) y aplicado contra la base de datos real. Se deja como referencia histórica.

## Qué cambió (backend)

- `amount` pasó de obligatorio a opcional/nullable en el modelo (ahora `Envelope`, antes `Budget`).
- **A diferencia del plan original**: no solo se renombró internamente en el frontend — se renombró también en el backend (tabla, columnas, entidades, DTOs) y **las rutas cambiaron de `/budgets` a `/envelopes`**:

```
POST   /envelopes
GET    /envelopes
GET    /envelopes/:envelopeId
PATCH  /envelopes/:envelopeId
DELETE /envelopes/:envelopeId
POST   /envelopes/:envelopeId/expenses
GET    /envelopes/:envelopeId/expenses
GET    /envelopes/:envelopeId/expenses/:expenseId
PATCH  /envelopes/:envelopeId/expenses/:expenseId
DELETE /envelopes/:envelopeId/expenses/:expenseId
```

- `amount: string | null` — nulo/ausente = "sin límite" (contador corriente, sin barra de progreso ni tope de gasto).
- Bug encontrado y corregido de paso: `currency` nunca se serializaba en las respuestas de `Budget`/`Expense` (se guardaba y validaba en el DTO de entrada, pero no salía en el JSON de respuesta). El frontend solo "funcionaba" por el `.default("COP")` de su schema Zod, que era silenciosamente incorrecto para cualquier envelope en otra moneda.

## Qué cambió (frontend, este repo)

Todas las llamadas `fetchApi`/`authenticatedFetch` en `src/features/envelopes` y `src/features/expenses` (services + actions) se actualizaron de `/budgets/...` a `/envelopes/...` para que coincidan con las rutas reales del backend.

## Migración de datos

Ejecutada contra la base de datos real (Neon), con backup previo (`cashtracker-backend/scripts/backup-db.js`, ya que `pg_dump` no estaba disponible en el entorno):

1. `MakeBudgetAmountNullable` — `ALTER TABLE "budget" ALTER COLUMN "amount" DROP NOT NULL`.
2. `RenameBudgetToEnvelope` — `ALTER TABLE "budget" RENAME TO "envelope"`, `ALTER TABLE "expense" RENAME COLUMN "budgetId" TO "envelopeId"`.

Verificado post-migración: mismo conteo de filas y mismos valores (30 envelopes, 333 expenses) comparando un backup antes/después.
