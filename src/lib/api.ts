// "use client";

// import axios from "axios";
// import { API_MODE, API_URLS } from "@/config/api";

// export const BASE_URL =
//   API_MODE === "local" && typeof window !== "undefined"
//     ? `http://${window.location.hostname}:4000`
//     : API_URLS[API_MODE];

// export const ApiRequestHandler = axios.create({
//   baseURL: BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: false,
// });

// ApiRequestHandler.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const url = (config.url || "").toLowerCase();
//     const isPublic =
//       url.startsWith("/auth/login") ||
//       url.startsWith("/auth/register") ||
//       url.startsWith("/public/");
//     if (!isPublic) {
//       const raw = localStorage.getItem("auth");
//       if (raw) {
//         try {
//           const { token } = JSON.parse(raw) as { token?: string };
//           if (token) config.headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
//         } catch {}
//       }
//     }
//   }
//   return config;
// });
import axios from "axios";
import { BASE_URL } from "@/config/api";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.token ?? null;
  } catch {
    return null;
  }
}

export const ApiRequestHandler = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // timeout: 15000, // opcional
});

ApiRequestHandler.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  const token = raw ? (JSON.parse(raw)?.token || null) : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`; // intenta Bearer
  }
  return config;
});
ApiRequestHandler.interceptors.response.use(
  (r) => r,
  async (error) => {
    const cfg = error?.config;
    const status = error?.response?.status;
    if (status === 401 && cfg && !cfg.__retryNoBearer) {
      const raw = localStorage.getItem('auth');
      const token = raw ? (JSON.parse(raw)?.token || null) : null;
      if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers['Authorization'] = token; // reintenta pelón
        cfg.__retryNoBearer = true;
        return ApiRequestHandler.request(cfg);
      }
    }
    return Promise.reject(error);
  }
);

export default ApiRequestHandler;
