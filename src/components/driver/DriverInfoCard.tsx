// "use client";

// import { useEffect, useState } from "react";
// import { getDriverById, type DriverDetail } from "@/lib/drivers";

// const cache = new Map<string | number, DriverDetail | null>();

// export default function DriverInfoCard({
//   id,
//   onClose,
// }: {
//   id: number | string;
//   onClose?: () => void;
// }) {
//   const [data, setData] = useState<DriverDetail | null>(cache.get(id) ?? null);
//   const [loading, setLoading] = useState(!cache.has(id));
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let alive = true;
//     if (!cache.has(id)) {
//       setLoading(true);
//       getDriverById(id)
//         .then((d) => { if (alive) { cache.set(id, d); setData(d); } })
//         .catch((e) => { if (alive) setError(typeof e?.message === "string" ? e.message : "Error"); })
//         .finally(() => { if (alive) setLoading(false); });
//     } else {
//       setData(cache.get(id) ?? null);
//     }
//     return () => { alive = false; };
//   }, [id]);

//   return (
//     <div className="border rounded-lg p-4 bg-background">
//       <div className="flex items-start gap-3">
//         <img
//           src={data?.photoUrl || "/avatar-placeholder.png"}
//           alt={data?.name || `Conductor ${id}`}
//           className="w-14 h-14 rounded-full object-cover border"
//           referrerPolicy="no-referrer"
//         />
//         <div className="flex-1">
//           <div className="flex items-center gap-2">
//             <h3 className="text-base font-semibold mb-1">
//               {loading ? "Cargando…" : (data?.name ?? `Conductor ${id}`)}
//             </h3>
//             {onClose && (
//               <button onClick={onClose} className="ml-auto text-xs border rounded px-2 py-1 hover:bg-muted">
//                 Cerrar
//               </button>
//             )}
//           </div>
//           {error && <div className="text-xs text-red-600">Error: {error}</div>}
//           {!error && !loading && (
//             <div className="grid grid-cols-3 gap-y-1 text-sm">
//               <div className="opacity-60">Email</div>
//               <div className="col-span-2">{data?.email ?? "—"}</div>

//               <div className="opacity-60">Teléfono</div>
//               <div className="col-span-2">{data?.phone ?? "—"}</div>

//               <div className="opacity-60">Marca</div>
//               <div className="col-span-2">{data?.vehicleBrand ?? "—"}</div>

//               {/* <div className="opacity-60">Modelo</div>
//               <div className="col-span-2">{data?.vehicleModel ?? "—"}</div> */}

//               <div className="opacity-60">Color</div>
//               <div className="col-span-2">{data?.vehicleColor ?? "—"}</div>

//               <div className="opacity-60">Placa</div>
//               <div className="col-span-2">{data?.plate ?? "—"}</div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getDriverById, type DriverDetail } from "@/lib/drivers";

// Cache simple para evitar re-fetch en la misma sesión
const cache = new Map<string | number, DriverDetail | null>();

// Mapea nombres de color comunes (ES/EN) a valores CSS
function colorToCss(name?: string): string | undefined {
  if (!name) return;
  const table: Record<string, string> = {
    rojo: "#ef4444",
    red: "#ef4444",
    azul: "#3b82f6",
    blue: "#3b82f6",
    verde: "#22c55e",
    green: "#22c55e",
    negro: "#111827",
    black: "#111827",
    blanco: "#f3f4f6",
    white: "#f3f4f6",
    gris: "#6b7280",
    gray: "#6b7280",
    plateado: "#9ca3af",
    silver: "#9ca3af",
    dorado: "#f59e0b",
    gold: "#f59e0b",
    amarillo: "#facc15",
    yellow: "#facc15",
    naranja: "#fb923c",
    orange: "#fb923c",
    morado: "#8b5cf6",
    purple: "#8b5cf6",
    café: "#b45309",
    cafe: "#b45309",
    brown: "#b45309",
    rosa: "#ec4899",
    pink: "#ec4899",
  };

  // normaliza: minúsculas, sin acentos, quita extras
  const norm = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // intenta match exacto
  if (table[norm]) return table[norm];

  // intenta por "contiene" (ej: "rojo me", "rojo metalizado")
  const key = Object.keys(table).find((k) => norm.includes(k));
  return key ? table[key] : undefined;
}

