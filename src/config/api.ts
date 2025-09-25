
// export type ApiMode = "prod" | "local";


// export const API_MODE: ApiMode = "local"; // "prod" | "local"

// export const API_URLS = {
//   prod: "https://g4backentdriver-production.up.railway.app",
//   local: "http://192.168.1.16:4000", // o "http://192.168.1.14:4000" si lo abrirás desde otro dispositivo
// } as const;

// // Si tu Nest usa prefijo global (p.ej. app.setGlobalPrefix('api')), ponlo aquí.
// // Si NO tienes prefijo, déjalo en "".
// export const API_PREFIX = ""; // o "/api" si tienes prefijo global

// export const BASE_URL =
//   API_URLS[API_MODE].replace(/\/+$/, "") + (API_PREFIX || "");
export const BASES = {
  prod:  "https://g4backentdriver-production.up.railway.app",
  local: "http://192.168.1.16:4000", // cambia si tu IP local es otra
} as const;

// Prioridad: query (?api=prod|local) > env (NEXT_PUBLIC_API_TARGET) > prod
function pickTarget(): keyof typeof BASES {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search).get("api");
    if (q === "prod" || q === "local") return q;
  }
  const env = (process.env.NEXT_PUBLIC_API_TARGET || "").toLowerCase();
  if (env === "local" || env === "prod") return env as any;
  return "prod";
}

const TARGET = pickTarget();

export const BASE_URL = BASES[TARGET];
export const SOCKET_URL = BASE_URL; // mismo host para sockets
export const USING_PROD = TARGET === "prod";