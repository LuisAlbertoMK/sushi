# Plan de Despliegue — Sushi Digital (Next.js + Prisma)

> Fecha: 2026-08-19 · Rama: `experiment/deploy-ready` · Estado: **FASE 0 COMPLETADA — FASES 1-3 PENDIENTES (bloqueadas por credenciales del usuario)**
> Actualización 2026-08-19: rama pusheada a origin, main actualizado en GitHub, PR #1 abierto (diff limpio +165/-8, 5 archivos). Fases 1-3 requieren: BD Postgres (Neon/Supabase), conexión del repo a Vercel, y env vars — acciones manuales del usuario.
> Objetivo: desplegar la app completa de cabo a rabo (build → BD → auth → seed → verificación → dominio).
> Fuente de datos: inspección real del repo (package.json, schema.prisma, next.config.ts, src/lib/auth.ts, prisma/seed.ts, API routes).

---

## 1. Stack real verificado (no asumido)

| Capa | Tecnología | Evidencia |
|---|---|---|
| Framework | Next.js 16.3.1 (App Router) + React 19.2.8 | `package.json` |
| BD | **Prisma 6 + SQLite** (`file:./dev.db`) | `prisma/schema.prisma:8` → `provider = "sqlite"` |
| Auth | **Cookies HMAC-SHA256 nativo** (crypto) + bcryptjs | `src/lib/auth.ts:16-57` (NO usa NextAuth en runtime; `auth.config.ts` es legacy sin uso) |
| Seed | 33 productos, 7 categorías, 1 admin (`admin@sushi.local` / `admin123`) | `prisma/seed.ts:192-197` |
| Imágenes | `next/image` con `remotePatterns: https **` | `next.config.ts` |
| Seguridad | CSP + X-Frame-Options DENY + Permissions-Policy | `next.config.ts` |
| API routes | admin, auth (login/logout), categorias, pedidos, productos, promos, reservas | `src/app/api/*` |
| Admin | `/admin/login` + panel protegido vía server component `getSession()` | `src/app/admin/(auth)/layout.tsx:17-20` |

**Variables de entorno actuales** (`.env`): `DATABASE_URL` (`file:./dev.db`), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.

---

## 2. Decisión crítica: SQLite NO es viable en producción

**Problema**: SQLite es un archivo local. En Vercel (serverless) el filesystem es efímero — cada instancia tiene su propio archivo y los writes se pierden. En Render, un disco persistente puede montarse, pero SQLite sigue sin soportar concurrencia multi-instancia ni backups sencillos.

**Opción A — Migrar a Postgres (RECOMENDADA)** — sin cambios de código, solo schema + env:
- Cambiar `provider = "sqlite"` → `"postgresql"` en `prisma/schema.prisma`
- `DATABASE_URL` apunta a Postgres (Neon/Supabase/PlanetScale-free tier, o el Postgres de Render)
- `prisma migrate deploy` + `prisma db seed` en el proveedor
- **Costo**: 1 cambio de línea + regenerar migración + re-seed. Todos los queries usan `@prisma/client` estándar → compatible.

**Opción B — Render + disco persistente con SQLite**:
- Funciona para demo, frágil en producción (concurrencia, sin backups). No recomendada.

**Opción C — Vercel + Turso/libSQL**: requiere driver adapter, más complejo. No vale la pena.

> **Recomendación: Opción A con Postgres.** Cambio mínimo, futuro sólido.

---

## 3. Target propuesto

| | Vercel (recomendado) | Render |
|---|---|---|
| Build | Auto-detecta Next.js (zero-config) | Web Service + Build command manual |
| BD | Postgres externo (Neon/Supabase free) | Postgres nativo de Render |
| Previews por PR | ✅ automático | Manual |
| Costo free tier | ✅ | ✅ (web service se duerme) |
| Dominio | `.vercel.app` + custom | `.onrender.com` + custom |
| **Veredicto** | **Elegido** — menor fricción con Next.js 16 | Alternativa válida |

---

## 4. Checklist de despliegue (orden ejecutable)

### Fase 0 — Preparación del repo (ya hecho en esta rama)
- [x] Rama `experiment/deploy-ready` creada (no toca `main`)
- [x] `package.json`: `"postinstall": "prisma generate"` — imprescindible para que el build del proveedor genere el client
- [x] Fix a11y CRITICAL 8: emoji-icons del admin con `aria-hidden` + texto accesible (`src/app/admin/(auth)/layout.tsx`)
- [x] Fix `console.error` condicional en `api/reservas` y `api/pedidos` (solo log en desarrollo)
- [ ] `.env.production` NO se commitea (`.gitignore` ya excluye `.env*`) — las variables van en el panel del proveedor

