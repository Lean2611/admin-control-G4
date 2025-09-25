"use client";

import { useMemo, useState } from "react";
import { createDriver, type NewDriverInput, type DriverDetail } from "@/lib/drivers";

export default function NewDriverFormCard({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated?: (d: DriverDetail) => void;
}) {
  const [form, setForm] = useState<NewDriverInput>({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    vehicleBrand: "",
    plate: "",
    vehicleColor: "",
    imageFile: null,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!form.imageFile) return null;
    return URL.createObjectURL(form.imageFile);
  }, [form.imageFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createDriver(form);
      onCreated?.(created);
      onCancel?.();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error al crear conductor";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded-2xl overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/60">
      <div className="h-16 bg-gradient-to-r from-indigo-500/15 via-sky-500/15 to-cyan-500/15" />
      <form onSubmit={handleSubmit} className="-mt-8 p-4 space-y-4">
        {/* Foto + datos básicos */}
        <div className="flex items-start gap-4">
          <label className="w-20 h-20 rounded-full overflow-hidden border grid place-items-center bg-gray-50 dark:bg-neutral-800 cursor-pointer">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-500">Foto</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setForm((s) => ({ ...s, imageFile: f }));
              }}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3 flex-1">
            <div>
              <label className="text-xs">Nombre</label>
              <input
                required
                className="w-full border rounded px-3 py-2"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs">Apellido</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={form.lastName}
                onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs">Email</label>
              <input
                required
                type="email"
                className="w-full border rounded px-3 py-2"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs">Teléfono</label>
              <input
                required
                className="w-full border rounded px-3 py-2"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs">Contraseña</label>
              <input
                required
                type="password"
                className="w-full border rounded px-3 py-2"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Vehículo */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs">Marca</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.vehicleBrand}
              onChange={(e) => setForm((s) => ({ ...s, vehicleBrand: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs">Placa</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.plate}
              onChange={(e) => setForm((s) => ({ ...s, plate: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs">Color</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.vehicleColor}
              onChange={(e) => setForm((s) => ({ ...s, vehicleColor: e.target.value }))}
            />
          </div>
        </div>

        {/* Acciones */}
        {error && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded p-2">
            {error}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm"
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-2 border rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}