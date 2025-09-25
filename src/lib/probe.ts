import { ApiRequestHandler } from "@/lib/api";

export async function probeBackend() {
  const out: any = { ok: true, checks: [] };

  async function check(name: string, fn: () => Promise<any>) {
    const item: any = { name };
    try {
      const res = await fn();
      const data = res?.data;
      item.status = res?.status ?? 200;
      item.sample = Array.isArray(data) ? { length: data.length } : data;
    } catch (e: any) {
      item.error = e?.response?.data ?? e?.message ?? String(e);
      item.status = e?.response?.status;
      out.ok = false;
    }
    out.checks.push(item);
  }

  await check("auth/me", () => ApiRequestHandler.get("/auth/me"));
  await check("roles",   () => ApiRequestHandler.get("/roles"));
  await check("users",   () => ApiRequestHandler.get("/users"));
  // si usas perfil unificado:
  await check("driver profile #1", () => ApiRequestHandler.get("/driver-car-info/1/profile"));

  return out;
}