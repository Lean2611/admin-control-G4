"use client";

import { useEffect, useRef } from "react";
import type { DriverDetail } from "@/lib/drivers";

const PLACEHOLDER = "/11971999.png";

export default function DriverDetailModal({
  driver,
  onClose,
  onEdit,
  onDelete,
  busy = false,
}: {
  driver: DriverDetail;
  onClose: () => void;
  onEdit?: (d: DriverDetail) => void;
  onDelete?: (d: DriverDetail) => Promise<void> | void;
  busy?: boolean;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Detalle del conductor</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 grid place-items-center rounded hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid gap-4">
          <div className="flex items-start gap-4">
            <img
              src={driver.photoUrl || PLACEHOLDER}
              alt={driver.name || "Conductor"}
              className="w-35 h-35 rounded-full object-cover border"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.onerror = null;
                img.src = PLACEHOLDER;
              }}
            />
            <div className="min-w-0">
              <div className="text-base font-medium truncate">{driver.name ?? `Conductor ${driver.id}`}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{driver.email || "—"}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{driver.phone || "—"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border rounded-lg p-3">
              <div className="text-xs text-gray-500">Marca</div>
              <div className="font-medium">{driver.vehicleBrand || "—"}</div>
            </div>
            {/* <div className="border rounded-lg p-3">
              <div className="text-xs text-gray-500">Modelo</div>
              <div className="font-medium">{driver.vehicleModel || "—"}</div>
            </div> */}
            <div className="border rounded-lg p-3">
              <div className="text-xs text-gray-500">Color</div>
              <div className="font-medium">{driver.vehicleColor || "—"}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs text-gray-500">Placa</div>
              <div className="font-medium">{driver.plate || "—"}</div>
            </div>
          </div>
        </div>

        {/* Footer acciones */}
        <div className="p-4 border-t flex gap-2 justify-end">
          <button
            onClick={() => onEdit?.(driver)}
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm"
            disabled={busy}
          >
            Editar información
          </button>
          <button
            onClick={() => onDelete?.(driver)}
            className="px-3 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 text-sm disabled:opacity-60"
            disabled={busy}
          >
            Eliminar conductor
          </button>
        </div>
      </div>
    </div>
  );
}