### Fase 1 — Migración a Postgres
1. Crear BD Postgres free (Neon: `console.neon.tech` o Supabase)
2. Copiar connection string → `DATABASE_URL`
3. `prisma/schema.prisma`: `provider = "postgresql"`
4. Local: `npx prisma migrate dev --name postgres-migration` (genera migración + client)
5. `npx prisma migrate deploy` contra la BD remota (crea tablas)
6. `npm run seed` contra la BD remota (33 productos + admin)
7. Verificar: `npx prisma studio` → tablas y datos OK

> ⚠️ La migración SQLite existente (`20260818233526_init`) NO es compatible con Postgres directamente — se regenera desde cero con los mismos modelos. Es seguro: solo datos de dev local se pierden (no hay producción aún).

### Fase 2 — Variables de entorno (panel del proveedor)
```
DATABASE_URL=postgresql://...   # de Neon/Supabase/Render
NEXTAUTH_URL=https://<tu-dominio>.vercel.app
NEXTAUTH_SECRET=<generar: openssl rand -base64 32>
```

### Fase 3 — Deploy
**Vercel:**
1. `git push -u origin experiment/deploy-ready`
2. `vercel` o importar repo en vercel.com → framework detectado: Next.js
3. Setear env vars (Fase 2) → Deploy
4. Tras el build: `npx vercel env pull` no aplica para serverless DB → **seed en prod**: con `vercel run` o script temporal

**Render:**
1. New → Web Service → conectar repo
2. Build: `npm install && prisma generate && prisma migrate deploy && npm run build`
3. Start: `npm start`
4. Env vars (Fase 2) → Deploy
5. Seed: `npm run seed` vía Render Shell (si la BD es el Postgres de Render, el seed corre contra ella)

### Fase 4 — Verificación post-deploy (checklist de humo)
- [ ] `GET /` → 200, HTML renderizado
- [ ] `/kaiten` → mesa 3D + cinta girando + 7 categorías visibles
- [ ] `/menu` → grid de 33 productos
- [ ] `/admin/login` → login con `admin@sushi.local` / `admin123` → redirect a `/admin/dashboard`
- [ ] Rutas protegidas sin sesión → redirect a login
- [ ] API: `GET /api/productos` → JSON con 33 ítems
- [ ] `/api/pedidos` POST → 201 (cookies HMAC funcionan en producción: `secure: true` ya condicionado por `NODE_ENV`)
- [ ] Headers de seguridad presentes (CSP, X-Frame-Options)
- [ ] Playwright E2E suite contra URL de producción (adaptar baseURL)
- [ ] HTTPS activo (Vercel/Render lo dan gratis)

### Fase 5 — Dominio (opcional, tras aprobación)
- Vercel: Settings → Domains → agregar custom domain (DNS: CNAME)
- Render: Settings → Custom Domain

### Fase 6 — Merge a main
- Tras verificación OK en la rama → PR `experiment/deploy-ready` → `main` → deploy definitivo

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| SQLite → Postgres rompe queries | Prisma escribe SQL portable; los modelos no usan features SQLite-only (verificado: solo tipos básicos String/Int/Float/DateTime) |
| Seed con `password` vs `auth.config` lee `image` | **No aplica**: auth real es `src/lib/auth.ts` que lee `password` (el seed usa `password` ✓). `auth.config.ts` es legacy sin importar |
| Cookie `secure: true` en prod | Ya condicionado por `NODE_ENV === "production"` (`src/lib/auth.ts:95`) — funciona en HTTPS |
| Imágenes `https **` en CSP | CSP `img-src 'self' https: data:` + remotePatterns `https **` ✓ |
| `NEXTAUTH_SECRET` default en dev | En prod se setea desde panel → no hay fallback inseguro |
| Playwright en CI | No está en build; queda como suite local/CI separada |
| Rate/limits free tier | Neon/Supabase free: 500MB-1GB suficientes para demo |

---

## 6. Qué NO se toca (alcance explícito)

- ❌ No se migra el auth a NextAuth v5 (el HMAC nativo funciona y está testeado)
- ❌ No se cambia la UI del kaiten (ya auditada y aprobada)
- ❌ No se commitean secretos ni `.env*`
- ❌ No se toca `main` hasta aprobación + merge

---

## 7. Decisión requerida del usuario

1. **Plataforma**: Vercel (recomendado) o Render
2. **BD Postgres**: Neon, Supabase, o el Postgres de Render — o si prefieres SQLite en Render con disco (opción B, solo demo)
3. **Dominio**: ¿usar el subdominio gratis o comprar custom domain?
4. **Merge**: ¿mergeamos `experiment/deploy-ready` → `main` al final?

---

*Plan generado con datos del repo (confidence: high — inspección directa de archivos). Pendiente de aprobación del usuario antes de ejecutar Fases 1-6.*