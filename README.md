# 🍣 Sushi Digital

Plataforma digital para negocio de sushi: menú digital, pedidos online, reservaciones, promociones y panel de administración.

## ✨ Características

- **Menú digital** responsivo con fotos y categorías
- **Pedidos online** con carrito y checkout (Mercado Pago)
- **Reservas de mesa** en línea
- **Promociones & publicaciones** con fecha de vigencia
- **Panel de admin** para gestionar todo

## 🛠️ Tech Stack

| Next.js 15 (App Router) | TypeScript | Prisma | SQLite → PostgreSQL |
|---|---|---|---|
| Tailwind CSS | NextAuth v5 | React Hook Form + Zod | Mercado Pago |

Ver [arquitectura completa](docs/ARQUITECTURA.md).

## 🚀 Quick Start (Setup)

> **Requisito**: Node.js >= 18, npm

```bash
git clone <este-repo>
cd sushi

# Instalar dependencias
npm install

# Base de datos (SQLite local)
npx prisma db push
npx prisma db seed

# Desarrollo
npm run dev
# → http://localhost:3000
```

## 👤 Cuentas de Prueba

Seed crea usuarios automáticamente:

| Email | Password | Rol |
|-------|----------|-----|
| `admin@sushi.local` | `admin123` | Administrador |
| `cliente@sushi.local` | `cliente123` | Cliente |

(El seed usa bcrypt — revisar `prisma/seed.ts` para contraseñas reales).

## 📁 Estructura

```
src/app/(public)/   → Menú, pedidos, reservas, promos
src/app/(admin)/    → Dashboard, gestión completa
src/app/api/        → Endpoints REST
src/lib/            → Prisma, auth, validaciones, utils
src/components/     → UI reutilizable
prisma/schema.prisma → Modelo de datos
```

Ver [Arquitectura](docs/ARQUITECTURA.md) | [Fases](docs/ARQUITECTURA.md#roadmap-por-fases)

## 📄 Licencia

 propietario
