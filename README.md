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

```
cashtracker-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Rutas de autenticación (Clerk)
│   │   │   ├── sign-in/              # Página de inicio de sesión
│   │   │   │   └── [[...sign-in]]
│   │   │   └── sign-up/              # Página de registro
│   │   │       └── [[...sign-up]]
│   │   ├── (home)/                   # Rutas públicas (Landing page)
│   │   │   └── page.tsx
│   │   ├── dashboard/                # Panel principal (Rutas protegidas)
│   │   │   ├── budgets/              # Listado de presupuestos
│   │   │   ├── budget/               # Rutas de detalle de presupuesto
│   │   │   │   └── [budgetId]/
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Layout principal
│   │   ├── globals.css               # Estilos globales
│   │   └── not-found.tsx             # Página 404
│   ├── features/                     # Lógica de negocio organizada por dominio
│   │   ├── budgets/                  # Módulo de presupuestos
│   │   │   ├── actions/              # Server Actions (CRUD)
│   │   │   ├── components/           # Componentes específicos
│   │   │   ├── lib/                  # Helpers y utilidades del dominio
│   │   │   ├── mappers/              # Transformadores de datos
│   │   │   ├── schemas/              # Validaciones con Zod
│   │   │   ├── services/             # Llamadas a API externa / servicios
│   │   │   └── types/                # Tipos TypeScript del dominio
│   │   └── expenses/                 # Módulo de gastos
│   │       ├── actions/              # Server Actions (CRUD)
│   │       ├── components/           # Componentes específicos
│   │       ├── schemas/              # Validaciones con Zod
│   │       ├── services/             # Llamadas a API externa / servicios
│   │       └── types/                # Tipos TypeScript del dominio
│   ├── shared/                       # Código compartido y utilidades
│   │   ├── components/               # Componentes reutilizables
│   │   │   └── ui/                   # Componentes base (shadcn/ui)
│   │   ├── constants/                # Constantes globales
│   │   ├── fonts/                    # Definición de fuentes compartidas
│   │   ├── hooks/                    # Custom hooks compartidos
│   │   ├── lib/                      # Utilidades generales (api, formatos, etc.)
│   │   ├── providers/                # Context Providers y ThemeProvider
│   │   └── types/                    # Tipos compartidos
│   └── proxy.ts                      # Proxy para autenticación y rutas
├── public/                           # Archivos estáticos (imágenes, fuentes, favicon)
├── .env.template                     # Plantilla de variables de entorno necesarias
├── .gitignore                        # Archivos y carpetas excluidos del control de versiones
├── CLAUDE.md                         # Guía de estilo y reglas para asistentes de IA
├── components.json                   # Configuración de componentes shadcn/ui
├── eslint.config.mjs                 # Configuración de reglas de linting (ESLint)
├── next.config.ts                    # Configuración avanzada de Next.js
├── package.json                      # Scripts, dependencias y metadatos del proyecto
├── pnpm-lock.yaml                    # Bloqueo de versiones exactas de dependencias
├── postcss.config.mjs                # Configuración de PostCSS para el procesamiento de CSS
├── skills-lock.json                  # Estado y sincronización de herramientas de IA
└── tsconfig.json                     # Configuración del compilador de TypeScript
```

## Tecnologías

- **Framework:** Next.js 16
- **React:** 19
- **Autenticación:** Clerk
- **UI Components:** Radix UI
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
