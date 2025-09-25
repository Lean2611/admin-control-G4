"use client";
import dynamic from "next/dynamic";
import type { DriverPosition } from "@/types/driver"; // <- aquí

const MapInner = dynamic(() => import("./LeafletMapInner"), { ssr: false });

export default function DriversMap({
  positions,
  center = { lat: 32.566, lng: -116.627 },
  zoom = 12,
  className = "",
  onSelectDriver,
}: {
  positions: DriverPosition[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onSelectDriver?: (id: number | string) => void; 
}) {
  return (
    <div className={className}>
      <MapInner 
      positions={positions} 
      center={center} 
      zoom={zoom} 
      onSelectDriver={onSelectDriver}
      autoFit={false}
      />
    </div>
  );
}