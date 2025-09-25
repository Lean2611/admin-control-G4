

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { listDrivers, type DriverDetail } from "@/lib/drivers";
// import DriverCard from "@/components/driver/DriverCard";
// import NewDriverFormCard from "@/components/driver/NewDriverFormCard";

// export default function DriversPage() {
//   const [drivers, setDrivers] = useState<DriverDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState("");
//   const [showNew, setShowNew] = useState(false);

//   async function refresh() {
//     setLoading(true);
//     try {
//       const d = await listDrivers();
//       setDrivers(d);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { refresh(); }, []);

//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     if (!term) return drivers;
//     return drivers.filter((d) => {
//       const hay = [
//         d.name, d.email, d.phone, d.vehicleBrand, d.vehicleModel, d.vehicleColor, d.plate
//       ].filter((x): x is string => typeof x === "string" && x.length > 0)
//        .map((x) => x.toLowerCase());
//       return hay.some((v) => v.includes(term));
//     });
//   }, [q, drivers]);

//   return (
//     <section className="space-y-4">
//       <header className="flex flex-wrap items-center gap-2">
//         <h1 className="text-xl font-semibold">Conductores</h1>
//         <span className="text-sm text-gray-500 dark:text-gray-400">
//           {loading ? "Cargando…" : `${filtered.length} resultados`}
//         </span>
//         <div className="ml-auto flex gap-2 w-full md:w-auto">
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="Buscar por nombre, email, placa…"
//             className="w-full md:w-72 border rounded-lg px-3 py-2 text-sm"
//           />
//           <button
//             onClick={() => setShowNew((s) => !s)}
//             className="px-3 py-2 border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
//           >
//             {showNew ? "Ocultar" : "Agregar conductor"}
//           </button>
//         </div>
//       </header>

//       {/* Tarjeta de creación */}
//       {showNew && (
//         <div className="w-full md:w-2/3 lg:w-1/2">
//           <NewDriverFormCard
//             onCancel={() => setShowNew(false)}
//             onCreated={() => { setShowNew(false); refresh(); }}
//           />
//         </div>
//       )}

//       {/* Grid de conductores */}
//       {loading ? (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//           {Array.from({ length: 8 }).map((_, i) => (
//             <div key={i} className="border rounded-xl p-4 bg-white/90 dark:bg-neutral-900/60 animate-pulse h-40" />
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div className="text-sm text-gray-500 dark:text-gray-400">No se encontraron conductores.</div>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//           {filtered.map((d) => (
//             <DriverCard
//               key={d.id}
//               photoUrl={d.photoUrl}
//               name={d.name}
//               email={d.email}
//               phone={d.phone}
//               vehicleBrand={d.vehicleBrand}
//               vehicleModel={d.vehicleModel}
//               vehicleColor={d.vehicleColor}
//               plate={d.plate}
//             />
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { listDrivers, type DriverDetail } from "@/lib/drivers";
import { ApiRequestHandler } from "@/lib/api";
import DriverCard from "@/components/driver/DriverCard";
import DriverDetailModal from "@/components/driver/DriverDetailModal";
import NewDriverFormCard from "@/components/driver/NewDriverFormCard"; // si ya lo tienes

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [selected, setSelected] = useState<DriverDetail | null>(null);
  const [busyAction, setBusyAction] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const d = await listDrivers();
      setDrivers(d);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return drivers;
    return drivers.filter((d) => {
      const hay = [
        d.name, d.email, d.phone, d.vehicleBrand, d.vehicleModel, d.vehicleColor, d.plate
      ].filter((x): x is string => typeof x === "string" && x.length > 0)
       .map((x) => x.toLowerCase());
      return hay.some((v) => v.includes(term));
    });
  }, [q, drivers]);

  async function handleDeleteDriver(d: DriverDetail) {
    if (!d?.id) return;
    const ok = window.confirm(`¿Eliminar al conductor "${d.name ?? d.id}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      setBusyAction(true);
      await ApiRequestHandler.delete(`/users/${d.id}`); // ajusta si tu endpoint difiere
      setDrivers((prev) => prev.filter((x) => String(x.id) !== String(d.id)));
      setSelected(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "No se pudo eliminar");
    } finally {
      setBusyAction(false);
    }
  }

  function handleEditDriver(d: DriverDetail) {
    // TODO: aquí puedes abrir un formulario de edición si quieres
    alert("Editar conductor (pendiente)");
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">Conductores</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Cargando…" : `${filtered.length} resultados`}
        </span>
        <div className="ml-auto flex gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email, placa…"
            className="w-full md:w-72 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={() => setShowNew((s) => !s)}
            className="px-3 py-2 border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            {showNew ? "Ocultar" : "Agregar conductor"}
          </button>
        </div>
      </header>

      {showNew && (
        <div className="w-full md:w-2/3 lg:w-1/2">
          <NewDriverFormCard
            onCancel={() => setShowNew(false)}
            onCreated={() => { setShowNew(false); refresh(); }}
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white/90 dark:bg-neutral-900/60 animate-pulse h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">No se encontraron conductores.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d) => (
            <DriverCard
              key={d.id}
              photoUrl={d.photoUrl}
              name={d.name}
              email={d.email}
              phone={d.phone}
              vehicleBrand={d.vehicleBrand}
              vehicleModel={d.vehicleModel}
              vehicleColor={d.vehicleColor}
              plate={d.plate}
              onClick={() => setSelected(d)} // 👈 abre modal
            />
          ))}
        </div>
      )}

      {/* Modal superpuesto */}
      {selected && (
        <DriverDetailModal
          driver={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          busy={busyAction}
        />
      )}
    </section>
  );
}