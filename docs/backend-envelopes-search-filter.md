# Contrato de backend: búsqueda en `GET /envelopes` — implementado

Este documento describía un cambio de backend pendiente. **Ya está implementado** (backend:
`GetEnvelopesFilterDto`, `findAllLight` y `findByUserIdLight` con `search` vía `createQueryBuilder`,
exactamente como se pidió abajo; frontend: `EnvelopesService.getAll`/`getEnvelopesAction` pasan
`search`, y `EnvelopesFilter` es el buscador en `/dashboard/envelopes`, con un empty-state propio
para "sin resultados" distinto del de "no tienes sobres aún"). Se deja como referencia histórica.

Motivo original: `/dashboard/envelopes` no tenía buscador ni orden — solo paginación — y con 27+
sobres ya era tedioso encontrar uno. No se podía resolver solo en frontend: filtrar la página ya
cargada (12 sobres) habría dado resultados incompletos, un sobre en otra página simplemente no
aparecía.

## Prompt para el refactor de backend

```
En cashtracker-backend, agrega soporte de búsqueda (y opcionalmente orden) al endpoint
GET /envelopes, siguiendo exactamente el mismo patrón ya usado en GET /envelopes/:envelopeId/expenses
(src/expenses/dto/get-expenses-filter.dto.ts y src/expenses/repositories/expenses.repository.ts).

1. Crear src/envelopes/dto/get-envelopes-filter.dto.ts:

   export class GetEnvelopesFilterDto extends PaginationQueryDto {
     @IsOptional()
     @IsString()
     search?: string;
   }

   (Igual a GetExpensesFilterDto pero sin startDate/endDate/sort - los sobres no tienen fecha
   propia. Si más adelante se quiere ordenar, agregar `sort?: 'ASC' | 'DESC'` sobre `name` o
   `createdAt` con @IsIn(['ASC', 'DESC']), mismo estilo.)

2. En envelopes.controller.ts, cambiar el @Get() findAll para usar GetEnvelopesFilterDto en vez
   de PaginationQueryDto y pasar `search` al service:

   @Get()
   findAll(
     @CurrentUser('id') userId: string,
     @Query() { page, limit, search }: GetEnvelopesFilterDto,
   ) {
     return this.envelopesService.findAllLight(userId, page, limit, search);
   }

3. En envelopes.service.ts, findAllLight debe aceptar el `search` opcional y pasarlo al repository:

   async findAllLight(userId: string, page: number, limit: number, search?: string) {
     const [envelopes, total] = await this.envelopesRepository.findByUserIdLight(
       userId, page, limit, search,
     );
     return new PaginatedResponseDto(EnvelopeResponseDto.fromEntities(envelopes), total, page, limit);
   }

4. En envelopes.repository.ts, findByUserIdLight usa hoy `repository.findAndCount` (TypeORM find
   options), que no soporta bien un OR de LIKE case-insensitive - hay que migrarlo a
   createQueryBuilder, igual que ExpensesRepository.findAll:

   async findByUserIdLight(userId: string, page: number, limit: number, search?: string) {
     const query = this.repository.createQueryBuilder('envelope')
       .where('envelope.userId = :userId', { userId })
       .select([
         'envelope.id', 'envelope.name', 'envelope.amount', 'envelope.currency',
         'envelope.spent', 'envelope.category', 'envelope.description',
         'envelope.createdAt', 'envelope.updatedAt',
       ]);

     if (search) {
       query.andWhere(
         '(LOWER(envelope.name) LIKE LOWER(:search) OR LOWER(envelope.category) LIKE LOWER(:search))',
         { search: `%${search}%` },
       );
     }

     query.orderBy('envelope.createdAt', 'DESC');
     query.skip((page - 1) * limit).take(limit);

     return query.getManyAndCount();
   }

5. Correr/actualizar envelopes.repository.spec.ts para el nuevo query builder (ya existe un spec
   para este repo, revisar que siga pasando y sumar un caso para `search`).

No cambia el contrato de respuesta (sigue siendo { data, meta }), solo agrega el query param
opcional `search` - así que no rompe a ningún consumidor existente que no lo mande.
```

## Cambios de frontend que van junto con esto (ya con este repo listo para consumirlo)

Una vez el backend acepte `?search=`, en `cashtracker-frontend`:

- `src/lib/pagination.ts`: `PaginationParams` necesita un `search?: string` opcional (o crear un
  tipo específico para envelopes si no se quiere tocar el genérico compartido con expenses).
- `src/features/envelopes/services/envelopes.service.ts`: `EnvelopesService.getAll` debe anexar
  `search` a la query string igual que hace con `page`/`limit`.
- `src/features/envelopes/actions/get-envelopes.action.ts`: pasar `search` a través desde
  `searchParams` de la página.
- Nuevo componente `src/features/envelopes/components/envelopes-filter.tsx`: mismo patrón que
  `src/features/expenses/components/expenses-filter.tsx` (input con `Search` icon, debounce de
  500ms, `router.replace` con `URLSearchParams`, resetea `page` al cambiar el filtro) pero sin el
  dropdown de orden a menos que el backend lo agregue también.
- `src/app/dashboard/envelopes/page.tsx`: leer `search` de `searchParams`, pasarlo a
  `getEnvelopesAction`, y renderizar `<EnvelopesFilter />` sobre `<EnvelopesGrid />`.
