// src/lib/admin-api.ts — helper for admin list mutations
// Returns a checked result instead of throwing, so callers can show
// inline errors and refresh only on success.

export type AdminMutateResult = { ok: true } | { ok: false; error: string };

export async function adminMutate(
  url: string,
  init: { method: string; body?: unknown }
): Promise<AdminMutateResult> {
  try {
    const res = await fetch(url, {
      method: init.method,
      headers: { "Content-Type": "application/json" },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
    if (res.ok) return { ok: true };
    const data: unknown = await res.json().catch(() => null);
    if (data !== null && typeof data === "object" && "error" in data) {
      const message = (data as { error: unknown }).error;
      if (typeof message === "string" && message.length > 0) {
        return { ok: false, error: message };
      }
    }
    return { ok: false, error: `Error ${res.status}` };
  } catch {
    return {
      ok: false,
      error: "No se pudo completar la operación. Revisá tu conexión e intentá de nuevo.",
    };
  }
}
