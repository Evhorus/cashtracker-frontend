# CashTracker Frontend

Proyecto [Next.js](https://nextjs.org) creado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requisitos Previos

- Node.js 20.x o superior
- npm, yarn, pnpm o bun

## Instalación

1. Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd cashtracker-frontend
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto (tomar como referencia el env.template)
   - Agrega las variables necesarias (Clerk API keys, etc.)

## Ejecutar el Proyecto

### Modo Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

La página se actualiza automáticamente al editar los archivos.

### Compilar para Producción

Genera una versión optimizada para producción:

```bash
npm run build
# o
yarn build
# o
pnpm build
# o
bun build
```

### Ejecutar en Producción

Después de compilar, inicia el servidor de producción:

```bash
npm start
# o
yarn start
# o
pnpm start
# o
bun start
```

## Estructura del Proyecto

La app sigue una arquitectura orientada a dominios (domain-driven). En vez de mantener aquí un
árbol literal de carpetas (que se desactualiza cada vez que se agrega una feature), esto es el
patrón que se replica por cada dominio de negocio — hoy `envelopes`, `expenses`, `dashboard`,
`auth`, y así con lo que se agregue después:

```
src/
├── app/                    # Next.js App Router: rutas, layouts, route groups
│   ├── (auth)/             # Rutas públicas de autenticación
│   ├── (home)/             # Landing page pública
│   └── dashboard/          # Rutas protegidas (auth.protect() a nivel de layout/page)
├── features/
│   └── <dominio>/          # Un módulo por dominio de negocio, mismo patrón siempre:
│       ├── actions/        # Server Actions (orquestación)
│       ├── components/     # Componentes propios del dominio
│       ├── schemas/        # Validación con Zod
│       ├── services/       # Llamadas a la API / lógica externa
│       │                   #   (features como `auth`, atadas a un provider con hooks
│       │                   #   de React en vez de funciones planas, usan hooks/ aquí)
│       ├── mappers/        # Transformación API <-> modelo de dominio
│       └── types/          # Tipos TypeScript del dominio
├── components/
│   ├── ui/                 # Primitivas base estilo shadcn (sobre Base UI)
│   └── common/             # Componentes compuestos reutilizables entre features
├── hooks/                  # Hooks compartidos
├── lib/                    # Utilidades generales (cliente API, fetch autenticado, formatos...)
├── providers/              # Context providers de la app (tema, etc.)
└── proxy.ts                # Middleware de Clerk (solo routing, la protección de sesión
                             # vive en cada layout/page, no aquí)
```

Detalle completo de convenciones (qué va en cada carpeta, patrones de forms, manejo de
errores, etc.) en [`CLAUDE.md`](./CLAUDE.md).

## Tecnologías

- **Framework:** Next.js 16
- **React:** 19
- **Autenticación:** Clerk
- **UI Components:** Base UI (vía shadcn/ui)
- **Estilos:** Tailwind CSS
- **Validación:** Zod
- **Forms:** React Hook Form
- **Gráficas:** Recharts
- **Internacionalización:** @clerk/localizations
- **Utilidades de fechas:** date-fns

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tutorial de Next.js](https://nextjs.org/learn)
- [Documentación de Clerk](https://clerk.com/docs)

## Deploy

La forma más fácil de desplegar tu aplicación Next.js es usando [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consulta la [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
