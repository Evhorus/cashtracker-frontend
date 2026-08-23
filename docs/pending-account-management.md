# Pendiente: gestión de cuenta propia (reemplazar `<UserButton>` de Clerk)

Contexto: hoy `src/components/common/custom-header.tsx` usa `<UserButton>`/`<SignInButton>`
de Clerk directamente (dropdown con avatar, "Manage account" que abre el modal propio de
Clerk, y sign out). La feature `src/features/auth/` ya sigue un patrón "provider-agnostic":
los hooks en `features/auth/hooks/` son los únicos que importan `@clerk/nextjs` client-side;
componentes y tipos solo consumen lo que el hook expone (`fieldErrors`, `globalErrors`,
funciones de acción), nunca objetos crudos de Clerk. La idea es aplicar exactamente el mismo
patrón aquí, para que un cambio futuro de proveedor de auth no se propague en cascada.

Prompt listo para pegar en una sesión nueva:

```
Necesito reemplazar el <UserButton> de Clerk (src/components/common/custom-header.tsx)
por un menú de usuario y una gestión de cuenta 100% construidos por nosotros —
mismo patrón "provider-agnostic" que ya usamos en src/features/auth/: los hooks
en features/<dominio>/hooks/ son los únicos que importan @clerk/nextjs, todo lo
demás (componentes, tipos) solo consume lo que el hook expone. Así, si el día
de mañana cambiamos de proveedor de auth, el cambio se hace en un solo lugar y
no se propaga en cascada por toda la app.

Hoy custom-header.tsx usa <UserButton> de Clerk directamente (dropdown con
avatar, "Manage account" que abre el modal propio de Clerk, y sign out). Quiero
sustituir eso por nuestro propio dropdown y nuestra propia UI de cuenta, pero
"consumiendo funciones" de Clerk por debajo (no reinventamos autenticación,
solo dejamos de depender de sus componentes visuales).

## Qué construir

1. **features/account/** (nueva feature, sigue la estructura de features/auth/:
   hooks/, components/, types/ — sin services/ porque las operaciones de Clerk
   son hooks de React, igual que en auth):
   - `hooks/use-account.ts` (o separarlo en use-update-profile.ts /
     use-update-password.ts / use-delete-account.ts si queda muy grande):
     usa `useUser()` de @clerk/nextjs para leer el usuario actual y:
     - `user.update({ firstName, lastName })` para editar nombre/apellido
     - `user.setProfileImage({ file })` para la foto de perfil
     - `user.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions })`
       envuelto en `useReverification()` (Clerk exige reverificación para
       acciones sensibles — ver https://clerk.com/docs/guides/secure/reverification)
     - `user.delete()`, también envuelto en `useReverification()`, para dar de
       baja la cuenta (con confirmación fuerte en la UI, es destructivo)
     - `useClerk().signOut()` para cerrar sesión
     Expón desde el hook la misma forma que ya usamos en auth: algo como
     `fieldErrors`, `globalErrors`, `isSubmitting`/`isUpdating`, y funciones de
     acción (`updateProfile()`, `updatePassword()`, `deleteAccount()`,
     `signOut()`) — nada de exponer objetos crudos de Clerk hacia los
     componentes.
   - `types/index.ts`: tipos provider-agnostic (igual que
     features/auth/types/index.ts) — nada de tipos de Clerk fugándose a los
     componentes.
   - `components/account-menu.tsx`: el dropdown que reemplaza a <UserButton>
     en custom-header.tsx. Usa el `DropdownMenu` que ya existe en
     src/components/ui/dropdown-menu.tsx. Trigger = avatar + nombre (o
     iniciales si no hay foto). Necesitamos un componente Avatar — no existe
     todavía en src/components/ui/, agrégalo con el MCP de shadcn
     (mcp__shadcn__get_add_command_for_items) antes de usarlo, no lo
     inventes a mano.
   - Página o modal de "Mi cuenta" con las secciones: datos de perfil
     (nombre, apellido, foto), cambiar contraseña (current/new/confirm,
     reutilizando el patrón de confirmPassword ya usado en
     features/auth/schemas/auth.schema.ts), y eliminar cuenta (con
     alert-dialog.tsx para confirmar). Decide tú si va como ruta propia
     (p.ej. /dashboard/account, consistente con que ya existe
     /dashboard/envelopes como ruta) o como Dialog — evalúa cuál encaja
     mejor con el resto de la app y decide, no hace falta preguntarme si es
     una decisión razonable de patrón; si es genuinamente ambigua, pregúntame.
   - Reutiliza `src/components/common/form-input.tsx` (FormInput) para los
     campos de estos formularios — ya trae Controller + aria-invalid + borde
     rojo en error + FieldError, es el estándar del proyecto ahora mismo,
     no lo dupliques.
   - Formularios con react-hook-form + zodResolver (Zod 4), igual que
     sign-in-form.tsx / sign-up-form.tsx / forgot-password-form.tsx.

2. Actualiza `src/components/common/custom-header.tsx` para usar
   `<AccountMenu />` en vez de `<UserButton>` / `<SignInButton>` de Clerk.
   El estado "no cargado" / "sin sesión" de ese header hoy es código muerto
   real (custom-header.tsx solo se renderiza dentro de dashboard/layout.tsx,
   que ya garantiza sesión vía auth.protect() antes) — de paso, si tiene
   sentido, simplifica esas ramas en vez de arrastrarlas.

## Cómo validar

- `pnpm run lint` y `pnpm run build` deben pasar limpios antes de dar nada
  por terminado.
- Probar en vivo con Playwright contra el servidor de dev ya corriendo en
  el puerto 3001 (no levantes otro `next start`, hay antecedentes de esto
  corrompiendo el build compartido) — abrir el dropdown, editar nombre,
  cambiar contraseña, ver que el borde rojo en error funciona igual que en
  el resto de forms.

## Flujo de git

Igual que siempre en este repo: crear rama → validar (lint+build) →
merge --ff-only a main → antes de hacer `git push`, preguntarme explícitamente
si quiero subirlo (siempre, no asumas que un "sí" anterior aplica a este
cambio) → luego borrar la rama.
```

## Fuera de alcance (a propósito, para no inflar el primer corte)

Confirmado contra la doc oficial de Clerk que también existen, pero se dejaron fuera de este
prompt porque no se pidieron explícitamente:

- **Cuentas conectadas (SSO)**: `user.externalAccounts`, `user.createExternalAccount(params)`
  (envuelto en `useReverification`), `account.destroy()` para desconectar.
- **Sesiones activas**: `user.getSessions()` devuelve `SessionWithActivities[]` (IP, ciudad,
  país, navegador, dispositivo, `lastActiveAt`) para un panel de "dispositivos conectados".

Si se quieren en el mismo corte, agregarlos al prompt de arriba antes de pegarlo.
