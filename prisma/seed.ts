import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Categorías
  const cats = await Promise.all([
    prisma.categoria.upsert({ where: {nombre: "Sushi Rolls"}, create: {nombre: "Sushi Rolls", orden: 1}, update: {orden: 1} }),
    prisma.categoria.upsert({ where: {nombre: "Nigiri & Sashimi"}, create: {nombre: "Nigiri & Sashimi", orden: 2}, update: {orden: 2} }),
    prisma.categoria.upsert({ where: {nombre: "Especiales"}, create: {nombre: "Especiales", orden: 3}, update: {orden: 3} }),
  ])

  // Productos
  await Promise.all([
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "California Roll", categoriaId: cats[0].id}},
      create: {nombre: "California Roll", descripcion: "Arroz, cangrejo, aguacate y mayo", precio: 12.5, categoriaId: cats[0].id, orden: 1, imagen: "https://placehold.co/400x300/ffe5d9/8b4513?font=montserrat&text=California+Roll"},
      update: {}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Spicy Tuna Roll", categoriaId: cats[0].id}},
      create: {nombre: "Spicy Tuna Roll", descripcion: "Atún picante, jengibre y wasabi", precio: 14.0, categoriaId: cats[0].id, orden: 2, imagen: "https://placehold.co/400x300/ffe5d9/8b4513?font=montserrat&text=Spicy+Tuna+Roll"},
      update: {}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Salmon Nigiri", categoriaId: cats[1].id}},
      create: {nombre: "Salmon Nigiri", descripcion: "2 piezas de salmon fresco", precio: 8.0, categoriaId: cats[1].id, orden: 1, imagen: "https://placehold.co/400x300/ffe5d9/8b4513?font=montserrat&text=Salmon+Nigiri"},
      update: {}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Tuna Sashimi", categoriaId: cats[1].id}},
      create: {nombre: "Tuna Sashimi", descripcion: "5 piezas de atún fresco", precio: 16.0, categoriaId: cats[1].id, orden: 2, imagen: "https://placehold.co/400x300/ffe5d9/8b4513?font=montserrat&text=Tuna+Sashimi"},
      update: {}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Dragon Roll Especial", categoriaId: cats[2].id}},
      create: {nombre: "Dragon Roll Especial", descripcion: "Langosta, cangrejo y mango", precio: 22.0, categoriaId: cats[2].id, orden: 1, imagen: "https://placehold.co/400x300/ffe5d9/8b4513?font=montserrat&text=Dragon+Roll"},
      update: {}
    }),
  ])

  // Usuario admin
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: {email: "admin@sushi.local"},
    create: {name: "Admin", email: "admin@sushi.local", role: Role.ADMIN, password: hashedPassword},
    update: {password: hashedPassword}
  })

  console.log("Seed completado: 3 categorías, 5 productos, 1 admin")
}

main().catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
