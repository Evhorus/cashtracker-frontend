# Pendiente: reverification personalizado + rediseño de sesiones/cuentas conectadas

Contexto: pasada sobre `src/features/account/` (sesiones y cuentas conectadas) a partir de
feedback en vivo probando la página `/dashboard/account`. Quedó investigado (documentación de
Clerk vía context7 ya consultada, ver detalle abajo) pero sin implementar - retomar desde acá.

## 1. El modal de reverification es de Clerk, no nuestro (el pedido principal)

Al hacer una acción sensible - cambiar contraseña, eliminar cuenta, o conectar un proveedor OAuth
nuevo (ej. Facebook) desde `ConnectedAccountsSection` - Clerk pide reverification y hoy muestra
**su propio modal**, no uno nuestro. Concretamente: al conectar Facebook, Clerk manda un correo con
un código de 6 dígitos y muestra su propio formulario para ingresarlo. Esto contradice el principio
del proyecto de nunca depender del UI prearmado del provider (mismo espíritu que
`src/features/auth/` - UI propia sobre los hooks de Clerk, nunca sus componentes).

Tres hooks llaman a `useReverification(fn)` **sin** la opción que permite reemplazar su UI:
- `src/features/account/hooks/use-update-password.ts`
- `src/features/account/hooks/use-delete-account.ts`
- `src/features/account/hooks/use-connected-accounts.ts` (el de `createExternalAccount`, el que
  dispara el caso de Facebook)

### Cómo resolverlo (ya investigado en docs de Clerk)

`useReverification(fn, { onNeedsReverification })` acepta un segundo argumento: pasar
`onNeedsReverification` **opta out del modal de Clerk por completo** y nos da control total. La
firma:

```ts
useReverification(fn, {
  onNeedsReverification: ({ complete, cancel, level, inProgress }) => {
    // abrir nuestro propio diálogo; guardar { complete, cancel, level }
  },
})
```

Dentro de nuestro diálogo, el flujo real (API de `session`, confirmado en la doc de Clerk):

1. `session.startVerification({ level })` → devuelve un `SessionVerificationResource` con
   `status: "needs_first_factor"` y `supportedFirstFactors` (la lista de factores disponibles para
   esta cuenta - puede incluir `password` y/o `email_code` según si el usuario tiene contraseña
   configurada; una cuenta que se registró solo con OAuth no tiene `password` como opción).
2. Elegir el factor a usar de `supportedFirstFactors` (preferir `password` si está disponible ya
   que es más rápido para el usuario; si no, `email_code`).
3. Si es `email_code`: `session.prepareFirstFactorVerification({ strategy: "email_code",
   emailAddressId })` dispara el envío del correo. Guardar `safeIdentifier` (el email enmascarado)
   para mostrarlo en el diálogo ("Enviamos un código a j***@ejemplo.com").
4. Al enviar el código: `session.attemptFirstFactorVerification({ strategy: "email_code", code })`.
   Si es `password`: `session.attemptFirstFactorVerification({ strategy: "password", password })`
   directo, sin `prepare` (password no es un "preparable factor").
5. Éxito → llamar `complete()` (esto hace que el `fn` original de `useReverification` se reintente
   solo). Cancelar → llamar `cancel()` (ya manejado en cada hook vía
   `isReverificationCancelledError`, no tocar esa parte).

### Arquitectura sugerida (no implementada aún)

Los 3 hooks están en componentes distintos (`PasswordSection`, `DeleteAccountSection`,
`ConnectedAccountsSection`) montados a la vez en `account-view.tsx` bajo un `Tabs` - por eso el
diálogo debería vivir en un contexto compartido, no duplicado 3 veces:

- Un `ReverificationProvider` (o hook + contexto) montado una vez en `account-view.tsx`, dueño del
  estado `{ complete, cancel, level, factor... } | null` y de renderizar el diálogo cuando hay
  estado.
