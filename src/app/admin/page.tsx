"use client";

import { useState } from "react";
import DriversMap from "@/components/map/DriversMap";
import { useDriversPositionsSocket } from "@/hooks/useDriversPositionsSocket";
import DriverInfoCard from "@/components/driver/DriverInfoCard";

export default function Page() {
  const positions = useDriversPositionsSocket();
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  return (
    <section className="grid gap-4">
      <div className="w-full h-[60vh] border rounded overflow-hidden">
        <DriversMap
          positions={positions.map(p => ({
            id: p.id_driver,
            driverId: p.id_driver,
            name: `Driver ${p.id_driver}`,
            lat: p.lat,
            lng: p.lng,
            updatedAt: p.updatedAt,
            online: true,
          }))}
          className="w-full h-full"
          onSelectDriver={(id) => setSelectedId(id)} // ⬅️ selecciona para la card
        />
      </div>

      {/* Tarjeta fija debajo del mapa */}
      {selectedId && (
        <div className="w-full md:w-1/2 md:mx-auto">
        <DriverInfoCard id={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-4">Conductores conectados: {positions.length}</div>
        <div className="border rounded p-4">Viajes hoy: 0</div>
        <div className="border rounded p-4">Usuarios en línea: 0</div>
      </div>
    </section>
  );
}