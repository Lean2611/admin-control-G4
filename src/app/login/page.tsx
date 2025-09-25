

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiRequestHandler } from "@/lib/api";
import { BASE_URL } from "@/config/api";
import { saveAuth, decodeJwtRolesFromToken, hasAdminRole } from "@/lib/auth";

type LoginBody = {
  email: string; // cambia a "username" si tu DTO lo requiere
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convierte lo que venga en la respuesta o en el JWT a ["ADMIN","DRIVER",...]
  function normalizeRoles(data: any, tokenMaybeWithBearer: string): string[] {
    const out: string[] = [];

    const collect = (arr: any[]) => {
      for (const r of arr) {
        if (typeof r === "string") {
          out.push(r);
        } else if (r && typeof r === "object") {
          // Soporta estructuras comunes { id: "ADMIN", name: "Admin" } o { rol: "ADMIN" }
          if (typeof r.id === "string") out.push(r.id);
          else if (typeof r.name === "string") out.push(r.name);
          else if (typeof r.rol === "string") out.push(r.rol);
        }
      }
    };

    if (Array.isArray(data?.user?.roles)) {
      collect(data.user.roles);
    } else if (Array.isArray(data?.roles)) {
      collect(data.roles);
    }

    if (out.length === 0 && tokenMaybeWithBearer) {
      // Intenta leer roles desde el JWT si no vinieron en 'data'
      const raw = tokenMaybeWithBearer.startsWith("Bearer ")
        ? tokenMaybeWithBearer.slice(7)
        : tokenMaybeWithBearer;
      const parts = raw.split(".");
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          if (Array.isArray(payload?.roles)) collect(payload.roles);
        } catch {
          // ignore
        }
      }
    }

    // Normaliza a mayúsculas
    return out.map((x) => String(x).toUpperCase());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const body: LoginBody = { email, password }; // ajusta si tu DTO es distinto (username/password)

    try {
      const res = await ApiRequestHandler.post("/auth/login", body);

      const data = res.data || {};

      // Soporta distintos nombres de campo para el token
      // (accessToken | token | jwt | data.token)
      const tokenFromApi: string =
        data.accessToken || data.token || data.jwt || data?.data?.token || "";

      // Guarda el token sin el prefijo Bearer; el interceptor le pondrá "Bearer " si hace falta
      const tokenToStore = tokenFromApi.startsWith("Bearer ")
        ? tokenFromApi.slice(7)
        : tokenFromApi;

      const roles = normalizeRoles(data, tokenFromApi);

      const auth = { token: tokenToStore, roles, user: data.user };
      saveAuth(auth);

      if (!hasAdminRole(auth)) {
        setError("Tu usuario no tiene rol ADMIN.");
        return;
      }

      router.replace("/"); // dashboard
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Error de red";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm border rounded-lg p-6 bg-background">
        <h1 className="text-xl font-semibold mb-1">TransporteG4 — Admin</h1>
        <p className="text-xs text-muted-foreground mb-4">
          BASE_URL: <code>{BASE_URL}</code>
        </p>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="admin@tuapp.com"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="••••••••"
            />
          </label>

          <button
            disabled={busy}
            className="rounded px-4 py-2 border hover:bg-muted disabled:opacity-50"
          >
            {busy ? "Ingresando..." : "Ingresar"}
          </button>

          {error && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}