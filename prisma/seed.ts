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
      where: {nombre_categoriaId: {nombre: "Rainbow Roll", categoriaId: cats[0].id}},
      create: {nombre: "Rainbow Roll", descripcion: "Salmón, atún y aguacate sobre roll de cangrejo", ingredientes: "Roll de cangrejo cubierto con salmón, atún, aguacate y pepino", precio: 15.5, categoriaId: cats[0].id, orden: 3, imagen: "/images/products/08_rollos_menu.jpg"},
      update: {imagen: "/images/products/08_rollos_menu.jpg", ingredientes: "Roll de cangrejo cubierto con salmón, atún, aguacate y pepino"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Philadelphia Roll", categoriaId: cats[0].id}},
      create: {nombre: "Philadelphia Roll", descripcion: "Salmón ahumado, queso crema y pepino", ingredientes: "Salmón ahumado, queso crema, pepino y arroz de sushi", precio: 13.0, categoriaId: cats[0].id, orden: 4, imagen: "/images/products/08_rollos_menu.jpg"},
      update: {imagen: "/images/products/08_rollos_menu.jpg", ingredientes: "Salmón ahumado, queso crema, pepino y arroz de sushi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Tempura Roll", categoriaId: cats[0].id}},
      create: {nombre: "Tempura Roll", descripcion: "Camarón tempura, aguacate y salsa unagi", ingredientes: "Camarón tempura, aguacate, pepino, arroz y salsa unagi", precio: 14.5, categoriaId: cats[0].id, orden: 5, imagen: "/images/products/08_rollos_menu.jpg"},
      update: {imagen: "/images/products/08_rollos_menu.jpg", ingredientes: "Camarón tempura, aguacate, pepino, arroz y salsa unagi"}
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
      where: {nombre_categoriaId: {nombre: "Ebi Nigiri", categoriaId: cats[1].id}},
      create: {nombre: "Ebi Nigiri", descripcion: "2 piezas de camarón dulce", ingredientes: "Camarón dulce cocido, arroz de sushi y wasabi", precio: 9.0, categoriaId: cats[1].id, orden: 3, imagen: "/images/products/09_nigiri_sashimi_menu.jpg"},
      update: {imagen: "/images/products/09_nigiri_sashimi_menu.jpg", ingredientes: "Camarón dulce cocido, arroz de sushi y wasabi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Unagi Nigiri", categoriaId: cats[1].id}},
      create: {nombre: "Unagi Nigiri", descripcion: "2 piezas de anguila glaseada", ingredientes: "Anguila asada, glaseado teriyaki, arroz de sushi y sésamo", precio: 11.0, categoriaId: cats[1].id, orden: 4, imagen: "/images/products/09_nigiri_sashimi_menu.jpg"},
      update: {imagen: "/images/products/09_nigiri_sashimi_menu.jpg", ingredientes: "Anguila asada, glaseado teriyaki, arroz de sushi y sésamo"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Hamachi Sashimi", categoriaId: cats[1].id}},
      create: {nombre: "Hamachi Sashimi", descripcion: "5 piezas de yellowtail fresco", ingredientes: "Yellowtail premium, soja y wasabi", precio: 18.0, categoriaId: cats[1].id, orden: 5, imagen: "/images/products/04_sashimi.jpg"},
      update: {imagen: "/images/products/04_sashimi.jpg", ingredientes: "Yellowtail premium, soja y wasabi"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Dragon Roll Especial", categoriaId: cats[2].id}},
      create: {nombre: "Dragon Roll Especial", descripcion: "Langosta, cangrejo y mango", ingredientes: "Langosta, cangrejo, mango, aguacate, arroz y sésamo tostado", precio: 22.0, categoriaId: cats[2].id, orden: 1, imagen: "/images/products/05_temaki.jpg"},
      update: {imagen: "/images/products/05_temaki.jpg", ingredientes: "Langosta, cangrejo, mango, aguacate, arroz y sésamo tostado"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Volcano Roll", categoriaId: cats[2].id}},
      create: {nombre: "Volcano Roll", descripcion: "Roll horneado con cangrejo y salsa picante", ingredientes: "Cangrejo, salsa picante horneada, queso crema y arroz", precio: 18.5, categoriaId: cats[2].id, orden: 2, imagen: "/images/products/10_temakis_menu.jpg"},
      update: {imagen: "/images/products/10_temakis_menu.jpg", ingredientes: "Cangrejo, salsa picante horneada, queso crema y arroz"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Spider Roll", categoriaId: cats[2].id}},
      create: {nombre: "Spider Roll", descripcion: "Cangrejo blando frito, aguacate y pepino", ingredientes: "Cangrejo blando tempura, aguacate, pepino y arroz", precio: 17.5, categoriaId: cats[2].id, orden: 3, imagen: "/images/products/10_temakis_menu.jpg"},
      update: {imagen: "/images/products/10_temakis_menu.jpg", ingredientes: "Cangrejo blando tempura, aguacate, pepino y arroz"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Rainbow Especial", categoriaId: cats[2].id}},
      create: {nombre: "Rainbow Especial", descripcion: "Surtido premium con salmón, atún y anguila", ingredientes: "Salmón, atún, anguila, cangrejo, aguacate y arroz", precio: 21.0, categoriaId: cats[2].id, orden: 4, imagen: "/images/products/06_menu_portada.jpg"},
      update: {imagen: "/images/products/06_menu_portada.jpg", ingredientes: "Salmón, atún, anguila, cangrejo, aguacate y arroz"}
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
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Miso Soup", categoriaId: cats[3].id}},
      create: {nombre: "Miso Soup", descripcion: "Sopa de miso con tofu y cebollín", ingredientes: "Pasta de miso, tofu, cebollín y alga wakame", precio: 5.0, categoriaId: cats[3].id, orden: 4, imagen: "/images/products/11_extras.jpg"},
      update: {imagen: "/images/products/11_extras.jpg", ingredientes: "Pasta de miso, tofu, cebollín y alga wakame"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Tempura Mixta", categoriaId: cats[3].id}},
      create: {nombre: "Tempura Mixta", descripcion: "Camarones y vegetales en tempura crujiente", ingredientes: "Camarón, calabacín, batata, pimiento y tempura", precio: 12.0, categoriaId: cats[3].id, orden: 5, imagen: "/images/products/07_entradas.jpg"},
      update: {imagen: "/images/products/07_entradas.jpg", ingredientes: "Camarón, calabacín, batata, pimiento y tempura"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Chicken Katsu", categoriaId: cats[3].id}},
      create: {nombre: "Chicken Katsu", descripcion: "Pechuga de pollo empanizada estilo katsu", ingredientes: "Pechuga de pollo, panko, repollo y salsa katsu", precio: 11.5, categoriaId: cats[3].id, orden: 6, imagen: "/images/products/07_entradas.jpg"},
      update: {imagen: "/images/products/07_entradas.jpg", ingredientes: "Pechuga de pollo, panko, repollo y salsa katsu"}
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
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Ramune", categoriaId: cats[4].id}},
      create: {nombre: "Ramune", descripcion: "Refresco japonés de lima-limón", ingredientes: "Agua carbonatada, lima-limón y azúcar", precio: 4.0, categoriaId: cats[4].id, orden: 4, imagen: "/images/products/12_bebidas.jpg"},
      update: {imagen: "/images/products/12_bebidas.jpg", ingredientes: "Agua carbonatada, lima-limón y azúcar"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Umeshu", categoriaId: cats[4].id}},
      create: {nombre: "Umeshu", descripcion: "Licor de ciruela japonesa, 200ml", ingredientes: "Ciruela ume macerada en licor y azúcar", precio: 11.0, categoriaId: cats[4].id, orden: 5, imagen: "/images/products/12_bebidas.jpg"},
      update: {imagen: "/images/products/12_bebidas.jpg", ingredientes: "Ciruela ume macerada en licor y azúcar"}
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
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Taiyaki", categoriaId: cats[5].id}},
      create: {nombre: "Taiyaki", descripcion: "Pancake en forma de pez, relleno de crema", ingredientes: "Harina, huevo, crema pastelera y vainilla", precio: 6.5, categoriaId: cats[5].id, orden: 3, imagen: "/images/products/13_postres.jpg"},
      update: {imagen: "/images/products/13_postres.jpg", ingredientes: "Harina, huevo, crema pastelera y vainilla"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Kakigori", categoriaId: cats[5].id}},
      create: {nombre: "Kakigori", descripcion: "Hielo raspado con sirope de fresa", ingredientes: "Hielo raspado, sirope de fresa y leche condensada", precio: 7.5, categoriaId: cats[5].id, orden: 4, imagen: "/images/products/13_postres.jpg"},
      update: {imagen: "/images/products/13_postres.jpg", ingredientes: "Hielo raspado, sirope de fresa y leche condensada"}
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
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Combo Ejecutivo 18pcs", categoriaId: cats[6].id}},
      create: {nombre: "Combo Ejecutivo 18pcs", descripcion: "18 piezas para una persona: rolls, nigiri y tempura", ingredientes: "18 piezas: rolls, nigiri y un roll de tempura", precio: 28.0, categoriaId: cats[6].id, orden: 3, imagen: "/images/products/15_delivery.jpg"},
      update: {imagen: "/images/products/15_delivery.jpg", ingredientes: "18 piezas: rolls, nigiri y un roll de tempura"}
    }),
    prisma.producto.upsert({
      where: {nombre_categoriaId: {nombre: "Combo Veggie 16pcs", categoriaId: cats[6].id}},
      create: {nombre: "Combo Veggie 16pcs", descripcion: "16 piezas vegetarianas: aguacate, pepino y wakame", ingredientes: "16 piezas: rolls de aguacate, pepino, wakame y queso crema", precio: 24.0, categoriaId: cats[6].id, orden: 4, imagen: "/images/products/14_combos.jpg"},
      update: {imagen: "/images/products/14_combos.jpg", ingredientes: "16 piezas: rolls de aguacate, pepino, wakame y queso crema"}
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
