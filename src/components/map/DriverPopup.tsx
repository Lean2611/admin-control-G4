"use client";

import { useEffect, useState } from "react";
import { getDriverById, type DriverDetail } from "@/lib/drivers";

const cache = new Map<string | number, DriverDetail | null>();

export default function DriverPopup({ id }: { id: number | string }) {
  const [data, setData] = useState<DriverDetail | null>(cache.get(id) ?? null);
  const [loading, setLoading] = useState(!cache.has(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (cache.has(id)) return;
    setLoading(true);
    getDriverById(id)
      .then((d) => { if (alive) { cache.set(id, d); setData(d); } })
      .catch((e) => { if (alive) setError(typeof e?.message === "string" ? e.message : "Error"); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="text-xs">Cargando…</div>;
  if (error) return <div className="text-xs text-red-600">Error: {error}</div>;
  if (!data) return <div className="text-xs">No se encontró el conductor #{String(id)}</div>;

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-2">
        <img
          src={data.photoUrl || "/avatar-placeholder.png"}
          alt={data.name || `Conductor ${id}`}
          className="w-10 h-10 rounded-full object-cover border"
          referrerPolicy="no-referrer"
        />
        <div>
          <div className="font-semibold">{data.name ?? `Conductor ${id}`}</div>
          {data.email && <div className="text-xs opacity-70">{data.email}</div>}
          {data.phone && <div className="text-xs opacity-70">{data.phone}</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="opacity-60">Marca</div>
        <div className="col-span-2">{data.vehicleBrand ?? "—"}</div>

        {/* <div className="opacity-60">Modelo</div>
        <div className="col-span-2">{data.vehicleModel ?? "—"}</div> */}
        <div className="opacity-60">Placa</div>
        <div className="col-span-2">{data.plate ?? "—"}</div>

        <div className="opacity-60">Color</div>
        <div className="col-span-2">{data.vehicleColor ?? "—"}</div>
      </div>
    </div>
  );
}