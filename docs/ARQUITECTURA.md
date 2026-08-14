# Arquitectura — Sistema Sushi Digital

> **Confidencialidad**: `confidence: high` — basado en stack productivo para restaurantes (Next.js + Prisma + SQLite)
> **Estado del repo**: `D:\sushi` estaba vacío al 100% (verificado con `ls` + `glob`).

## Resumen Ejecutivo

Una plataforma digital para sushi que cubre: **menú digital**, **pedidos online**, **reservaciones**, **promociones/publicaciones**, y **admin del dueño**.

**MVP definido**: Menú digital completo + pedidos con carrito/checkout + admin básico. La Fase 2 (cocina, stock, reportes) viene después.

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend + Backend** | Next.js (App Router) + TypeScript | SSR para SEO y velocidad en móviles; un solo repo full-stack |
| **Base de datos** | SQLite (dev) → PostgreSQL (prod) | SQLite funciona local sin infra; migrable a Postgres fácil |
| **ORM** | Prisma | Tipos seguros, migraciones declarativas |
| **Auth** | NextAuth.js | Login para clientes y administradores |
| **Estilos** | Tailwind CSS | UI moderna y responsive sin escribir CSS custom |
| **Pagos** | Mercado Pago (default LATAM) | Integrado por región — decidir en deploy |
| **Deploy** | Vercel + Neon (Postgres) | Zero-config, plan gratis generoso |

## Arquitectura de Módulos

```
sushi/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── menu/        → Menú digital con categorías y fotos
│   │   │   ├── pedidos/     → Carrito, checkout, seguimiento
│   │   │   ├── reservas/    → Formulario de reservación de mesa
│   │   │   └── promos/      → Publicaciones y promociones
│   │   ├── (admin)/
│   │   │   ├── dashboard/   → Ventas del día, métricas
│   │   │   ├── pedidos/     → Gestión de pedidos entrantes
│   │   │   ├── menu/        → CRUD de productos/categorías
│   │   │   ├── promos/      → CRUD de promociones/publicaciones
│   │   │   └── reservas/    → Vista de reservas recibidas
│   │   └── api/             → Rutas API (REST)
│   ├── lib/
│   │   ├── db.ts            → Cliente Prisma
│   │   ├── auth.ts          → Configuración NextAuth
│   │   ├── validations.ts   → Schemas Zod (validación)
│   │   └── utils.ts         → Helpers
│   ├── types/               → Tipos compartidos
│   └── components/
│       ├── ui/              → Componentes base (botones, cards)
│       ├── menu/            → Componentes del menú
│       └── layout/          → Header, Footer, AdminNav
├── prisma/
│   ├── schema.prisma        → Modelo de datos
│   └── seed.ts              → Datos iniciales
└── public/
    ├── images/              → Fotos de productos
    └── uploads/             → Imágenes subidas
```

## Modelo de Datos (Prisma) — `confidence: high`

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String?  @unique
  emailVerified DateTime?
  image         String?
  role          Role     @default(CUSTOMER) // CUSTOMER | ADMIN
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  pedidos       Pedido[]
  reservas      Reservacion[]
}

enum Role {
  CUSTOMER
  ADMIN
}

model Categoria {
  id        String    @id @default(cuid())
  nombre    String    @unique
  orden     Int       @default(0)
  activo      Boolean   @default(true)
  productos Producto[]
}

