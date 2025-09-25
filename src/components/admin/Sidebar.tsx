"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE = "/admin";
const NAV = [
  { href: `${BASE}`, label: "Dashboard" },
  { href: `${BASE}/drivers`, label: "Conductores" },
  { href: `${BASE}/users`, label: "Usuarios" },
  { href: `${BASE}/trips`, label: "Viajes" },
  { href: `${BASE}/zones`, label: "Zonas" },
  { href: `${BASE}/settings`, label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-background">
      <div className="h-14 flex items-center px-4 text-lg font-semibold">
        TransporteG4
      </div>

      <nav className="flex-1 px-2 py-2 space-y-1">
        {NAV.map((item) => {
          // Activo si es exactamente la ruta o un hijo directo (evita que “Dashboard” se marque en todas)
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted",
                active ? "bg-muted font-medium" : "",
              ].join(" ")}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded bg-muted px-2 py-0.5 text-[10px]">Admin</span>
          v0.1.0
        </div>
      </div>
    </aside>
  );
}