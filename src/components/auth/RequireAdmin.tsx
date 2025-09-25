"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasAdminRole, loadAuth } from "@/lib/auth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const auth = loadAuth();
    if (!hasAdminRole(auth)) {
      router.replace("/login");
      return;
    }
    setOk(true);
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-muted-foreground">Verificando sesión…</div>
      </div>
    );
  }
  return <>{children}</>;
}