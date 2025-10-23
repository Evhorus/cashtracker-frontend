# CashTracker Frontend

Proyecto [Next.js](https://nextjs.org) creado con [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Requisitos Previos

- Node.js 18.x o superior
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
│   │   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   │   ├── sign-in/              # Página de inicio de sesión
│   │   │   └── sign-up/              # Página de registro
│   │   ├── (home)/                   # Grupo de rutas públicas
│   │   │   └── page.tsx              # Página de inicio
│   │   ├── dashboard/                # Panel principal
│   │   │   ├── budget/[budgetId]/    # Detalle de presupuesto
│   │   │   │   └── expenses/         # Gestión de gastos
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Layout principal
│   │   ├── globals.css               # Estilos globales
│   │   └── not-found.tsx             # Página 404
│   ├── auth/                         # Módulo de autenticación
│   │   ├── actions/                  # Server actions de auth
│   │   ├── components/               # Componentes de auth
│   │   └── schemas/                  # Validaciones de auth
│   ├── budgets/                      # Módulo de presupuestos
│   │   ├── actions/                  # Server actions
│   │   │   ├── budgets/              # CRUD de presupuestos
│   │   │   └── expenses/             # CRUD de gastos
│   │   ├── components/               # Componentes del módulo
│   │   │   ├── budgets/              # Componentes de presupuestos
│   │   │   └── expenses/             # Componentes de gastos
│   │   ├── hooks/                    # Custom hooks
│   │   ├── mappers/                  # Transformadores de datos
│   │   ├── schemas/                  # Validaciones con Zod
│   │   └── types/                    # Tipos de TypeScript
│   ├── shared/                       # Código compartido
│   │   ├── components/               # Componentes reutilizables
│   │   │   └── ui/                   # Componentes UI base (shadcn)
│   │   ├── fonts/                    # Configuración de fuentes
│   │   └── lib/                      # Utilidades generales
│   ├── constants/                    # Constantes de la aplicación
│   └── middleware.ts                 # Middleware de Next.js
├── public/                           # Archivos estáticos
│   └── *.svg                         # Iconos e imágenes
├── .env.template                     # Plantilla de variables de entorno
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Tecnologías

- **Framework:** Next.js 15.5.6
- **React:** 19.1.0
- **Autenticación:** Clerk
- **UI Components:** Radix UI
- **Estilos:** Tailwind CSS
- **Validación:** Zod
- **Forms:** React Hook Form
- **Gráficas:** Recharts

## Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Tutorial de Next.js](https://nextjs.org/learn)
- [Documentación de Clerk](https://clerk.com/docs)

## Deploy

La forma más fácil de desplegar tu aplicación Next.js es usando [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Consulta la [documentación de deployment de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.