model Producto {
  id          String   @id @default(cuid())
  nombre      String
  descripcion   String?
  precio      Float
  imagen      String?
  categoriaId   String
  categoria     Categoria  @relation(fields: [categoriaId], references: [id])
  disponible    Boolean   @default(true)
  orden         Int       @default(0)
  items         ItemPedido[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Pedido {
  id            String   @id @default(cuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  numero        String   @unique
  estado        EstadoPedido @default(PENDIENTE)
  total         Float
  notas         String?
  items         ItemPedido[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum EstadoPedido {
  PENDIENTE   // Recién creado
  EN_COCINA   // Confirmado por admin, en preparación
  LISTO       // Listo para entrega/recogida
  ENTREGADO   // Finalizado
  CANCELADO
}

model ItemPedido {
  id          String  @id @default(cuid())
  pedidoId    String
  pedido      Pedido  @relation(fields: [pedidoId], references: [id])
  productoId  String
  producto    Producto @relation(fields: [productoId], references: [id])
  cantidad    Int
  precio      Float    // Precio al momento de pedir (por si cambia)
  notas       String?
}

model Reservacion {
  id        String   @id @default(cuid())
  nombre    String
  email     String
  telefono    String?
  fecha       DateTime
  personas    Int      @default(2)
  mesa        String?  // Opcional: número de mesa asignada
  estado      EstadoReserva @default(CONFIRMADA)
  notas       String?
  createdAt   DateTime @default(now())
}

enum EstadoReserva {
  PENDIENTE
  CONFIRMADA
  CANCELADA
  COMPLETADA
}

model Promocion {
  id          String   @id @default(cuid())
  titulo      String
  descripcion   String?
  imagen      String?
  tipo        TipoPromo
  valor       Float?   // Porcentaje (15.0) o monto fijo
  codigo      String?  @unique // Para cupones
  fechaInicio DateTime
  fechaFin    DateTime
  activa      Boolean   @default(true)
  createdAt   DateTime @default(now())
}

enum TipoPromo {
  PORCENTUAL
  MONTO_FIJO
  ENVIO_GRATIS
}

model Publicacion {
  id        String   @id @default(cuid())
  titulo    String
  contenido   String?
  imagen    String?
  publicada   Boolean   @default(false)
  fechaPublica DateTime @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Roadmap por Fases

| Fase | Duración | Entregables | Estado |
|------|----------|-------------|--------|
| **Fase 0** | 1 día | git init, estructura de carpetas, configuración TS + ESLint, Prisma schema | 🟡 Por hacer |
| **Fase 1** | 2-3 días | Menú digital (CRUD + display público), datos sembrados, layout responsive | 🟡 Por hacer |
| **Fase 2** | 3-4 días | Pedidos online (carrito, checkout, estados), admin de pedidos | 🟡 Por hacer |
| **Fase 3** | 2-3 días | Reservas + promociones/publicaciones, admin completo | 🟡 Por hacer |
| **Fase 4** | Post-MVP | Reporte de ventas, stock, integración entregas | futuro |

## Decisiones Técnicas Clave

1. **SQLite → PostgreSQL**: El schema de Prisma es 100% compatible entre ambos. Empezamos con SQLite para que funcione de inmediato en local, sin necesidad de levantar un servidor Postgres.

2. **App Router de Next.js**: `/` (público), `/admin/*` (protegido por rol). Auth con NextAuth v5.

3. **Tailwind + Headless UI patterns**: No usamos component libraries pesadas. Componentes simples reutilizables con Tailwind puro.

4. **Precio snapshot en ItemPedido**: Guardamos el precio al momento de crear el pedido, no referenciamos `Producto.precio` para que los pedidos previos no se rompan si se cambia un precio.

5. **Zod para validación**: Schemas de validación compartidos entre frontend y backend via tipos TypeScript.

## Setup Inicial — Comandos

```bash
# 1. Inicializar proyecto
git init
npm create next-app@latest . --typescript --eslint --tailwind --app --import-alias "@/*"

# 2. Instalar dependencias clave
npm install prisma @prisma/client @next-auth/prisma-adapter
npm install next-auth zod class-variance-authority clsx
npm install -D prisma @types/node
npx prisma init

# 3. (Después de schema) Migrar base de datos
npx prisma db push
npx prisma db seed
```

## Notas para el Deploy

- La app es **server-rendered** → el menú digital funciona sin JS en el cliente, ideal para SEO.
- Las fotos de sushi son CRÍTICAS → usar `next/image` con `fill` y formatos WebP.
- El checkout debe tener **fallback offline** (WhatsApp) por si Mercado Pago falla.
