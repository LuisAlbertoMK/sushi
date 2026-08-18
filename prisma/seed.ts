import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Categorías
  const cats = await Promise.all([
    prisma.categoria.upsert({ where: {nombre: "Sushi Rolls"}, create: {nombre: "Sushi Rolls", orden: 1}, update: {orden: 1} }),
    prisma.categoria.upsert({ where: {nombre: "Nigiri & Sashimi"}, create: {nombre: "Nigiri & Sashimi", orden: 2}, update: {orden: 2} }),
    prisma.categoria.upsert({ where: {nombre: "Especiales"}, create: {nombre: "Especiales", orden: 3}, update: {orden: 3} }),
    prisma.categoria.upsert({ where: {nombre: "Entradas"}, create: {nombre: "Entradas", orden: 4}, update: {orden: 4} }),
    prisma.categoria.upsert({ where: {nombre: "Bebidas"}, create: {nombre: "Bebidas", orden: 5}, update: {orden: 5} }),
    prisma.categoria.upsert({ where: {nombre: "Postres"}, create: {nombre: "Postres", orden: 6}, update: {orden: 6} }),
    prisma.categoria.upsert({ where: {nombre: "Combos"}, create: {nombre: "Combos", orden: 7}, update: {orden: 7} }),
  ])

  // Productos
  await Promise.all([
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "California Roll", categoriaId: cats[0].id}},
      create: {nombre: "California Roll", descripcion: "Arroz, cangrejo, aguacate y mayo", ingredientes: "Arroz de sushi, cangrejo, aguacate, mayonesa japonesa y semillas de sésamo", precio: 12.5, categoriaId: cats[0].id, orden: 1, imagen: "/images/products/03_rollos_especiales.jpg"},
      update: {imagen: "/images/products/03_rollos_especiales.jpg", ingredientes: "Arroz de sushi, cangrejo, aguacate, mayonesa japonesa y semillas de sésamo"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Spicy Tuna Roll", categoriaId: cats[0].id}},
      create: {nombre: "Spicy Tuna Roll", descripcion: "Atún picante, jengibre y wasabi", ingredientes: "Atún rojo, salsa picante, pepino, jengibre encurtido y wasabi", precio: 14.0, categoriaId: cats[0].id, orden: 2, imagen: "/images/products/01_sushi_variedad.jpg"},
      update: {imagen: "/images/products/01_sushi_variedad.jpg", ingredientes: "Atún rojo, salsa picante, pepino, jengibre encurtido y wasabi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Salmon Nigiri", categoriaId: cats[1].id}},
      create: {nombre: "Salmon Nigiri", descripcion: "2 piezas de salmon fresco", ingredientes: "Salmón fresco, arroz de sushi, vinagre de arroz y wasabi", precio: 8.0, categoriaId: cats[1].id, orden: 1, imagen: "/images/products/02_nigiri_salmon.jpg"},
      update: {imagen: "/images/products/02_nigiri_salmon.jpg", ingredientes: "Salmón fresco, arroz de sushi, vinagre de arroz y wasabi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Tuna Sashimi", categoriaId: cats[1].id}},
      create: {nombre: "Tuna Sashimi", descripcion: "5 piezas de atún fresco", ingredientes: "Atún rojo premium, soja, jengibre y wasabi", precio: 16.0, categoriaId: cats[1].id, orden: 2, imagen: "/images/products/04_sashimi.jpg"},
      update: {imagen: "/images/products/04_sashimi.jpg", ingredientes: "Atún rojo premium, soja, jengibre y wasabi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Dragon Roll Especial", categoriaId: cats[2].id}},
      create: {nombre: "Dragon Roll Especial", descripcion: "Langosta, cangrejo y mango", ingredientes: "Langosta, cangrejo, mango, aguacate, arroz y sésamo tostado", precio: 22.0, categoriaId: cats[2].id, orden: 1, imagen: "/images/products/05_temaki.jpg"},
      update: {imagen: "/images/products/05_temaki.jpg", ingredientes: "Langosta, cangrejo, mango, aguacate, arroz y sésamo tostado"}
    }),
    // Entradas
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Edamame al Vapor", categoriaId: cats[3].id}},
      create: {nombre: "Edamame al Vapor", descripcion: "Porotos de soja al vapor con sal marina", ingredientes: "Porotos de soja, sal marina y un toque de lima", precio: 6.5, categoriaId: cats[3].id, orden: 1, imagen: "/images/products/07_entradas.jpg"},
      update: {imagen: "/images/products/07_entradas.jpg", ingredientes: "Porotos de soja, sal marina y un toque de lima"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Gyoza de Cerdo", categoriaId: cats[3].id}},
      create: {nombre: "Gyoza de Cerdo", descripcion: "Empanaditas japonesas a la plancha, salsa ponzu", ingredientes: "Masa de gyoza, cerdo, repollo, ajo y salsa ponzu", precio: 8.5, categoriaId: cats[3].id, orden: 2, imagen: "/images/products/07_entradas.jpg"},
      update: {imagen: "/images/products/07_entradas.jpg", ingredientes: "Masa de gyoza, cerdo, repollo, ajo y salsa ponzu"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Wakame Salad", categoriaId: cats[3].id}},
      create: {nombre: "Wakame Salad", descripcion: "Ensalada de algas wakame con sésamo", ingredientes: "Algas wakame, sésamo tostado, aceite de sésamo y vinagre de arroz", precio: 7.0, categoriaId: cats[3].id, orden: 3, imagen: "/images/products/11_extras.jpg"},
      update: {imagen: "/images/products/11_extras.jpg", ingredientes: "Algas wakame, sésamo tostado, aceite de sésamo y vinagre de arroz"}
    }),
    // Bebidas
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Té Verde Matcha", categoriaId: cats[4].id}},
      create: {nombre: "Té Verde Matcha", descripcion: "Matcha premium japonés, caliente o frío", ingredientes: "Matcha premium japonés 100% orgánico y agua", precio: 4.5, categoriaId: cats[4].id, orden: 1, imagen: "/images/products/12_bebidas.jpg"},
      update: {imagen: "/images/products/12_bebidas.jpg", ingredientes: "Matcha premium japonés 100% orgánico y agua"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Sake Premium", categoriaId: cats[4].id}},
      create: {nombre: "Sake Premium", descripcion: "Sake junmai, 300ml, servido frío", ingredientes: "Arroz sake, agua pura y koji", precio: 12.0, categoriaId: cats[4].id, orden: 2, imagen: "/images/products/12_bebidas.jpg"},
      update: {imagen: "/images/products/12_bebidas.jpg", ingredientes: "Arroz sake, agua pura y koji"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Agua Japonesa", categoriaId: cats[4].id}},
      create: {nombre: "Agua Japonesa", descripcion: "Agua mineral importada 500ml", ingredientes: "Agua mineral natural 500ml", precio: 3.0, categoriaId: cats[4].id, orden: 3, imagen: "/images/products/12_bebidas.jpg"},
      update: {imagen: "/images/products/12_bebidas.jpg", ingredientes: "Agua mineral natural 500ml"}
    }),
    // Postres
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Mochi de Mango", categoriaId: cats[5].id}},
      create: {nombre: "Mochi de Mango", descripcion: "3 unidades de mochi helado de mango", ingredientes: "Masa de mochi, helado de mango y azúcar", precio: 6.0, categoriaId: cats[5].id, orden: 1, imagen: "/images/products/13_postres.jpg"},
      update: {imagen: "/images/products/13_postres.jpg", ingredientes: "Masa de mochi, helado de mango y azúcar"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Dorayaki", categoriaId: cats[5].id}},
      create: {nombre: "Dorayaki", descripcion: "Pancake japonés relleno de pasta de poroto rojo", ingredientes: "Harina, huevo, miel y pasta de poroto rojo dulce", precio: 5.5, categoriaId: cats[5].id, orden: 2, imagen: "/images/products/13_postres.jpg"},
      update: {imagen: "/images/products/13_postres.jpg", ingredientes: "Harina, huevo, miel y pasta de poroto rojo dulce"}
    }),
    // Combos
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Combo Familiar 40pcs", categoriaId: cats[6].id}},
      create: {nombre: "Combo Familiar 40pcs", descripcion: "Surtido de 40 piezas: rolls, nigiris y sashimi", ingredientes: "Surtido de 40 piezas: rolls, nigiris y sashimi con guarniciones", precio: 55.0, categoriaId: cats[6].id, orden: 1, imagen: "/images/products/14_combos.jpg"},
      update: {imagen: "/images/products/14_combos.jpg", ingredientes: "Surtido de 40 piezas: rolls, nigiris y sashimi con guarniciones"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Combo Duo 24pcs", categoriaId: cats[6].id}},
      create: {nombre: "Combo Duo 24pcs", descripcion: "24 piezas surtidas para compartir", ingredientes: "24 piezas surtidas: rolls, nigiris y sashimi", precio: 35.0, categoriaId: cats[6].id, orden: 2, imagen: "/images/products/14_combos.jpg"},
      update: {imagen: "/images/products/14_combos.jpg", ingredientes: "24 piezas surtidas: rolls, nigiris y sashimi"}
    }),
  ])

  // Usuario admin
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: {email: "admin@sushi.local"},
    create: {name: "Admin", email: "admin@sushi.local", role: Role.ADMIN, password: hashedPassword},
    update: {password: hashedPassword}
  })

  console.log(`Seed completado: ${cats.length} categorías, productos sembrados, 1 admin`)
}

main().catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
