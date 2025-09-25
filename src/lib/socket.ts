import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/api";

let socket: Socket | null = null;

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

export function getSocket(): Socket {
  if (socket) return socket;

  const token = typeof window !== "undefined" ? getToken() : null;

  socket = io(SOCKET_URL, {
    transports: ["websocket"], // estable en prod
    withCredentials: false,
    extraHeaders: token ? { Authorization: token } : undefined,
    // Si tu gateway lee el token por query en lugar de headers, usa:
    // query: token ? { token } : undefined,
  });

  // Logs útiles
  socket.on("connect", () => console.log("[socket] conectado:", socket?.id));
  socket.on("connect_error", (e) =>
    console.warn("[socket] connect_error:", e?.message || e)
  );

  return socket;
}