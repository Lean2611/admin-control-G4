"use client";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket"; // si usas sockets

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        try { getSocket().disconnect(); } catch {}
        localStorage.removeItem("auth");
        router.replace("/login");
      }}
      className="px-3 py-2 rounded-lg border hover:bg-muted text-sm"
    >
      Cerrar sesión
    </button>
  );
}