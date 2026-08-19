// src/lib/seo.ts — Datos estructurados JSON-LD (Schema.org)
// confidence: high
//
// Centralized structured data builders for the Sushi Bar site.
// Basado en Schema.org: LocalBusiness, Restaurant, Product, BreadcrumbList, FAQPage.

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sushi-bar.ar";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    name: "Sushi Bar",
    image: `${BASE_URL}/images/products/01_sushi_variedad.jpg`,
    url: BASE_URL,
    telephone: "+54-11-XXXX-XXXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Corrientes 1234",
      addressLocality: "CABA",
      addressRegion: "Buenos Aires",
      postalCode: "C1043",
      addressCountry: "AR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -34.6037,
      longitude: -58.3816,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "12:00",
        closes: "23:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday"],
        opens: "12:00",
        closes: "00:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "13:00",
        closes: "22:00",
      },
    ],
    servesCuisine: ["Japanese", "Sushi", "Asian"],
    priceRange: "$$$",
    currenciesAccepted: "ARS",
    paymentAccepted: ["Cash", "Credit Card", "MercadoPago"],
    hasMenu: `${BASE_URL}/menu`,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function productSchema(producto: {
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  categoria: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcion || producto.nombre,
    image: producto.imagen || `${BASE_URL}/images/products/01_sushi_variedad.jpg`,
    brand: {
      "@type": "Brand",
      name: "Sushi Bar",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}${producto.url}`,
      priceCurrency: "USD",
      price: producto.precio.toString(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Sushi Bar",
      },
    },
    category: producto.categoria,
  };
}

export function faqSchemaReservas() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Con cuánta anticipación debo reservar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Recomendamos reservar con al menos 2 horas de anticipación. Para grupos de 6 o más personas, reservá con 24 horas de anticipación.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo cancelar o modificar mi reserva?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, podés cancelar o modificar tu reserva hasta 1 hora antes sin cargo. Pasado ese tiempo se aplica una tarifa del 50%.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen delivery a domicilio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, entregamos a domicilio en CABA y zona norte del Gran Buenos Aires. Consultá disponibilidad en el checkout escribiendo tu dirección.",
        },
      },
    ],
  };
}

export function faqSchemaPromos() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cómo uso el código de descuento?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ingresá el código en el carrito antes de confirmar tu pedido. El descuento se aplicará automáticamente al total.",
        },
      },
      {
        "@type": "Question",
        name: "¿Las promociones son acumulables?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Las promociones no son acumulables. Solo podés aplicar una oferta por pedido.",
        },
      },
    ],
  };
}

export { BASE_URL };
