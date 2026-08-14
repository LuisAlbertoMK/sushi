// src/app/admin/login/layout.tsx — Layout simple para login
// confidence: high
// Anula admin/layout.tsx en App Router → login sin sidebar ni auth
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
