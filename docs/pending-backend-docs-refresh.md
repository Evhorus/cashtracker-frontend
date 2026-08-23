# Pendiente: auditar y refrescar docs de `cashtracker-backend`

Contexto: en `cashtracker-frontend` se hizo una pasada de auditoría de `README.md` y `CLAUDE.md`
contra el código real (no contra lo que decían) y salieron varias cosas desalineadas: rutas que
ya no existían, un árbol de estructura literal que se pudre cada vez que se agrega una feature,
versiones de librerías desactualizadas en el texto, y hasta un bloque duplicado por copy/paste.
Vale la pena hacer la misma pasada en `cashtracker-backend` (repo hermano, mismo dueño, sin
tocar todavía) — este documento vive en el frontend solo para no perder el pendiente; una vez se
ejecute, el trabajo real y el commit van en `cashtracker-backend`, no aquí.

Prompt listo para pegar en una sesión nueva **dentro del repo `cashtracker-backend`**:

```
Necesito una auditoría y refresco de README.md y CLAUDE.md de este repo (cashtracker-backend),
igual que se acaba de hacer en el repo hermano cashtracker-frontend. No asumas que lo que dicen
hoy es correcto - verifica cada afirmación contra el código real antes de tocar nada:

1. Estructura del proyecto: si README.md o CLAUDE.md tienen un árbol de carpetas literal,
   revisa si sigue siendo fiel a `src/` (o donde viva el código) ahora mismo. Si el proyecto
   es domain-driven (por módulo/feature/recurso), preferir describir el patrón genérico que se
   replica por dominio en vez de mantener un árbol completo que se desactualiza con cada
   feature nueva - así no hay que volver a tocarlo cada vez.

2. Rutas/endpoints y nombres de recursos mencionados en la doc: confirmar contra los
   controllers/rutas reales que no haya nombres viejos dando vueltas (ej. un recurso que se
   renombró y la doc todavía usa el nombre anterior).

3. Versiones y stack técnico: comparar cada librería/versión mencionada en la doc (framework,
   ORM, validación, auth, etc.) contra lo que package.json realmente tiene instalado - no
   asumir que el número que hay escrito sigue vigente.

4. Bloques duplicados o contradictorios: buscar si hay secciones repetidas por error (copy/paste
   leftover) o instrucciones que se contradicen entre sí dentro del mismo archivo.

5. Patrones ya establecidos pero no documentados: si hay convenciones que el código ya sigue de
   forma consistente (manejo de errores, capa de servicios, DTOs, migraciones, auth, etc.) y no
   están escritas en CLAUDE.md, agregarlas - el objetivo es que CLAUDE.md sea una guía confiable
   para trabajar en este repo, no solo un README con otro nombre.

Al terminar: pnpm/npm run lint (o el equivalente de este repo) si aplica a algo que se haya
tocado, y seguir el flujo de git habitual del repo (rama -> validar -> merge -> preguntar antes
de push).
```
