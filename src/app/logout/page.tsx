"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket"; // si usas sockets

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    try { getSocket().disconnect(); } catch {}
    localStorage.removeItem("auth");
    router.replace("/login");
  }, [router]);

  return <p className="p-4 text-sm">Cerrando sesión…</p>;
}