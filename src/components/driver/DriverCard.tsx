"use client";
import React from "react";

const PLACEHOLDER = "/11971999.png";

export default function DriverCard({
  photoUrl,
  name,
  email,
  phone,
  vehicleBrand,
  vehicleModel,
  vehicleColor,
  plate,
  onClick, // 👈 nueva prop
}: {
  photoUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  plate?: string;
  onClick?: () => void; // 👈 nueva prop
}) {
  return (
    <div
      className={[
        "border rounded-xl p-4 bg-white/90 dark:bg-neutral-900/60 hover:shadow-md transition cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500",
      ].join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
      }}
    >
      <div className="flex items-start gap-3">
        <img
          src={photoUrl || PLACEHOLDER}
          alt={name || "Conductor"}
          className="w-12 h-12 rounded-full object-cover border"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            img.onerror = null;
            img.src = PLACEHOLDER;
          }}
        />
        <div className="min-w-0">
          <div className="font-medium truncate">{name || "—"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{email || "—"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{phone || "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="border rounded p-2">
          <div className="text-gray-500">Marca</div>
          <div className="font-medium">{vehicleBrand || "—"}</div>
        </div>
        {/* <div className="border rounded p-2">
          <div className="text-gray-500">Modelo</div>
          <div className="font-medium">{vehicleModel || "—"}</div>
        </div> */}
        <div className="border rounded p-2">
          <div className="text-gray-500">Color</div>
          <div className="font-medium">{vehicleColor || "—"}</div>
        </div>
        <div className="border rounded p-2">
          <div className="text-gray-500">Placa</div>
          <div className="font-medium">{plate || "—"}</div>
        </div>
      </div>
    </div>
  );
}