- Un hook liviano `useReverificationGate()` que cada uno de los 3 hooks llama para obtener el
  `onNeedsReverification` a pasarle a su propio `useReverification()`.
- `ReverificationDialog` (componente nuevo): `Dialog` propio (no el modal de Clerk) con:
  - Campo de contraseña si el factor es `password` (reusar `FormInput` con `type="password"`).
  - Input OTP de 6 dígitos si el factor es `email_code` (ver punto 2 abajo), mostrando a qué correo
    se envió y con opción de "reenviar código".

## 2. Usar el componente OTP de shadcn para los códigos de 6 dígitos

Confirmado en la doc de Clerk: `EmailCodeAttempt.code` es un código de 6 dígitos. Hoy, en todo el
código donde se pide un código así, se usa un `FormInput` de texto plano
(`src/features/auth/components/forgot-password-form.tsx`, paso "Ingresa el código que recibiste").
shadcn tiene un componente dedicado para esto (`input-otp`, con `InputOTP`/`InputOTPGroup`/
`InputOTPSlot`) - no estaba agregado al proyecto todavía (`src/components/ui/` no tiene ningún
archivo `otp`). Falta:

- Agregarlo vía el MCP de shadcn (`get_add_command_for_items` con el item correspondiente del
  registro, revisar el nombre exacto - es probable que sea `@shadcn/input-otp`).
- Usarlo en el nuevo `ReverificationDialog` (punto 1) para el caso `email_code`.
- Reemplazar también el `FormInput` de texto plano de `forgot-password-form.tsx` por el mismo
  componente, ya que es exactamente el mismo tipo de dato (código de 6 dígitos por email) - así
  queda un solo patrón visual para "ingresa un código" en toda la app, no dos.

## 3. `SessionsSection` - el botón de cerrar sesión se ve perdido

`src/features/account/components/sessions-section.tsx`: el botón "Cerrar sesión" de un dispositivo
conectado (no el actual) hoy es un `variant="outline" size="sm"` suelto al final de la fila, sin
ninguna jerarquía visual que lo distinga como la acción "cerrar esta sesión" - se ve como un botón
genérico perdido en la tarjeta. Repensar su estilo/posición - candidatos: darle un tono más
"destructivo" sutil (como los botones de eliminar en otras partes de la app), o convertirlo en un
ícono con mejor affordance, manteniendo el label para no perder claridad.

## 4. `SessionsSection` - información cortada en mobile

Mismo archivo: `browser`/`device`/`location` usan `truncate` combinado con `flex-wrap` en la misma
línea (`className="flex flex-wrap items-center gap-2 truncate ..."`, que es contradictorio: uno
asume una sola línea, el otro permite varias), y en pantallas angostas la fila
`location · activo hace X` se corta con "...". El usuario planteó permitir scroll horizontal en
mobile para ver el detalle completo, pero dado que esta es información de seguridad (identificar
si una sesión es sospechosa), probablemente sea mejor evitar cualquier corte de texto en vez de
esconderlo detrás de un scroll poco descubrible - evaluar quitar `truncate` y dejar que el texto
haga wrap en varias líneas (mismo criterio ya aplicado en `envelope-card.tsx` esta sesión: nada de
truncamiento agresivo en información que el usuario necesita leer completa). Decidir la solución
final junto con el punto 3 ya que ambos tocan el mismo layout de fila.

## 5. Validación pendiente al retomar

- Lint + build.
- Playwright en vivo: flujo completo de "conectar con Facebook/Google" confirmando que ya no
  aparece ningún modal/UI de Clerk, y que el código de 6 dígitos con el nuevo componente OTP
  funciona (incluyendo error de código inválido y reenvío).
- Revisar visualmente `SessionsSection` en mobile real (~375px) tras el rediseño de los puntos 3-4.
- Seguir el flujo de git de siempre: rama → commit → merge --ff-only a main → preguntar antes de
  push → borrar rama.
