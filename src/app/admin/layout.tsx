// src/app/admin/layout.tsx — Layout raíz del segmento admin (sin auth)
// confidence: high
// Los routes protegidos están en /admin/(auth)/layout.tsx
// /admin/login y /admin NO usan este layout con auth check

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}