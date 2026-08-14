// src/components/seo/JsonLd.tsx — Inyección de structured data JSON-LD
// confidence: high
import Script from "next/script";

interface Props {
  data: object | object[];
}

export function JsonLd({ data }: Props) {
  const serialized = JSON.stringify(Array.isArray(data) ? data : [data]);
  return (
    <Script
      id="jsonld"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