function SkeletonCard() {
  return (
    <div className="border rounded-2xl p-4 shadow-sm bg-white/90 dark:bg-neutral-900/60">
      <div className="h-20 rounded-xl bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 mb-4" />
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-3 w-56 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function DriverInfoCard({
  id,
  onClose,
}: {
  id: number | string;
  onClose?: () => void;
}) {
  const [data, setData] = useState<DriverDetail | null>(cache.get(id) ?? null);
  const [loading, setLoading] = useState(!cache.has(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!cache.has(id)) {
      setLoading(true);
      getDriverById(id)
        .then((d) => {
          if (alive) {
            cache.set(id, d);
            setData(d);
          }
        })
        .catch((e) => {
          if (alive) {
            setError(typeof e?.message === "string" ? e.message : "Error");
            cache.set(id, null);
          }
        })
        .finally(() => alive && setLoading(false));
    } else {
      setData(cache.get(id) ?? null);
    }
    return () => {
      alive = false;
    };
  }, [id]);

  const colorCss = useMemo(() => colorToCss(data?.vehicleColor), [data?.vehicleColor]);

  if (loading) return <SkeletonCard />;
  if (error) {
    return (
      <div className="border rounded-2xl p-4 shadow-sm bg-white/90 dark:bg-neutral-900/60 text-sm">
        <div className="flex items-center gap-2 text-red-600">
          <span>⚠️</span>
          <span>Error: {error}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-xs border rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="border rounded-2xl p-4 shadow-sm bg-white/90 dark:bg-neutral-900/60 text-sm">
        <div className="flex items-center gap-2">
          <span>ℹ️</span>
          <span>No se encontró el conductor #{String(id)}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-xs border rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  const telHref = data.phone ? `tel:${data.phone.replace(/[^\d+]/g, "")}` : undefined;
  const waHref  = data.phone ? `https://wa.me/${data.phone.replace(/[^\d]/g, "")}` : undefined;

  return (
    <div className="border rounded-2xl overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/60">
      {/* Header con gradiente */}
      <div className="h-20 bg-gradient-to-r from-indigo-500/15 via-sky-500/15 to-cyan-500/15" />

      <div className="p-4">
        {/* Avatar + nombre */}
        <div className="flex items-start gap-3 -mt-12 mb-2">
          <img
            src={data.photoUrl || "/11971999.png"}
            alt={data.name || `Conductor ${id}`}
            className="w-25 h-25 rounded-full object-cover ring-4 ring-white dark:ring-neutral-900 border"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-tight">
                {data.name ?? `Conductor ${id}`}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                ID: {String(id)}
              </span>
              {onClose && (
                <button
                  onClick={onClose}
                  className="ml-auto text-xs border rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  Cerrar
                </button>
              )}
            </div>

            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
              {data.email && (
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-70"><path fill="currentColor" d="M12 13L2 6.76V18h20V6.76L12 13Zm0-2L2 4h20L12 11Z"/></svg>
                  <span>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-70"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.85 22 2 13.15 2 2a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.59a1 1 0 01-.25 1.01l-2.2 2.2Z"/></svg>
                  <span>{data.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chips vehículo */}
        <div className="mt-2 flex flex-wrap gap-2">
          {data.vehicleBrand && (
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              🚗 {data.vehicleBrand}
            </span>
          )}
          {data.vehicleModel && (
            <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
              📦 {data.vehicleModel}
            </span>
          )}
          {data.plate && (
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              🏷️ {data.plate}
            </span>
          )}
          {data.vehicleColor && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-50 dark:bg-neutral-800 border border-gray-200/70 dark:border-neutral-700">
              <span
                className="inline-block w-3 h-3 rounded-full border"
                style={{ background: colorCss ?? "#9ca3af" }}
                title={data.vehicleColor}
              />
              {data.vehicleColor}
            </span>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* {telHref && (
            <a
              href={telHref}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-neutral-800 inline-flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V21a1 1 0 01-1 1C10.85 22 2 13.15 2 2a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.59a1 1 0 01-.25 1.01l-2.2 2.2Z"/></svg>
              Llamar
            </a>
          )} */}
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-neutral-800 inline-flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.52 3.48A11.88 11.88 0 0012 0C5.37 0 0 5.37 0 12a11.84 11.84 0 001.72 6.14L0 24l5.99-1.57A11.9 11.9 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.24-6.2-3.48-8.52Zm-8.52 19.02a9.89 9.89 0 01-5.04-1.38l-.36-.21-3.56.93.95-3.47-.24-.36A9.86 9.86 0 012.11 12c0-5.45 4.44-9.89 9.89-9.89S21.89 6.55 21.89 12 17.45 22.5 12 22.5Zm5.49-7.42c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.9-2.22-.24-.6-.48-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.09 3.2 5.06 4.48.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.08-.12-.27-.2-.57-.35Z"/></svg>
              WhatsApp
            </a>
          )}
          {/* <Link
            href={`/admin/drivers/${id}`}
            className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-neutral-800 inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 00-2 2v16l4-4h6a2 2 0 002-2V4a2 2 0 00-2-2Z"/></svg>
            Ver perfil
          </Link> */}
        </div>
      </div>
    </div>
  );
}