// src/components/seo/JsonLd.tsx — Inyección de structured data JSON-LD
// confidence: high
// Uso el <script type="application/ld+json"> directo (recomendación oficial Next.js)
// en lugar de next/script: los scripts dentro de componentes React no se ejecutan
// en cliente y next/script con strategy no aplica a JSON-LD.

interface Props {
  data: object | object[];
}

export function JsonLd({ data }: Props) {
  const serialized = JSON.stringify(Array.isArray(data) ? data : [data]);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
